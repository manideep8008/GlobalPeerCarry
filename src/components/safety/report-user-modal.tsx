"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Flag, Loader2 } from "lucide-react";
import type { ReportReason } from "@/types";

interface ReportUserModalProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcelId?: string;
}

export function ReportUserModal({
  userId,
  userName,
  open,
  onOpenChange,
  parcelId,
}: ReportUserModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Please provide at least 10 characters of description");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to report a user");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: userId,
      parcel_id: parcelId || null,
      reason: reason as ReportReason,
      description: description.trim(),
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to submit report: " + error.message);
      return;
    }

    toast.success("Report submitted. Our team will review it shortly.");
    setReason("");
    setDescription("");
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report {userName}
          </DialogTitle>
          <DialogDescription>
            Help us keep GlobalCarry safe. All reports are reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="report-reason" className="text-sm">Reason</Label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a reason...</option>
              {Object.entries(REPORT_REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-desc" className="text-sm">
              Description
            </Label>
            <Textarea
              id="report-desc"
              placeholder="Please describe what happened in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
            />
            <p className="text-xs text-slate-400">{description.length}/2000</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || description.trim().length < 10 || isSubmitting}
            variant="destructive"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
