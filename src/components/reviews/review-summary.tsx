import { StarRating } from "./star-rating";
import { Star } from "lucide-react";

interface ReviewSummaryProps {
  averageRating: number | null;
  reviewCount: number;
}

export function ReviewSummary({ averageRating, reviewCount }: ReviewSummaryProps) {
  if (reviewCount === 0 || averageRating === null) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-400">
        <Star className="h-4 w-4" />
        <span>No reviews yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating rating={Math.round(averageRating)} readonly size="sm" />
      <span className="text-sm font-medium text-slate-700">
        {averageRating.toFixed(1)}
      </span>
      <span className="text-sm text-slate-400">
        ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}
