import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedBadge } from "./verified-badge";
import { ReviewSummary } from "@/components/reviews/review-summary";
import type { Profile } from "@/types";

interface ProfileCardProps {
  profile: Profile;
  averageRating?: number | null;
  reviewCount?: number;
}

export function ProfileCard({ profile, averageRating, reviewCount = 0 }: ProfileCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
          <AvatarFallback className="bg-[var(--color-navy-800)] text-lg text-white">
            {profile.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile.full_name}</h2>
            <VerifiedBadge status={profile.kyc_status} />
          </div>
          <div className="mt-1">
            <ReviewSummary
              averageRating={averageRating ?? null}
              reviewCount={reviewCount}
            />
          </div>
          {profile.bio && (
            <p className="mt-2 text-sm text-slate-600">{profile.bio}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
