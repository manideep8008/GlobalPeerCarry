"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRight, Receipt } from "lucide-react";
import Link from "next/link";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";
import type { EscrowStatus } from "@/types/database";

interface PaymentHistoryItem {
  id: string;
  title: string;
  total_price: number;
  escrow_status: EscrowStatus;
  paid_at: string | null;
  payout_at: string | null;
  trip: {
    origin: string;
    destination: string;
  };
}

interface PaymentHistoryProps {
  payments: PaymentHistoryItem[];
}

function getStatusBadge(status: EscrowStatus) {
  switch (status) {
    case "held":
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Held</Badge>;
    case "released":
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Paid</Badge>;
    case "refunded":
      return <Badge variant="secondary" className="bg-red-100 text-red-700">Refunded</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No payments yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Complete deliveries to start earning money
            </p>
            <Link
              href="/trips"
              className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Browse trips to get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Route</th>
                <th className="pb-3 font-medium">Booking</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => {
                const carrierPayout = payment.total_price * (1 - PLATFORM_FEE_PERCENT / 100);
                const displayDate = payment.payout_at || payment.paid_at;

                return (
                  <tr key={payment.id} className="text-sm">
                    <td className="py-3">
                      {displayDate
                        ? format(new Date(displayDate), "MMM d, yyyy")
                        : "-"}
                    </td>
                    <td className="py-3">
                      <span className="font-medium">{payment.trip.origin}</span>
                      <span className="text-muted-foreground mx-1">→</span>
                      <span className="font-medium">{payment.trip.destination}</span>
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/bookings/${payment.id}`}
                        className="text-blue-600 hover:underline truncate max-w-[150px] block"
                      >
                        {payment.title}
                      </Link>
                    </td>
                    <td className="py-3 text-right font-semibold">
                      ${carrierPayout.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      {getStatusBadge(payment.escrow_status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
