import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { UserManagementCard } from "@/components/admin/user-management-card";
import type { Profile } from "@/types";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const typedProfiles = (profiles || []) as unknown as Profile[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description={`${typedProfiles.length} total users`}
      />

      <div className="space-y-3">
        {typedProfiles.map((profile) => (
          <UserManagementCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
}
