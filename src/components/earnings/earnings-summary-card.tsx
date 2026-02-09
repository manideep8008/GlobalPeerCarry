"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowRight } from "lucide-react";

interface EarningsSummaryCardProps {
  totalEarnings: number;
  pendingPayout: number;
}

export function EarningsSummaryCard({
  totalEarnings,
  pendingPayout,
}: EarningsSummaryCardProps) {
  return (
    <Link href="/earnings">
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <div className="rounded-full p-2 bg-green-100 text-green-600">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${totalEarnings.toFixed(2)}
          </div>
          {pendingPayout > 0 && (
            <p className="text-xs text-muted-foreground">
              + ${pendingPayout.toFixed(2)} pending
            </p>
          )}
          {pendingPayout === 0 && totalEarnings === 0 && (
            <p className="text-xs text-muted-foreground">
              Start delivering to earn
            </p>
          )}
          <div className="mt-2 flex items-center text-xs text-blue-600">
            View details
            <ArrowRight className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
