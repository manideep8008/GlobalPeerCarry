"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

interface KycDocumentViewerProps {
  documentUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KycDocumentViewer({
  documentUrl,
  open,
  onOpenChange,
}: KycDocumentViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && documentUrl) {
      loadSignedUrl();
    }
  }, [open, documentUrl]);

  const loadSignedUrl = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data, error: urlError } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(documentUrl, 3600); // 1 hour expiry

    setLoading(false);

    if (urlError) {
      setError("Failed to load document");
      return;
    }

    setSignedUrl(data.signedUrl);
  };

  const isPdf = documentUrl.toLowerCase().endsWith(".pdf");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>KYC Document</DialogTitle>
        </DialogHeader>

        <div className="min-h-[400px] flex items-center justify-center">
          {loading && (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading document...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500">
              <p>{error}</p>
              <Button variant="outline" onClick={loadSignedUrl} className="mt-2">
                Retry
              </Button>
            </div>
          )}

          {signedUrl && !loading && (
            <div className="w-full">
              {isPdf ? (
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-4">
                    PDF documents open in a new tab
                  </p>
                  <Button asChild>
                    <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open PDF
                    </a>
                  </Button>
                </div>
              ) : (
                <img
                  src={signedUrl}
                  alt="KYC Document"
                  className="max-h-[500px] w-full object-contain rounded-lg"
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
