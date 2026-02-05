import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/profile/verified-badge";
import { MapPin, Calendar, Weight, DollarSign, ArrowRight } from "lucide-react";
import type { TripWithCarrier } from "@/types";

interface TripCardProps {
  trip: TripWithCarrier;
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="group transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          {/* Route */}
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-[var(--color-navy-800)]" />
            <span>{trip.origin}</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <span>{trip.destination}</span>
          </div>

          {/* Details */}
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(trip.travel_date), "MMM d, yyyy")}
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Weight className="h-3.5 w-3.5" />
              {trip.available_weight_kg} kg available
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-700">
              <DollarSign className="h-3.5 w-3.5" />
              ${trip.price_per_kg}/kg
            </div>
          </div>

          {/* Carrier */}
          <div className="mt-4 flex items-center gap-2 border-t pt-3">
            <Avatar className="h-7 w-7">
              <AvatarImage
                src={trip.carrier?.avatar_url || ""}
                alt={trip.carrier?.full_name || ""}
              />
              <AvatarFallback className="bg-[var(--color-navy-800)] text-xs text-white">
                {trip.carrier?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700">
              {trip.carrier?.full_name || "Unknown Carrier"}
            </span>
            <VerifiedBadge status={trip.carrier?.kyc_status || "none"} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
