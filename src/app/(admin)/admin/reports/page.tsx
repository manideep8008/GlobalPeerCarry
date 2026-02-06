import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ReportReviewCard } from "@/components/admin/report-review-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReportWithProfiles } from "@/types";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("*, reporter:profiles!reporter_id(*), reported_user:profiles!reported_user_id(*)")
    .order("created_at", { ascending: false });

  const typedReports = (reports || []) as unknown as ReportWithProfiles[];

  const pendingReports = typedReports.filter((r) => r.status === "pending");
  const reviewingReports = typedReports.filter((r) => r.status === "reviewing");
  const resolvedReports = typedReports.filter((r) => r.status === "resolved");
  const dismissedReports = typedReports.filter((r) => r.status === "dismissed");

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Reports"
        description="Review and manage user reports"
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingReports.length})
          </TabsTrigger>
          <TabsTrigger value="reviewing">
            Reviewing ({reviewingReports.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedReports.length})
          </TabsTrigger>
          <TabsTrigger value="dismissed">
            Dismissed ({dismissedReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingReports.length > 0 ? (
            pendingReports.map((report) => (
              <ReportReviewCard key={report.id} report={report} />
            ))
          ) : (
            <EmptyState
              title="No pending reports"
              description="All reports have been reviewed"
            />
          )}
        </TabsContent>

        <TabsContent value="reviewing" className="mt-4 space-y-3">
          {reviewingReports.length > 0 ? (
            reviewingReports.map((report) => (
              <ReportReviewCard key={report.id} report={report} />
            ))
          ) : (
            <EmptyState
              title="No reports under review"
              description="No reports are currently being reviewed"
            />
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 space-y-3">
          {resolvedReports.length > 0 ? (
            resolvedReports.map((report) => (
              <ReportReviewCard key={report.id} report={report} />
            ))
          ) : (
            <EmptyState
              title="No resolved reports"
              description="No reports have been resolved yet"
            />
          )}
        </TabsContent>

        <TabsContent value="dismissed" className="mt-4 space-y-3">
          {dismissedReports.length > 0 ? (
            dismissedReports.map((report) => (
              <ReportReviewCard key={report.id} report={report} />
            ))
          ) : (
            <EmptyState
              title="No dismissed reports"
              description="No reports have been dismissed"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
