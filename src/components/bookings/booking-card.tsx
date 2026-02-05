import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EscrowStatusBadge } from "./escrow-status-badge";
import { PARCEL_STATUS_LABELS, PARCEL_STATUS_COLORS } from "@/lib/constants";
import { MapPin, ArrowRight, Calendar, Weight, DollarSign } from "lucide-react";
import type { ParcelWithDetails } from "@/types";

interface BookingCardProps {
  booking: ParcelWithDetails;
  role: "sender" | "carrier";
}

export function BookingCard({ booking, role }: BookingCardProps) {
  return (
    <Link href={`/bookings/${booking.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">{booking.title}</h3>
              {booking.trip && (
                <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {booking.trip.origin}
                  <ArrowRight className="h-3 w-3" />
                  {booking.trip.destination}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant="secondary"
                className={PARCEL_STATUS_COLORS[booking.status] || ""}
              >
                {PARCEL_STATUS_LABELS[booking.status] || booking.status}
              </Badge>
              <EscrowStatusBadge status={booking.escrow_status} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Weight className="h-3.5 w-3.5" />
              {booking.weight_kg} kg
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              ${booking.total_price}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(booking.created_at), "MMM d, yyyy")}
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-400">
            {role === "sender" ? "Carrier" : "Sender"}:{" "}
            {role === "sender"
              ? booking.carrier?.full_name
              : booking.sender?.full_name}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
