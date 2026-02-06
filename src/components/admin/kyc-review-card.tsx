"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_TYPE_LABELS, KYC_REVIEW_STATUS_LABELS, KYC_REVIEW_STATUS_COLORS } from "@/lib/constants";
import { KycDocumentViewer } from "./kyc-document-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Eye, Check, X, Loader2 } from "lucide-react";
import type { KycDocument, Profile } from "@/types";

interface KycReviewCardProps {
  document: KycDocument & { user: Profile };
}

export function KycReviewCard({ document }: KycReviewCardProps) {
  const router = useRouter();
  const [showViewer, setShowViewer] = useState(false);
  const [notes, setNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Update KYC document
    const { error: docError } = await supabase
      .from("kyc_documents")
      .update({
        review_status: "approved",
        reviewer_id: user?.id,
        reviewer_notes: notes,
      })
      .eq("id", document.id);

    if (docError) {
      toast.error("Failed to approve: " + docError.message);
      setIsApproving(false);
      return;
    }

    // Update profile KYC status
    await supabase
      .from("profiles")
      .update({ kyc_status: "verified" })
      .eq("id", document.user_id);

    toast.success("Document approved!");
    setIsApproving(false);
    router.refresh();
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsRejecting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Update KYC document
    const { error: docError } = await supabase
      .from("kyc_documents")
      .update({
        review_status: "rejected",
        reviewer_id: user?.id,
        reviewer_notes: notes,
      })
      .eq("id", document.id);

    if (docError) {
      toast.error("Failed to reject: " + docError.message);
      setIsRejecting(false);
      return;
    }

    // Update profile KYC status back to none
    await supabase
      .from("profiles")
      .update({ kyc_status: "none" })
      .eq("id", document.user_id);

    toast.success("Document rejected");
    setIsRejecting(false);
    router.refresh();
  };

  const isPending = document.review_status === "pending";

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={document.user.avatar_url} alt={document.user.full_name} />
              <AvatarFallback className="bg-[var(--color-navy-800)] text-white text-sm">
                {document.user.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{document.user.full_name}</h3>
                <Badge variant="outline" className="text-xs">
                  {DOCUMENT_TYPE_LABELS[document.document_type]}
                </Badge>
                <Badge className={KYC_REVIEW_STATUS_COLORS[document.review_status]}>
                  {KYC_REVIEW_STATUS_LABELS[document.review_status]}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                Submitted {format(new Date(document.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>

              {document.reviewer_notes && (
                <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                  <span className="font-medium">Notes: </span>
                  {document.reviewer_notes}
                </p>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowViewer(true)}>
              <Eye className="mr-1 h-4 w-4" />
              View
            </Button>
          </div>

          {isPending && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor={`notes-${document.id}`} className="text-sm">
                  Review Notes (required for rejection)
                </Label>
                <Textarea
                  id={`notes-${document.id}`}
                  placeholder="Add notes about your decision..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isApproving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isApproving || isRejecting}
                >
                  {isRejecting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <KycDocumentViewer
        documentUrl={document.document_url}
        open={showViewer}
        onOpenChange={setShowViewer}
      />
    </>
  );
}
