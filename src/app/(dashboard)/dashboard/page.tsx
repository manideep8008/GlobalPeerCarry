import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EarningsSummaryCard } from "@/components/earnings/earnings-summary-card";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";
import {
  Plane,
  Package,
  MessageSquare,
  Search,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: tripCount } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .eq("carrier_id", user!.id)
    .eq("is_active", true);

  const { count: bookingCount } = await supabase
    .from("parcels")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", user!.id)
    .in("status", ["pending", "accepted", "in_transit"]);

  const { count: messageCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user!.id)
    .eq("is_read", false);

  // Get earnings data
  const payoutMultiplier = 1 - PLATFORM_FEE_PERCENT / 100;

  const { data: releasedParcels } = await supabase
    .from("parcels")
    .select("total_price")
    .eq("carrier_id", user!.id)
    .eq("escrow_status", "released");

  const totalEarnings = (releasedParcels || []).reduce(
    (sum, p) => sum + p.total_price * payoutMultiplier,
    0
  );

  const { data: heldParcels } = await supabase
    .from("parcels")
    .select("total_price")
    .eq("carrier_id", user!.id)
    .eq("escrow_status", "held");

  const pendingPayout = (heldParcels || []).reduce(
    (sum, p) => sum + p.total_price * payoutMultiplier,
    0
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back to GlobalCarry"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Trips you&apos;re carrying
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Bookings
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Parcels you&apos;re sending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messageCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">New messages</p>
          </CardContent>
        </Card>
        <EarningsSummaryCard
          totalEarnings={totalEarnings}
          pendingPayout={pendingPayout}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <Link href="/trips/new" className="block p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <PlusCircle className="h-6 w-6 text-[var(--color-navy-800)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Post a Trip</h3>
                  <p className="text-sm text-muted-foreground">
                    List your travel route
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <Link href="/trips" className="block p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                  <Search className="h-6 w-6 text-green-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Find a Carrier</h3>
                  <p className="text-sm text-muted-foreground">
                    Search available trips
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <Link href="/messages" className="block p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                  <MessageSquare className="h-6 w-6 text-purple-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-sm text-muted-foreground">
                    View conversations
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
