"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface EarningsStatsProps {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayout: number;
  completedDeliveries: number;
}

export function EarningsStats({
  totalEarnings,
  monthlyEarnings,
  pendingPayout,
  completedDeliveries,
}: EarningsStatsProps) {
  const stats = [
    {
      title: "Total Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      description: "Lifetime earnings",
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "This Month",
      value: `$${monthlyEarnings.toFixed(2)}`,
      description: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Pending Payout",
      value: `$${pendingPayout.toFixed(2)}`,
      description: "In escrow",
      icon: Clock,
      color: "text-amber-600 bg-amber-100",
    },
    {
      title: "Completed",
      value: completedDeliveries.toString(),
      description: "Deliveries",
      icon: CheckCircle,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
