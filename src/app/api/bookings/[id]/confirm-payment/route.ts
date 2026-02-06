import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { dollarsToCents } from "@/lib/stripe/config";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: parcelId } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch parcel
    const { data: parcel, error: parcelError } = await supabase
      .from("parcels")
      .select("*, trip:trips(*)")
      .eq("id", parcelId)
      .single();

    if (parcelError || !parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    // Verify user is involved in this booking
    if (parcel.carrier_id !== user.id && parcel.sender_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if already confirmed with payment held
    if (parcel.escrow_status === "held") {
      return NextResponse.json({
        success: true,
        message: "Payment already confirmed",
      });
    }

    // Verify Stripe session if exists
    if (parcel.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(
        parcel.stripe_session_id
      );

      if (session.payment_status !== "paid") {
        return NextResponse.json(
          { error: "Payment not completed" },
          { status: 400 }
        );
      }

      // Get payment intent for logging
      const paymentIntentId = session.payment_intent as string;

      // NEW FLOW: Sender paid, so:
      // - escrow_status -> "held" (money is secured)
      // - status stays "pending" (waiting for carrier to accept)
      // - paid_at is set
      const { error: updateError } = await supabase
        .from("parcels")
        .update({
          escrow_status: "held",
          stripe_payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
        })
        .eq("id", parcelId);

      if (updateError) {
        console.error("Failed to update parcel:", updateError);
        return NextResponse.json(
          { error: "Failed to update booking status" },
          { status: 500 }
        );
      }

      // Log payment transaction
      await supabase.from("payment_transactions").insert({
        parcel_id: parcelId,
        type: "charge",
        stripe_id: paymentIntentId,
        amount_cents: dollarsToCents(parcel.total_price),
        status: "succeeded",
        metadata: {
          session_id: parcel.stripe_session_id,
          carrier_id: parcel.carrier_id,
          sender_id: parcel.sender_id,
          payment_type: "sender_booking",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment confirmed! Waiting for carrier to accept.",
      });
    }

    return NextResponse.json(
      { error: "No payment session found" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
