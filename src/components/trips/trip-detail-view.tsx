import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/profile/verified-badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Weight,
  DollarSign,
  ArrowRight,
  FileText,
} from "lucide-react";
import type { TripWithCarrier } from "@/types";
import Link from "next/link";

interface TripDetailViewProps {
  trip: TripWithCarrier;
}

export function TripDetailView({ trip }: TripDetailViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <MapPin className="h-5 w-5 text-[var(--color-navy-800)]" />
          {trip.origin}
          <ArrowRight className="h-5 w-5 text-slate-400" />
          {trip.destination}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              Travel Date
            </div>
            <p className="mt-1 font-semibold">
              {format(new Date(trip.travel_date), "MMM d, yyyy")}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Weight className="h-3.5 w-3.5" />
              Total Weight
            </div>
            <p className="mt-1 font-semibold">{trip.total_weight_kg} kg</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Weight className="h-3.5 w-3.5" />
              Available
            </div>
            <p className="mt-1 font-semibold text-green-700">
              {trip.available_weight_kg} kg
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <DollarSign className="h-3.5 w-3.5" />
              Price per kg
            </div>
            <p className="mt-1 font-semibold">${trip.price_per_kg}</p>
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <FileText className="h-4 w-4" />
                Notes
              </div>
              <p className="mt-2 text-sm text-slate-600">{trip.notes}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Carrier Info */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-700">Carrier</h3>
          <Link
            href={`/profile/${trip.carrier_id}`}
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-slate-50"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={trip.carrier?.avatar_url || ""}
                alt={trip.carrier?.full_name || ""}
              />
              <AvatarFallback className="bg-[var(--color-navy-800)] text-white">
                {trip.carrier?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {trip.carrier?.full_name || "Unknown Carrier"}
                </span>
                <VerifiedBadge
                  status={trip.carrier?.kyc_status || "none"}
                />
              </div>
              {trip.carrier?.bio && (
                <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">
                  {trip.carrier.bio}
                </p>
              )}
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
