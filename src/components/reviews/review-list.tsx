import { ReviewCard } from "./review-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { ReviewWithProfiles } from "@/types";

interface ReviewListProps {
  reviews: ReviewWithProfiles[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="This user hasn't received any reviews yet"
      />
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
