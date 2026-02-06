import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { KycReviewCard } from "@/components/admin/kyc-review-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KycDocument, Profile } from "@/types";

export default async function AdminKycPage() {
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("kyc_documents")
    .select("*, user:profiles!user_id(*)")
    .order("created_at", { ascending: false });

  const typedDocs = (documents || []) as unknown as (KycDocument & { user: Profile })[];

  const pendingDocs = typedDocs.filter((d) => d.review_status === "pending");
  const approvedDocs = typedDocs.filter((d) => d.review_status === "approved");
  const rejectedDocs = typedDocs.filter((d) => d.review_status === "rejected");

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC Verification"
        description="Review identity verification submissions"
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingDocs.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedDocs.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedDocs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingDocs.length > 0 ? (
            pendingDocs.map((doc) => (
              <KycReviewCard key={doc.id} document={doc} />
            ))
          ) : (
            <EmptyState
              title="No pending submissions"
              description="All KYC submissions have been reviewed"
            />
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4 space-y-3">
          {approvedDocs.length > 0 ? (
            approvedDocs.map((doc) => (
              <KycReviewCard key={doc.id} document={doc} />
            ))
          ) : (
            <EmptyState
              title="No approved submissions"
              description="No documents have been approved yet"
            />
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4 space-y-3">
          {rejectedDocs.length > 0 ? (
            rejectedDocs.map((doc) => (
              <KycReviewCard key={doc.id} document={doc} />
            ))
          ) : (
            <EmptyState
              title="No rejected submissions"
              description="No documents have been rejected"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
