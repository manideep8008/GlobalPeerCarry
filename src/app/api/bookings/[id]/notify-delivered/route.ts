import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notifyDeliveryConfirmed } from "@/lib/notifications/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: parcelId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch parcel with sender details
  const { data: parcel, error: parcelError } = await supabase
    .from("parcels")
    .select(
      `
      *,
      sender:profiles!parcels_sender_id_fkey(*)
    `
    )
    .eq("id", parcelId)
    .single();

  if (parcelError || !parcel) {
    return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
  }

  // Verify user is the carrier
  if (parcel.carrier_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get sender email using admin client
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: senderAuth } = await adminClient.auth.admin.getUserById(
    parcel.sender_id
  );

  if (senderAuth?.user?.email) {
    await notifyDeliveryConfirmed(
      parcel.sender_id,
      parcel.sender.full_name,
      senderAuth.user.email,
      parcel.title,
      parcelId
    );
  }

  return NextResponse.json({ success: true });
}
