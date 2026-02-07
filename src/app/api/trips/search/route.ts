import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  // Get filter parameters
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const minWeight = searchParams.get("min_weight");
  const maxWeight = searchParams.get("max_weight");

  // Build query
  let query = supabase
    .from("trips")
    .select("*, carrier:profiles!carrier_id(*)")
    .eq("is_active", true)
    .gte("travel_date", new Date().toISOString().split("T")[0])
    .gt("available_weight_kg", 0)
    .order("travel_date", { ascending: true });

  // Apply text filters
  if (origin) {
    query = query.ilike("origin", `%${origin}%`);
  }
  if (destination) {
    query = query.ilike("destination", `%${destination}%`);
  }

  // Apply date range filters
  if (dateFrom) {
    query = query.gte("travel_date", dateFrom);
  }
  if (dateTo) {
    query = query.lte("travel_date", dateTo);
  }

  // Apply price filters
  if (minPrice) {
    query = query.gte("price_per_kg", parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.lte("price_per_kg", parseFloat(maxPrice));
  }

  // Apply weight filters
  if (minWeight) {
    query = query.gte("available_weight_kg", parseFloat(minWeight));
  }
  if (maxWeight) {
    query = query.lte("available_weight_kg", parseFloat(maxWeight));
  }

  const { data: trips, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter out blocked users (requires auth)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let filteredTrips = trips || [];

  if (user) {
    // Get blocked users
    const { data: blocks } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);

    const blockedIds = blocks?.map((b) => b.blocked_id) || [];

    // Also get users who blocked current user
    const { data: blockedBy } = await supabase
      .from("user_blocks")
      .select("blocker_id")
      .eq("blocked_id", user.id);

    const blockedByIds = blockedBy?.map((b) => b.blocker_id) || [];

    const allBlockedIds = [...blockedIds, ...blockedByIds];

    filteredTrips = trips?.filter(
      (trip) => !allBlockedIds.includes(trip.carrier_id)
    ) || [];
  }

  return NextResponse.json({ trips: filteredTrips });
}
