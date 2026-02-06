import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  dollarsToCents,
  calculateCarrierPayout,
  calculatePlatformFee,
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

    // Fetch parcel
    const { data: parcel, error: parcelError } = await supabase
      .from("parcels")
      .select("*")
      .eq("id", parcelId)
      .single();

    if (parcelError || !parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    // Verify user is the carrier (only carrier confirms delivery)
    if (parcel.carrier_id !== user.id) {
      return NextResponse.json(
        { error: "Only the carrier can release payment" },
        { status: 403 }
      );
    }

    // Verify parcel status is delivered
    if (parcel.status !== "delivered") {
      return NextResponse.json(
        { error: "Delivery must be confirmed first" },
        { status: 400 }
      );
    }

    // Verify escrow status is held
    if (parcel.escrow_status !== "held") {
      if (parcel.escrow_status === "released") {
        return NextResponse.json({
          success: true,
          message: "Payment already released",
        });
      }
      return NextResponse.json(
        { error: "Payment not in escrow" },
        { status: 400 }
      );
    }

    const amountCents = dollarsToCents(parcel.total_price);
    const payoutAmount = calculateCarrierPayout(amountCents);
    const platformFee = calculatePlatformFee(amountCents);

    // Update parcel escrow status to released
    const { error: updateError } = await supabase
      .from("parcels")
      .update({
        escrow_status: "released",
        payout_at: new Date().toISOString(),
      })
      .eq("id", parcelId);

    if (updateError) {
      console.error("Failed to release payment:", updateError);
      return NextResponse.json(
        { error: "Failed to release payment" },
        { status: 500 }
      );
    }

    // Log payout transaction
    // In MVP, this is just a record - actual payout would be manual or via Stripe Connect
    await supabase.from("payment_transactions").insert({
      parcel_id: parcelId,
      type: "payout",
      stripe_id: `payout_${parcelId}_${Date.now()}`, // Placeholder ID for MVP
      amount_cents: payoutAmount,
      status: "pending", // Would be "paid" when actually transferred
      metadata: {
        carrier_id: parcel.carrier_id,
        platform_fee_cents: platformFee,
        total_cents: amountCents,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment released to carrier",
      payout: {
        total_cents: amountCents,
        platform_fee_cents: platformFee,
        carrier_payout_cents: payoutAmount,
      },
    });
  } catch (error) {
    console.error("Release payment error:", error);
    return NextResponse.json(
      { error: "Failed to release payment" },
      { status: 500 }
    );
  }
}
