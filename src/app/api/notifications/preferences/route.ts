import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_PREFERENCES = {
  email_payment_confirmed: true,
  email_booking_accepted: true,
  email_booking_rejected: true,
  email_delivery_confirmed: true,
  email_in_transit: true,
  email_new_message: false,
  email_kyc_updates: true,
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return defaults if no preferences exist
  const preferences = data || DEFAULT_PREFERENCES;

  return NextResponse.json({ preferences });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Only allow updating valid preference fields
  const validFields = [
    "email_payment_confirmed",
    "email_booking_accepted",
    "email_booking_rejected",
    "email_delivery_confirmed",
    "email_in_transit",
    "email_new_message",
    "email_kyc_updates",
  ];

  const updates: Record<string, boolean> = {};
  for (const field of validFields) {
    if (typeof body[field] === "boolean") {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Upsert preferences
  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: user.id,
      ...updates,
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
