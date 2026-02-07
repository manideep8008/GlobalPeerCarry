import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dollarsToCents } from "@/lib/stripe/config";
import { notifyPaymentConfirmed, notifyBookingRejected } from "@/lib/notifications/service";
import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
}

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are not set");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, supabaseAdmin);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent, supabaseAdmin);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge, supabaseAdmin);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabaseAdmin: any
) {
  const parcelId = session.metadata?.parcel_id;

  if (!parcelId) {
    console.error("No parcel_id in session metadata");
    return;
  }

  // Fetch parcel with sender and carrier profiles
  const { data: parcel, error: parcelError } = await supabaseAdmin
    .from("parcels")
    .select("*, trip:trips(*), sender:profiles!parcels_sender_id_fkey(*), carrier:profiles!parcels_carrier_id_fkey(*)")
    .eq("id", parcelId)
    .single();

  if (parcelError || !parcel) {
    console.error("Parcel not found:", parcelId);
    return;
  }

  // Skip if already processed
  if (parcel.status === "accepted" && parcel.escrow_status === "held") {
    console.log("Payment already confirmed for parcel:", parcelId);
    return;
  }

  const paymentIntentId = session.payment_intent as string;

  // Update parcel status
  const { error: updateError } = await supabaseAdmin
    .from("parcels")
    .update({
      status: "accepted",
      escrow_status: "held",
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", parcelId);

  if (updateError) {
    console.error("Failed to update parcel:", updateError);
    return;
  }

  // Update trip available weight
  const newAvailableWeight =
    parcel.trip.available_weight_kg - parcel.weight_kg;
  await supabaseAdmin
    .from("trips")
    .update({
      available_weight_kg: Math.max(0, newAvailableWeight),
    })
    .eq("id", parcel.trip_id);

  // Log payment transaction
  await supabaseAdmin.from("payment_transactions").insert({
    parcel_id: parcelId,
    type: "charge",
    stripe_id: paymentIntentId,
    amount_cents: session.amount_total || dollarsToCents(parcel.total_price),
    status: "succeeded",
    metadata: {
      session_id: session.id,
      webhook_event: "checkout.session.completed",
    },
  });

  console.log("Payment confirmed via webhook for parcel:", parcelId);

  // Send notification to carrier about new paid booking
  try {
    const { data: carrierAuth } = await supabaseAdmin.auth.admin.getUserById(
      parcel.carrier_id
    );
    if (carrierAuth?.user?.email && parcel.carrier && parcel.sender) {
      await notifyPaymentConfirmed(
        parcel.carrier_id,
        parcel.carrier.full_name,
        carrierAuth.user.email,
        parcel.title,
        parcel.sender.full_name,
        parcelId
      );
    }
  } catch (notifyError) {
    console.error("Failed to send notification:", notifyError);
  }
}

async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabaseAdmin: any
) {
  const parcelId = paymentIntent.metadata?.parcel_id;

  if (!parcelId) {
    // Not a GlobalCarry payment
    return;
  }

  // Check if already processed
  const { data: parcel } = await supabaseAdmin
    .from("parcels")
    .select("status, escrow_status")
    .eq("id", parcelId)
    .single();

  if (parcel?.status === "accepted" && parcel?.escrow_status === "held") {
    // Already processed
    return;
  }

  // Update parcel if not already done
  await supabaseAdmin
    .from("parcels")
    .update({
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq("id", parcelId);

  console.log("Payment intent succeeded for parcel:", parcelId);
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
  supabaseAdmin: any
) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    return;
  }

  // Find parcel by payment intent
  const { data: parcel, error } = await supabaseAdmin
    .from("parcels")
    .select("id, escrow_status, total_price, trip_id, weight_kg, status, sender_id, title, sender:profiles!parcels_sender_id_fkey(*)")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single();

  if (error || !parcel) {
    console.log("No parcel found for refunded payment intent:", paymentIntentId);
    return;
  }

  // Skip if already refunded
  if (parcel.escrow_status === "refunded") {
    return;
  }

  // Update parcel status
  await supabaseAdmin
    .from("parcels")
    .update({
      status: "cancelled",
      escrow_status: "refunded",
    })
    .eq("id", parcel.id);

  // Restore trip capacity if needed
  if (parcel.status === "accepted" || parcel.status === "in_transit") {
    const { data: trip } = await supabaseAdmin
      .from("trips")
      .select("available_weight_kg")
      .eq("id", parcel.trip_id)
      .single();

    if (trip) {
      await supabaseAdmin
        .from("trips")
        .update({
          available_weight_kg: trip.available_weight_kg + parcel.weight_kg,
        })
        .eq("id", parcel.trip_id);
    }
  }

  // Log refund if not already logged
  const { data: existingRefund } = await supabaseAdmin
    .from("payment_transactions")
    .select("id")
    .eq("stripe_id", charge.id)
    .eq("type", "refund")
    .single();

  if (!existingRefund) {
    await supabaseAdmin.from("payment_transactions").insert({
      parcel_id: parcel.id,
      type: "refund",
      stripe_id: charge.id,
      amount_cents: charge.amount_refunded,
      status: "succeeded",
      metadata: {
        payment_intent_id: paymentIntentId,
        webhook_event: "charge.refunded",
      },
    });
  }

  console.log("Refund processed via webhook for parcel:", parcel.id);

  // Send notification to sender about refund
  try {
    const { data: senderAuth } = await supabaseAdmin.auth.admin.getUserById(
      parcel.sender_id
    );
    if (senderAuth?.user?.email && parcel.sender) {
      await notifyBookingRejected(
        parcel.sender_id,
        parcel.sender.full_name,
        senderAuth.user.email,
        parcel.title,
        parcel.id
      );
    }
  } catch (notifyError) {
    console.error("Failed to send refund notification:", notifyError);
  }
}
