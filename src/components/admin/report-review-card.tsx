"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
} from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Check, X, Loader2, Ban, ExternalLink } from "lucide-react";
import type { ReportWithProfiles, ReportStatus } from "@/types";

interface ReportReviewCardProps {
  report: ReportWithProfiles;
}

export function ReportReviewCard({ report }: ReportReviewCardProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(report.admin_notes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBanning, setIsBanning] = useState(false);

  const updateStatus = async (status: ReportStatus) => {
    setIsUpdating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("reports")
      .update({
        status,
        admin_notes: notes,
        resolved_by: user?.id,
      })
      .eq("id", report.id);

    setIsUpdating(false);

    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }

    toast.success(`Report marked as ${REPORT_STATUS_LABELS[status].toLowerCase()}`);
    router.refresh();
  };

  const handleBanUser = async () => {
    setIsBanning(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: true })
      .eq("id", report.reported_user_id);

    setIsBanning(false);

    if (error) {
      toast.error("Failed to ban user: " + error.message);
      return;
    }

    toast.success("User has been banned");
    router.refresh();
  };

  const isPending = report.status === "pending" || report.status === "reviewing";

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge className={REPORT_STATUS_COLORS[report.status]}>
              {REPORT_STATUS_LABELS[report.status]}
            </Badge>
            <Badge variant="outline">
              {REPORT_REASON_LABELS[report.reason]}
            </Badge>
          </div>
          <span className="text-xs text-slate-400">
            {format(new Date(report.created_at), "MMM d, yyyy")}
          </span>
        </div>

        {/* Users */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Reporter</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={report.reporter.avatar_url} />
                <AvatarFallback className="text-xs bg-slate-200">
                  {report.reporter.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/profile/${report.reporter_id}`}
                className="text-sm font-medium hover:underline"
              >
                {report.reporter.full_name}
              </Link>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Reported User</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={report.reported_user.avatar_url} />
                <AvatarFallback className="text-xs bg-red-100 text-red-800">
                  {report.reported_user.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/profile/${report.reported_user_id}`}
                className="text-sm font-medium hover:underline"
              >
                {report.reported_user.full_name}
              </Link>
              {report.reported_user.is_banned && (
                <Badge variant="destructive" className="text-xs">Banned</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-sm text-slate-700">{report.description}</p>
        </div>

        {/* Related booking link */}
        {report.parcel_id && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/bookings/${report.parcel_id}`}>
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              View Related Booking
            </Link>
          </Button>
        )}

        {/* Admin Actions */}
        {isPending && (
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor={`notes-${report.id}`} className="text-sm">
                Admin Notes
              </Label>
              <Textarea
                id={`notes-${report.id}`}
                placeholder="Add notes about this report..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {report.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus("reviewing")}
                  disabled={isUpdating}
                >
                  Mark as Reviewing
                </Button>
              )}

              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => updateStatus("resolved")}
                disabled={isUpdating}
              >
                {isUpdating && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                <Check className="mr-1 h-4 w-4" />
                Resolve
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus("dismissed")}
                disabled={isUpdating}
              >
                <X className="mr-1 h-4 w-4" />
                Dismiss
              </Button>

              {!report.reported_user.is_banned && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBanUser}
                  disabled={isBanning}
                >
                  {isBanning && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  <Ban className="mr-1 h-4 w-4" />
                  Ban User
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
