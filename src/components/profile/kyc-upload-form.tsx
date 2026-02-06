"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_TYPE_LABELS, KYC_REVIEW_STATUS_LABELS, KYC_REVIEW_STATUS_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileCheck, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import type { Profile, KycDocument } from "@/types";
import type { DocumentType } from "@/types";

interface KycUploadFormProps {
  profile: Profile;
  existingDocument?: KycDocument | null;
}

export function KycUploadForm({ profile, existingDocument }: KycUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("passport");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // If already verified, show success state
  if (profile.kyc_status === "verified") {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-green-700" />
            <div>
              <p className="font-medium text-green-900">Identity Verified</p>
              <p className="text-sm text-green-700">
                Your identity has been verified. You have a trusted profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If pending review, show status
  if (profile.kyc_status === "pending" || existingDocument?.review_status === "pending") {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <FileCheck className="h-5 w-5 text-yellow-700" />
            <div>
              <p className="font-medium text-yellow-900">Verification Under Review</p>
              <p className="text-sm text-yellow-700">
                Your {existingDocument ? DOCUMENT_TYPE_LABELS[existingDocument.document_type] : "document"} has been submitted and is being reviewed by our team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If rejected, show rejection message with option to resubmit
  if (existingDocument?.review_status === "rejected") {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-700" />
            <div>
              <p className="font-medium text-red-900">Verification Rejected</p>
              <p className="text-sm text-red-700">
                {existingDocument.reviewer_notes || "Your document could not be verified. Please try again with a clearer image."}
              </p>
            </div>
          </div>
          <UploadForm
            documentType={documentType}
            setDocumentType={setDocumentType}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            fileInputRef={fileInputRef}
            isUploading={isUploading}
            onSubmit={handleUpload}
          />
        </CardContent>
      </Card>
    );
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${profile.id}/${Date.now()}-document.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, selectedFile);

      if (uploadError) {
        toast.error("Failed to upload document: " + uploadError.message);
        return;
      }

      // Create KYC document record
      const { error: insertError } = await supabase.from("kyc_documents").insert({
        user_id: profile.id,
        document_type: documentType,
        document_url: filePath,
        review_status: "pending" as const,
      });

      if (insertError) {
        toast.error("Failed to submit document: " + insertError.message);
        return;
      }

      // Update profile KYC status to pending
      await supabase
        .from("profiles")
        .update({ kyc_status: "pending" })
        .eq("id", profile.id);

      toast.success("Document submitted for verification!");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  // Default state: show upload form
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-[var(--color-navy-800)]" />
          <h3 className="font-medium text-sm">Get Verified</h3>
        </div>
        <p className="text-sm text-slate-500">
          Upload a government-issued ID to get a verified badge on your profile.
          This builds trust with other users.
        </p>
        <UploadForm
          documentType={documentType}
          setDocumentType={setDocumentType}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          fileInputRef={fileInputRef}
          isUploading={isUploading}
          onSubmit={handleUpload}
        />
      </CardContent>
    </Card>
  );
}

function UploadForm({
  documentType,
  setDocumentType,
  selectedFile,
  setSelectedFile,
  fileInputRef,
  isUploading,
  onSubmit,
}: {
  documentType: DocumentType;
  setDocumentType: (type: DocumentType) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="doc-type" className="text-sm">Document Type</Label>
        <select
          id="doc-type"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="doc-file" className="text-sm">Upload Document</Label>
        <Input
          ref={fileInputRef}
          id="doc-file"
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="cursor-pointer"
        />
        {selectedFile && (
          <p className="text-xs text-slate-500">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <Button
        onClick={onSubmit}
        disabled={!selectedFile || isUploading}
        className="w-full bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
      >
        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit for Verification
      </Button>
    </div>
  );
}
