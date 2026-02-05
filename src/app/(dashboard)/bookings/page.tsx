import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { BookingCard } from "@/components/bookings/booking-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ParcelWithDetails } from "@/types";

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: senderBookingsData } = await supabase
    .from("parcels")
    .select(
      "*, sender:profiles!sender_id(*), carrier:profiles!carrier_id(*), trip:trips!trip_id(*)"
    )
    .eq("sender_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: carrierBookingsData } = await supabase
    .from("parcels")
    .select(
      "*, sender:profiles!sender_id(*), carrier:profiles!carrier_id(*), trip:trips!trip_id(*)"
    )
    .eq("carrier_id", user!.id)
    .order("created_at", { ascending: false });

  const senderBookings = (senderBookingsData || []) as unknown as ParcelWithDetails[];
  const carrierBookings = (carrierBookingsData || []) as unknown as ParcelWithDetails[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="Track your parcels and booking requests"
      />

      <Tabs defaultValue="sender">
        <TabsList>
          <TabsTrigger value="sender">
            As Sender ({senderBookings.length})
          </TabsTrigger>
          <TabsTrigger value="carrier">
            As Carrier ({carrierBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sender" className="mt-4 space-y-3">
          {senderBookings.length > 0 ? (
            senderBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role="sender"
              />
            ))
          ) : (
            <EmptyState
              title="No bookings yet"
              description="Browse trips and request a booking to get started"
            />
          )}
        </TabsContent>

        <TabsContent value="carrier" className="mt-4 space-y-3">
          {carrierBookings.length > 0 ? (
            carrierBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role="carrier"
              />
            ))
          ) : (
            <EmptyState
              title="No carrier bookings"
              description="Post a trip and accept bookings from senders"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
