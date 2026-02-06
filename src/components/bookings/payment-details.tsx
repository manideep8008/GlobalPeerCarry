"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaymentStatusBadge } from "./payment-status-badge";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";
import type { EscrowStatus } from "@/types/database";
import { format } from "date-fns";
import { CreditCard, Calendar, DollarSign, Percent } from "lucide-react";

interface PaymentDetailsProps {
  totalPrice: number;
  escrowStatus: EscrowStatus;
  paidAt?: string | null;
  payoutAt?: string | null;
  stripePaymentIntentId?: string | null;
  isCarrier?: boolean;
}

export function PaymentDetails({
  totalPrice,
  escrowStatus,
  paidAt,
  payoutAt,
  stripePaymentIntentId,
  isCarrier = false,
}: PaymentDetailsProps) {
  const platformFee = totalPrice * (PLATFORM_FEE_PERCENT / 100);
  const carrierPayout = totalPrice - platformFee;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <PaymentStatusBadge status={escrowStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Amount
            </span>
            <span className="font-semibold">${totalPrice.toFixed(2)}</span>
          </div>

          {isCarrier && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Platform Fee ({PLATFORM_FEE_PERCENT}%)
                </span>
                <span className="text-red-600">-${platformFee.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium">Your Payout</span>
                <span className="text-lg font-bold text-green-600">
                  ${carrierPayout.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Payment timeline */}
        <div className="space-y-2 text-sm">
          {paidAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Payment Received
              </span>
              <span>{format(new Date(paidAt), "MMM d, yyyy h:mm a")}</span>
            </div>
          )}

          {payoutAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Payout Released
              </span>
              <span>{format(new Date(payoutAt), "MMM d, yyyy h:mm a")}</span>
            </div>
          )}

          {stripePaymentIntentId && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-xs">
                {stripePaymentIntentId.slice(0, 20)}...
              </span>
            </div>
          )}
        </div>

        {/* Status explanation */}
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          {escrowStatus === "awaiting_payment" && (
            <p className="text-muted-foreground">
              Payment will be collected when the carrier accepts this booking.
            </p>
          )}
          {escrowStatus === "held" && (
            <p className="text-muted-foreground">
              Payment is being held securely. It will be released to the carrier
              once delivery is confirmed.
            </p>
          )}
          {escrowStatus === "released" && (
            <p className="text-green-700">
              Payment has been released to the carrier. Thank you for using
              GlobalCarry!
            </p>
          )}
          {escrowStatus === "refunded" && (
            <p className="text-muted-foreground">
              This payment has been refunded to the sender.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
