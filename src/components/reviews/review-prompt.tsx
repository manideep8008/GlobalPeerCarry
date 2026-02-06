"use client";

import { useState } from "react";
import { ReviewForm } from "./review-form";
import { StarRating } from "./star-rating";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import type { Review } from "@/types";

interface ReviewPromptProps {
  parcelId: string;
  revieweeId: string;
  revieweeName: string;
  existingReview?: Review | null;
}

export function ReviewPrompt({
  parcelId,
  revieweeId,
  revieweeName,
  existingReview,
}: ReviewPromptProps) {
  const [showForm, setShowForm] = useState(false);

  // If already reviewed, show the existing review
  if (existingReview) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
            <span className="font-medium">Your review for {revieweeName}</span>
          </div>
          <div className="mt-2">
            <StarRating rating={existingReview.rating} readonly size="sm" />
            {existingReview.comment && (
              <p className="mt-1 text-sm text-slate-600">
                {existingReview.comment}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">
                  Rate your experience
                </p>
                <p className="text-sm text-amber-700">
                  How was your experience with {revieweeName}?
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="border-amber-300 hover:bg-amber-100"
            >
              Leave Review
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review {revieweeName}</DialogTitle>
            <DialogDescription>
              Share your experience to help build trust in the community.
            </DialogDescription>
          </DialogHeader>
          <ReviewForm
            parcelId={parcelId}
            revieweeId={revieweeId}
            onSuccess={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
