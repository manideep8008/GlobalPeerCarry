"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema, type TripFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LocationAutocomplete,
  type LocationResult,
} from "@/components/maps/location-autocomplete";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LocationData {
  name: string;
  lat: number | null;
  lng: number | null;
}

export function TripForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Location state with coordinates
  const [originData, setOriginData] = useState<LocationData>({
    name: "",
    lat: null,
    lng: null,
  });
  const [destinationData, setDestinationData] = useState<LocationData>({
    name: "",
    lat: null,
    lng: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema) as any,
  });

  const handleOriginChange = (location: LocationResult | null) => {
    if (location) {
      const shortName = location.city
        ? `${location.city}, ${location.country}`
        : location.display_name.split(",").slice(0, 2).join(",");

      setOriginData({
        name: shortName,
        lat: location.lat,
        lng: location.lng,
      });
      setValue("origin", shortName);
    } else {
      setOriginData({ name: "", lat: null, lng: null });
      setValue("origin", "");
    }
  };

  const handleDestinationChange = (location: LocationResult | null) => {
    if (location) {
      const shortName = location.city
        ? `${location.city}, ${location.country}`
        : location.display_name.split(",").slice(0, 2).join(",");

      setDestinationData({
        name: shortName,
        lat: location.lat,
        lng: location.lng,
      });
      setValue("destination", shortName);
    } else {
      setDestinationData({ name: "", lat: null, lng: null });
      setValue("destination", "");
    }
  };

  const onSubmit = async (data: TripFormData) => {
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      return;
    }

    const { error: insertError } = await supabase.from("trips").insert({
      carrier_id: user.id,
      origin: originData.name || data.origin,
      destination: destinationData.name || data.destination,
      origin_lat: originData.lat,
      origin_lng: originData.lng,
      destination_lat: destinationData.lat,
      destination_lng: destinationData.lng,
      travel_date: data.travel_date,
      total_weight_kg: data.total_weight_kg,
      available_weight_kg: data.total_weight_kg,
      price_per_kg: data.price_per_kg,
      notes: data.notes || "",
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    toast.success("Trip posted successfully!");
    router.push("/trips");
    router.refresh();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post a New Trip</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <LocationAutocomplete
                value={originData.name}
                onChange={handleOriginChange}
                placeholder="e.g., New York, USA"
                label="Origin"
                error={errors.origin?.message}
              />
              {/* Hidden input for form validation */}
              <input type="hidden" {...register("origin")} />
            </div>

            <div className="space-y-2">
              <LocationAutocomplete
                value={destinationData.name}
                onChange={handleDestinationChange}
                placeholder="e.g., Mumbai, India"
                label="Destination"
                error={errors.destination?.message}
              />
              {/* Hidden input for form validation */}
              <input type="hidden" {...register("destination")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="travel_date">Travel Date</Label>
            <Input
              id="travel_date"
              type="date"
              min={today}
              {...register("travel_date")}
            />
            {errors.travel_date && (
              <p className="text-xs text-red-500">
                {errors.travel_date.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="total_weight_kg">Available Weight (kg)</Label>
              <Input
                id="total_weight_kg"
                type="number"
                step="0.1"
                placeholder="e.g., 10"
                {...register("total_weight_kg")}
              />
              {errors.total_weight_kg && (
                <p className="text-xs text-red-500">
                  {errors.total_weight_kg.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_kg">Price per kg ($)</Label>
              <Input
                id="price_per_kg"
                type="number"
                step="0.01"
                placeholder="e.g., 15.00"
                {...register("price_per_kg")}
              />
              {errors.price_per_kg && (
                <p className="text-xs text-red-500">
                  {errors.price_per_kg.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or restrictions..."
              {...register("notes")}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Trip
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
