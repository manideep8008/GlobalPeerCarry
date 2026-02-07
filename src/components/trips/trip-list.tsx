"use client";

import { TripCard } from "./trip-card";
import type { TripWithCarrier } from "@/types";

interface TripListProps {
  trips: TripWithCarrier[];
  selectedTripId?: string;
  onTripSelect?: (tripId: string) => void;
  emptyMessage?: string;
}

export function TripList({
  trips,
  selectedTripId,
  onTripSelect,
  emptyMessage = "No trips found matching your criteria.",
}: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className={`cursor-pointer rounded-lg transition-all ${
            selectedTripId === trip.id
              ? "ring-2 ring-[var(--color-navy-800)]"
              : ""
          }`}
          onClick={() => onTripSelect?.(trip.id)}
        >
          <TripCard trip={trip} />
        </div>
      ))}
    </div>
  );
}
