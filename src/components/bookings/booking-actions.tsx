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
  showMarkInTransit?: boolean;
}

export function BookingActions({
  parcelId,
  tripId,
  weight,
  showMarkInTransit,
}: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (action: "accept" | "reject" | "in_transit") => {
    setIsLoading(action);
    const supabase = createClient();

    if (action === "accept") {
      const { error } = await supabase
        .from("parcels")
        .update({ status: "accepted", escrow_status: "held" })
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

        toast.success("Booking accepted! Payment is now held in escrow.");
      } else {
        toast.error(error.message);
      }
    } else if (action === "reject") {
      const { error } = await supabase
        .from("parcels")
        .update({ status: "cancelled", escrow_status: "refunded" })
        .eq("id", parcelId);

      if (!error) {
        toast.success("Booking rejected. The sender has been notified.");
      } else {
        toast.error(error.message);
      }
    } else if (action === "in_transit") {
      const { error } = await supabase
        .from("parcels")
        .update({ status: "in_transit" })
        .eq("id", parcelId);

      if (!error) {
        toast.success("Parcel marked as in transit.");
      } else {
        toast.error(error.message);
      }
    }

    setIsLoading(null);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3">
        {!showMarkInTransit ? (
          <>
            <Button
              onClick={() => handleAction("accept")}
              disabled={isLoading !== null}
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
              onClick={() => handleAction("reject")}
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
          </>
        ) : (
          <Button
            onClick={() => handleAction("in_transit")}
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
