"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PAYMENT_TRANSACTION_TYPE_LABELS,
  PAYMENT_TRANSACTION_TYPE_COLORS,
  PAYMENT_STATUS_COLORS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/stripe/config";
import type { PaymentTransaction, Parcel } from "@/types/database";
import { Loader2, RefreshCcw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PaymentTransactionCardProps {
  transaction: PaymentTransaction & { parcel?: Parcel };
  showRefundButton?: boolean;
}

export function PaymentTransactionCard({
  transaction,
  showRefundButton = false,
}: PaymentTransactionCardProps) {
  const router = useRouter();
  const [isRefunding, setIsRefunding] = useState(false);

  const handleRefund = async () => {
    if (!transaction.parcel?.id) return;

    setIsRefunding(true);
    try {
      const response = await fetch(
        `/api/bookings/${transaction.parcel.id}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process refund");
      }

      toast.success("Refund processed successfully");
      router.refresh();
    } catch (error) {
      console.error("Refund error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process refund"
      );
    } finally {
      setIsRefunding(false);
    }
  };

  const canRefund =
    showRefundButton &&
    transaction.type === "charge" &&
    transaction.status === "succeeded" &&
    transaction.parcel?.escrow_status === "held";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={PAYMENT_TRANSACTION_TYPE_COLORS[transaction.type]}
              >
                {PAYMENT_TRANSACTION_TYPE_LABELS[transaction.type]}
              </Badge>
              <Badge
                variant="secondary"
                className={
                  PAYMENT_STATUS_COLORS[transaction.status] ||
                  "bg-slate-100 text-slate-800"
                }
              >
                {transaction.status}
              </Badge>
            </div>

            <div className="text-2xl font-bold">
              {transaction.type === "refund" ? "-" : ""}
              {formatCurrency(transaction.amount_cents)}
            </div>

            {transaction.parcel && (
              <div className="text-sm text-muted-foreground">
                Parcel: {transaction.parcel.title}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {format(new Date(transaction.created_at), "MMM d, yyyy h:mm a")}
              </span>
              <span className="font-mono">{transaction.stripe_id}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {transaction.parcel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/bookings/${transaction.parcel?.id}`)
                }
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                View
              </Button>
            )}

            {canRefund && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefund}
                disabled={isRefunding}
                className="text-red-600 hover:bg-red-50"
              >
                {isRefunding ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-1 h-3 w-3" />
                )}
                Refund
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
