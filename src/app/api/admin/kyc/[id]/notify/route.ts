import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notifyKycApproved, notifyKycRejected } from "@/lib/notifications/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params;
  const supabase = await createClient();

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!adminProfile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status, reason } = body;

  if (!status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Get KYC document and user
  const { data: kycDoc, error: kycError } = await supabase
    .from("kyc_documents")
    .select(
      `
      *,
      user:profiles(*)
    `
    )
    .eq("id", documentId)
    .single();

  if (kycError || !kycDoc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Get user email using admin client
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userAuth } = await adminClient.auth.admin.getUserById(
    kycDoc.user_id
  );

  if (userAuth?.user?.email) {
    if (status === "approved") {
      await notifyKycApproved(
        kycDoc.user_id,
        kycDoc.user.full_name,
        userAuth.user.email
      );
    } else {
      await notifyKycRejected(
        kycDoc.user_id,
        kycDoc.user.full_name,
        userAuth.user.email,
        reason
      );
    }
  }

  return NextResponse.json({ success: true });
}
