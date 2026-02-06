import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TripSearchFilters } from "@/components/trips/trip-search-filters";
import { TripCard } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { TripWithCarrier } from "@/types";

interface TripsPageProps {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    date?: string;
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

  let query = supabase
    .from("trips")
    .select("*, carrier:profiles!carrier_id(*)")
    .eq("is_active", true)
    .gte("travel_date", new Date().toISOString().split("T")[0])
    .gt("available_weight_kg", 0)
    .order("travel_date", { ascending: true });

  if (params.origin) {
    query = query.ilike("origin", `%${params.origin}%`);
  }
  if (params.destination) {
    query = query.ilike("destination", `%${params.destination}%`);
  }
  if (params.date) {
    query = query.gte("travel_date", params.date);
  }

  const { data: trips } = await query;

  // Filter out trips from blocked users
  const filteredTrips = (trips || []).filter(
    (trip) => !blockedIds.includes(trip.carrier_id)
  );

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
        <TripSearchFilters />
      </Suspense>

      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip as unknown as TripWithCarrier} />
          ))}
        </div>
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
