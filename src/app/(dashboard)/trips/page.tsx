import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AdvancedSearchFilters } from "@/components/trips/advanced-search-filters";
import { TripsSplitView } from "@/components/trips/trips-split-view";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { TripWithCarrier } from "@/types";

interface TripsPageProps {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    date_from?: string;
    date_to?: string;
    min_price?: string;
    max_price?: string;
    min_weight?: string;
    max_weight?: string;
  }>;
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get blocked users
  const { data: blockedUsers } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", user?.id || "");

  const blockedIds = (blockedUsers || []).map((b) => b.blocked_id);

  // Also get users who blocked current user
  const { data: blockedByUsers } = await supabase
    .from("user_blocks")
    .select("blocker_id")
    .eq("blocked_id", user?.id || "");

  const blockedByIds = (blockedByUsers || []).map((b) => b.blocker_id);
  const allBlockedIds = [...blockedIds, ...blockedByIds];

  // Build query with filters
  let query = supabase
    .from("trips")
    .select("*, carrier:profiles!carrier_id(*)")
    .eq("is_active", true)
    .gte("travel_date", new Date().toISOString().split("T")[0])
    .gt("available_weight_kg", 0)
    .order("travel_date", { ascending: true });

  // Text filters
  if (params.origin) {
    query = query.ilike("origin", `%${params.origin}%`);
  }
  if (params.destination) {
    query = query.ilike("destination", `%${params.destination}%`);
  }

  // Date range filters
  if (params.date_from) {
    query = query.gte("travel_date", params.date_from);
  }
  if (params.date_to) {
    query = query.lte("travel_date", params.date_to);
  }

  // Price filters
  if (params.min_price) {
    query = query.gte("price_per_kg", parseFloat(params.min_price));
  }
  if (params.max_price) {
    query = query.lte("price_per_kg", parseFloat(params.max_price));
  }

  // Weight filters
  if (params.min_weight) {
    query = query.gte("available_weight_kg", parseFloat(params.min_weight));
  }
  if (params.max_weight) {
    query = query.lte("available_weight_kg", parseFloat(params.max_weight));
  }

  const { data: trips } = await query;

  // Filter out trips from blocked users
  const filteredTrips = (trips || []).filter(
    (trip) => !allBlockedIds.includes(trip.carrier_id)
  ) as unknown as TripWithCarrier[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Trips"
        description="Find a carrier traveling to your destination"
        action={
          <Button
            asChild
            className="bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
          >
            <Link href="/trips/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post a Trip
            </Link>
          </Button>
        }
      />

      <Suspense fallback={null}>
        <AdvancedSearchFilters />
      </Suspense>

      {filteredTrips.length > 0 ? (
        <TripsSplitView trips={filteredTrips} />
      ) : (
        <EmptyState
          title="No trips found"
          description="Try adjusting your search filters or check back later"
          action={
            <Button asChild variant="outline">
              <Link href="/trips/new">Post a Trip Instead</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
