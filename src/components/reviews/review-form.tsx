"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  parcelId: string;
  revieweeId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ parcelId, revieweeId, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to leave a review");
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      parcel_id: parcelId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment: comment.trim(),
    });

    setIsSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("You have already reviewed this delivery");
      } else {
        toast.error("Failed to submit review: " + error.message);
      }
      return;
    }

    toast.success("Review submitted successfully!");
    onSuccess?.();
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Rating</Label>
        <StarRating rating={rating} onRate={setRating} size="lg" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment" className="text-sm">
          Comment (optional)
        </Label>
        <Textarea
          id="review-comment"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={3}
        />
        <p className="text-xs text-slate-400">{comment.length}/1000</p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Review
      </Button>
    </div>
  );
}
