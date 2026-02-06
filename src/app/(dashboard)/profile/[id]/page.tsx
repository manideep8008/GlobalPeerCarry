import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileCard } from "@/components/profile/profile-card";
import { TripCard } from "@/components/trips/trip-card";
import { ReviewList } from "@/components/reviews/review-list";
import { UserSafetyActions } from "@/components/safety/user-safety-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import type { Profile, TripWithCarrier, ReviewWithProfiles } from "@/types";

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: trips } = await supabase
    .from("trips")
    .select("*, carrier:profiles!carrier_id(*)")
    .eq("carrier_id", id)
    .eq("is_active", true)
    .gte("travel_date", new Date().toISOString().split("T")[0])
    .order("travel_date", { ascending: true });

  const { count: deliveryCount } = await supabase
    .from("parcels")
    .select("*", { count: "exact", head: true })
    .eq("carrier_id", id)
    .eq("status", "delivered");

  // Fetch reviews for this user
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviewer_id(*)")
    .eq("reviewee_id", id)
    .order("created_at", { ascending: false });

  // Compute average rating
  const typedReviews = (reviews || []) as unknown as ReviewWithProfiles[];
  const reviewCount = typedReviews.length;
  const averageRating =
    reviewCount > 0
      ? typedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === id;

  // Check if current user has blocked this profile
  let isBlocked = false;
  if (user && !isOwnProfile) {
    const { data: blockData } = await supabase
      .from("user_blocks")
      .select("id")
      .eq("blocker_id", user.id)
      .eq("blocked_id", id)
      .single();
    isBlocked = !!blockData;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/trips">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {!isOwnProfile && user && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/messages/${id}`}>
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Message
                </Link>
              </Button>
              <UserSafetyActions
                userId={id}
                userName={(profile as unknown as Profile).full_name}
                isBlocked={isBlocked}
              />
            </>
          )}
        </div>
      </div>

      <ProfileCard
        profile={profile as unknown as Profile}
        averageRating={averageRating}
        reviewCount={reviewCount}
      />

      <div className="rounded-lg border bg-slate-50 p-4 text-center text-sm text-slate-600">
        {deliveryCount ?? 0} successful deliveries completed
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Reviews</h2>
        <ReviewList reviews={typedReviews} />
      </div>

      {/* Active Trips */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Active Trips</h2>
        {trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip as unknown as TripWithCarrier}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active trips"
            description="This user doesn't have any active trips at the moment"
          />
        )}
      </div>
    </div>
  );
}
