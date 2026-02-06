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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    // Fetch parcel
    const { data: parcel, error: parcelError } = await supabase
      .from("parcels")
      .select("*")
      .eq("id", parcelId)
      .single();

    if (parcelError || !parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    // Only admin or sender can request refund (carrier can reject which triggers refund)
    const isAdmin = profile?.is_admin;
    const isSender = parcel.sender_id === user.id;
    const isCarrier = parcel.carrier_id === user.id;

    if (!isAdmin && !isSender && !isCarrier) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if payment exists
    if (!parcel.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: "No payment found to refund" },
        { status: 400 }
      );
    }

    // Check escrow status
    if (parcel.escrow_status === "refunded") {
      return NextResponse.json({
        success: true,
        message: "Already refunded",
      });
    }

    if (parcel.escrow_status === "released") {
      return NextResponse.json(
        { error: "Cannot refund - payment already released to carrier" },
        { status: 400 }
      );
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: parcel.stripe_payment_intent_id,
      reason: "requested_by_customer",
      metadata: {
        parcel_id: parcelId,
        refunded_by: user.id,
        is_admin_refund: isAdmin ? "true" : "false",
      },
    });

    // Update parcel status
    const { error: updateError } = await supabase
      .from("parcels")
      .update({
        status: "cancelled",
        escrow_status: "refunded",
      })
      .eq("id", parcelId);

    if (updateError) {
      console.error("Failed to update parcel after refund:", updateError);
    }

    // Restore trip available weight if booking was accepted
    if (parcel.status === "accepted" || parcel.status === "in_transit") {
      const { data: trip } = await supabase
        .from("trips")
        .select("available_weight_kg")
        .eq("id", parcel.trip_id)
        .single();

      if (trip) {
        await supabase
          .from("trips")
          .update({
            available_weight_kg: trip.available_weight_kg + parcel.weight_kg,
          })
          .eq("id", parcel.trip_id);
      }
    }

    // Log refund transaction
    await supabase.from("payment_transactions").insert({
      parcel_id: parcelId,
      type: "refund",
      stripe_id: refund.id,
      amount_cents: dollarsToCents(parcel.total_price),
      status: refund.status,
      metadata: {
        payment_intent_id: parcel.stripe_payment_intent_id,
        refunded_by: user.id,
        is_admin_refund: isAdmin,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
      refund_id: refund.id,
    });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
