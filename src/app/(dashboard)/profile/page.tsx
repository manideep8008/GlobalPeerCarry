import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import type { Profile, KycDocument } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  // Fetch latest KYC document for the user
  const { data: kycDoc } = await supabase
    .from("kyc_documents")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profile" description="Manage your account details" />
      <ProfileForm
        profile={profile as unknown as Profile}
        existingKycDocument={kycDoc as unknown as KycDocument | null}
      />
    </div>
  );
}
