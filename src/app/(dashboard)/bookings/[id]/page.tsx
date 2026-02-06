import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EscrowStatusBadge } from "@/components/bookings/escrow-status-badge";
import { DeliveryConfirmation } from "@/components/bookings/delivery-confirmation";
import { BookingActions } from "@/components/bookings/booking-actions";
import { ReviewPrompt } from "@/components/reviews/review-prompt";
import { UserSafetyActions } from "@/components/safety/user-safety-actions";
import { PaymentDetails } from "@/components/bookings/payment-details";
import { PaymentSuccessHandler } from "@/components/bookings/payment-success-handler";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PARCEL_STATUS_LABELS,
  PARCEL_STATUS_COLORS,
} from "@/lib/constants";
import type { ParcelWithDetails, Review } from "@/types";
import {
  ArrowLeft,
  MapPin,
  ArrowRight,
  Calendar,
  Weight,
  DollarSign,
  Package,
  User,
  MessageSquare,
  KeyRound,
} from "lucide-react";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookingDetailPage({
  params,
  searchParams,
}: BookingDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const paymentStatus = query.payment as string | undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bookingData } = await supabase
    .from("parcels")
    .select(
      "*, sender:profiles!sender_id(*), carrier:profiles!carrier_id(*), trip:trips!trip_id(*)"
    )
    .eq("id", id)
    .single();

  if (!bookingData) {
    notFound();
  }

  // Cast to work around Supabase type inference with placeholder credentials
  const booking = bookingData as unknown as ParcelWithDetails;

  const isCarrier = user?.id === booking.carrier_id;
  const isSender = user?.id === booking.sender_id;

  if (!isCarrier && !isSender) {
    notFound();
  }

  const trip = booking.trip;
  const sender = booking.sender;
  const carrier = booking.carrier;

  // Determine the other party
  const otherParty = isCarrier ? sender : carrier;
  const otherPartyId = isCarrier ? booking.sender_id : booking.carrier_id;

  // Fetch reviews for this booking
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*")
    .eq("parcel_id", id);

  const reviews = (reviewsData || []) as unknown as Review[];
  const myReview = reviews.find((r) => r.reviewer_id === user?.id) || null;

  // Check if current user has blocked the other party
  let isOtherBlocked = false;
  if (user) {
    const { data: blockData } = await supabase
      .from("user_blocks")
      .select("id")
      .eq("blocker_id", user.id)
      .eq("blocked_id", otherPartyId)
      .single();
    isOtherBlocked = !!blockData;
  }

  // Status timeline steps
  const steps = ["pending", "accepted", "in_transit", "delivered"];
  const currentStepIndex = steps.indexOf(booking.status);

  // Check if payment exists
  const hasPayment = !!booking.stripe_payment_intent_id || booking.escrow_status === "held" || booking.escrow_status === "released";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Handle payment success redirect */}
      {paymentStatus === "success" && (
        <PaymentSuccessHandler parcelId={id} />
      )}

      {paymentStatus === "cancelled" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-center">
            <p className="text-amber-800">
              Payment was cancelled. You can try again by clicking Accept & Collect Payment.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/bookings">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>
      </div>

      <PageHeader title={booking.title} />

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      index <= currentStepIndex
                        ? "bg-[var(--color-navy-800)] text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`mt-1 text-xs ${
                      index <= currentStepIndex
                        ? "font-medium text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {PARCEL_STATUS_LABELS[step]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      index < currentStepIndex ? "bg-[var(--color-navy-800)]" : "bg-slate-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={PARCEL_STATUS_COLORS[booking.status] || ""}
                >
                  {PARCEL_STATUS_LABELS[booking.status]}
                </Badge>
                <EscrowStatusBadge status={booking.escrow_status} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Route info */}
          {trip && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-[var(--color-navy-800)]" />
              <span className="font-medium">{trip.origin}</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <span className="font-medium">{trip.destination}</span>
              <span className="text-slate-400">|</span>
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">
                {format(new Date(trip.travel_date), "MMM d, yyyy")}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Weight className="h-3.5 w-3.5" />
                Weight
              </div>
              <p className="mt-1 font-semibold">{booking.weight_kg} kg</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <DollarSign className="h-3.5 w-3.5" />
                Total Price
              </div>
              <p className="mt-1 font-semibold">${booking.total_price}</p>
            </div>
          </div>

          {booking.description && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                  <Package className="h-4 w-4" />
                  Description
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {booking.description}
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">
                {isCarrier ? "Sender:" : "Carrier:"}
              </span>
              <span className="font-medium">
                {otherParty?.full_name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button asChild variant="outline" size="sm">
                <Link href={`/messages/${otherPartyId}`}>
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Message
                </Link>
              </Button>
              <UserSafetyActions
                userId={otherPartyId}
                userName={otherParty?.full_name || "User"}
                isBlocked={isOtherBlocked}
                parcelId={booking.id}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details - Show when payment exists */}
      {hasPayment && (
        <PaymentDetails
          totalPrice={booking.total_price}
          escrowStatus={booking.escrow_status}
          paidAt={booking.paid_at}
          payoutAt={booking.payout_at}
          stripePaymentIntentId={booking.stripe_payment_intent_id}
          isCarrier={isCarrier}
        />
      )}

      {/* Sender PIN */}
      {isSender && booking.sender_pin && booking.status !== "delivered" && booking.status !== "cancelled" && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <KeyRound className="h-5 w-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">Your Delivery PIN</h3>
                <p className="text-sm text-amber-700">
                  Share this PIN with the receiver. The carrier will enter it to confirm delivery.
                </p>
              </div>
              <div className="rounded-lg border-2 border-amber-300 bg-white px-4 py-2">
                <span className="text-2xl font-mono font-bold tracking-widest text-amber-900">
                  {booking.sender_pin}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carrier Actions */}
      {isCarrier && booking.status === "pending" && (
        <BookingActions
          parcelId={booking.id}
          tripId={booking.trip_id}
          weight={booking.weight_kg}
          escrowStatus={booking.escrow_status}
        />
      )}

      {isCarrier && booking.status === "accepted" && (
        <BookingActions
          parcelId={booking.id}
          tripId={booking.trip_id}
          weight={booking.weight_kg}
          escrowStatus={booking.escrow_status}
          showMarkInTransit
        />
      )}

      {isCarrier && booking.status === "in_transit" && (
        <DeliveryConfirmation parcelId={booking.id} />
      )}

      {booking.status === "delivered" && (
        <>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-5 text-center">
              <p className="font-semibold text-green-800">
                Delivery confirmed! Payment has been released.
              </p>
            </CardContent>
          </Card>

          {/* Review Prompt */}
          <ReviewPrompt
            parcelId={booking.id}
            revieweeId={otherPartyId}
            revieweeName={otherParty?.full_name || "User"}
            existingReview={myReview}
          />
        </>
      )}
    </div>
  );
}
