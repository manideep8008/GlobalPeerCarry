import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import {
  dollarsToCents,
  getCheckoutSuccessUrl,
  getCheckoutCancelUrl,
  STRIPE_CURRENCY,
} from "@/lib/stripe/config";

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

    // Fetch parcel with trip info
    const { data: parcel, error: parcelError } = await supabase
      .from("parcels")
      .select(
        `
        *,
        trip:trips(*)
      `
      )
      .eq("id", parcelId)
      .single();

    if (parcelError || !parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    // Verify user is the carrier
    if (parcel.carrier_id !== user.id) {
      return NextResponse.json(
        { error: "Only the carrier can accept this booking" },
        { status: 403 }
      );
    }

    // Verify parcel status
    if (parcel.status !== "pending") {
      return NextResponse.json(
        { error: "This booking has already been processed" },
        { status: 400 }
      );
    }

    // Calculate amount in cents
    const amountCents = dollarsToCents(parcel.total_price);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CURRENCY,
            product_data: {
              name: `Delivery: ${parcel.title}`,
              description: `${parcel.trip.origin} → ${parcel.trip.destination} (${parcel.weight_kg} kg)`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: getCheckoutSuccessUrl(parcelId),
      cancel_url: getCheckoutCancelUrl(parcelId),
      metadata: {
        parcel_id: parcelId,
        carrier_id: parcel.carrier_id,
        sender_id: parcel.sender_id,
        trip_id: parcel.trip_id,
      },
      payment_intent_data: {
        metadata: {
          parcel_id: parcelId,
          carrier_id: parcel.carrier_id,
          sender_id: parcel.sender_id,
        },
      },
    });

    // Update parcel with session ID
    const { error: updateError } = await supabase
      .from("parcels")
      .update({
        stripe_session_id: session.id,
      })
      .eq("id", parcelId);

    if (updateError) {
      console.error("Failed to update parcel with session ID:", updateError);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
