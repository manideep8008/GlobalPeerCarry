"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Truck } from "lucide-react";

interface BookingActionsProps {
  parcelId: string;
  tripId: string;
  weight: number;
  escrowStatus?: string;
  showMarkInTransit?: boolean;
}

export function BookingActions({
  parcelId,
  tripId,
  weight,
  escrowStatus,
  showMarkInTransit,
}: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Check if payment has been made by sender
  const isPaid = escrowStatus === "held";

  const handleAccept = async () => {
    setIsLoading("accept");
    const supabase = createClient();

    // Simply accept the booking - payment is already held from sender
    const { error } = await supabase
      .from("parcels")
      .update({ status: "accepted" })
      .eq("id", parcelId);

    if (!error) {
      // Decrement available weight on trip
      const { data: trip } = await supabase
        .from("trips")
        .select("available_weight_kg")
        .eq("id", tripId)
        .single();

      if (trip) {
        await supabase
          .from("trips")
          .update({
            available_weight_kg: Math.max(0, trip.available_weight_kg - weight),
          })
          .eq("id", tripId);
      }

      toast.success("Booking accepted! Payment is held in escrow until delivery.");

      // Send notification to sender
      fetch(`/api/bookings/${parcelId}/notify-accepted`, {
        method: "POST",
      }).catch(console.error);
    } else {
      toast.error(error.message);
    }

    setIsLoading(null);
    router.refresh();
  };

  const handleReject = async () => {
    setIsLoading("reject");
    const supabase = createClient();

    // If payment was held, we need to trigger a refund
    if (isPaid) {
      try {
        const response = await fetch(`/api/bookings/${parcelId}/refund`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to process refund");
        }

        toast.success("Booking rejected. Payment has been refunded to sender.");
      } catch (error) {
        console.error("Refund error:", error);
        toast.error("Failed to process refund. Please contact support.");
        setIsLoading(null);
        return;
      }
    } else {
      // No payment, just update status
      const { error } = await supabase
        .from("parcels")
        .update({ status: "cancelled" })
        .eq("id", parcelId);

      if (error) {
        toast.error(error.message);
        setIsLoading(null);
        return;
      }

      toast.success("Booking rejected. The sender has been notified.");
    }

    setIsLoading(null);
    router.refresh();
  };

  const handleMarkInTransit = async () => {
    setIsLoading("in_transit");
    const supabase = createClient();

    const { error } = await supabase
      .from("parcels")
      .update({ status: "in_transit" })
      .eq("id", parcelId);

    if (!error) {
      toast.success("Parcel marked as in transit.");

      // Send notification to sender
      fetch(`/api/bookings/${parcelId}/notify-in-transit`, {
        method: "POST",
      }).catch(console.error);
    } else {
      toast.error(error.message);
    }

    setIsLoading(null);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!showMarkInTransit ? (
          <>
            {/* Show payment status for carrier */}
            {isPaid ? (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                ✓ Sender has paid. Payment is held in escrow.
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                ⏳ Waiting for sender to complete payment...
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleAccept}
                disabled={isLoading !== null || !isPaid}
                className="flex-1 bg-green-700 hover:bg-green-800"
              >
                {isLoading === "accept" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Accept
              </Button>
              <Button
                onClick={handleReject}
                disabled={isLoading !== null}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                {isLoading === "reject" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject
              </Button>
            </div>
          </>
        ) : (
          <Button
            onClick={handleMarkInTransit}
            disabled={isLoading !== null}
            className="w-full bg-purple-700 hover:bg-purple-800"
          >
            {isLoading === "in_transit" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Truck className="mr-2 h-4 w-4" />
            )}
            Mark as In Transit
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
