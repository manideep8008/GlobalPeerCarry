import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TripDetailView } from "@/components/trips/trip-detail-view";
import { BookingRequestForm } from "@/components/bookings/booking-request-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TripWithCarrier } from "@/types";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("*, carrier:profiles!carrier_id(*)")
    .eq("id", id)
    .single();

  if (!trip) {
    notFound();
  }

  const isCarrier = user?.id === trip.carrier_id;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/trips">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Trips
          </Link>
        </Button>
      </div>

      <TripDetailView trip={trip as unknown as TripWithCarrier} />

      {!isCarrier && user && trip.available_weight_kg > 0 && (
        <BookingRequestForm
          tripId={trip.id}
          carrierId={trip.carrier_id}
          maxWeight={trip.available_weight_kg}
          pricePerKg={trip.price_per_kg}
        />
      )}

      {isCarrier && (
        <div className="rounded-lg border bg-blue-50 p-4 text-center text-sm text-blue-800">
          This is your trip. Senders will be able to request bookings for it.
        </div>
      )}
    </div>
  );
}
