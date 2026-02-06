import { format } from "date-fns";
import { StarRating } from "./star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import type { ReviewWithProfiles } from "@/types";

interface ReviewCardProps {
  review: ReviewWithProfiles;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const reviewer = review.reviewer;

  return (
    <div className="flex gap-3 rounded-lg border p-4">
      <Link href={`/profile/${reviewer.id}`}>
        <Avatar className="h-9 w-9">
          <AvatarImage src={reviewer.avatar_url} alt={reviewer.full_name} />
          <AvatarFallback className="bg-[var(--color-navy-800)] text-white text-xs">
            {reviewer.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${reviewer.id}`}
            className="text-sm font-medium hover:underline"
          >
            {reviewer.full_name}
          </Link>
          <span className="text-xs text-slate-400">
            {format(new Date(review.created_at), "MMM d, yyyy")}
          </span>
        </div>
        <StarRating rating={review.rating} readonly size="sm" />
        {review.comment && (
          <p className="mt-1.5 text-sm text-slate-600">{review.comment}</p>
        )}
      </div>
    </div>
  );
}
