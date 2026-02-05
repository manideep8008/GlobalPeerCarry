import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileCard } from "@/components/profile/profile-card";
import { TripCard } from "@/components/trips/trip-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import type { Profile, TripWithCarrier } from "@/types";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === id;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/trips">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        {!isOwnProfile && user && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/messages/${id}`}>
              <MessageSquare className="mr-1 h-4 w-4" />
              Message
            </Link>
          </Button>
        )}
      </div>

      <ProfileCard profile={profile as unknown as Profile} />

      <div className="rounded-lg border bg-slate-50 p-4 text-center text-sm text-slate-600">
        {deliveryCount ?? 0} successful deliveries completed
      </div>

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
