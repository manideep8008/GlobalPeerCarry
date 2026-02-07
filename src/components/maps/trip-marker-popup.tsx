"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Package, DollarSign, User } from "lucide-react";
import type { TripWithCarrier } from "@/types";

interface TripMarkerPopupProps {
  trip: TripWithCarrier;
}

export function TripMarkerPopup({ trip }: TripMarkerPopupProps) {
  return (
    <div className="min-w-[200px] p-1">
      <div className="mb-2 font-medium text-slate-900">
        {trip.origin} → {trip.destination}
      </div>

      <div className="space-y-1 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(trip.travel_date), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          <span>{trip.available_weight_kg} kg available</span>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <DollarSign className="h-3 w-3" />
          <span>${trip.price_per_kg}/kg</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>{trip.carrier.full_name}</span>
        </div>
      </div>

      <Link
        href={`/trips/${trip.id}`}
        className="mt-2 block rounded bg-[var(--color-navy-800)] px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-[var(--color-navy-900)]"
      >
        View Details
      </Link>
    </div>
  );
}
