import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EarningsStats } from "@/components/earnings/earnings-stats";
import { PaymentHistory } from "@/components/earnings/payment-history";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

export default async function EarningsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Calculate platform fee multiplier (0.9 for 10% fee)
  const payoutMultiplier = 1 - PLATFORM_FEE_PERCENT / 100;

  // Get total earnings (released payouts)
  const { data: releasedParcels } = await supabase
    .from("parcels")
    .select("total_price")
    .eq("carrier_id", user.id)
    .eq("escrow_status", "released");

  const totalEarnings = (releasedParcels || []).reduce(
    (sum, p) => sum + p.total_price * payoutMultiplier,
    0
  );

  // Get pending payouts (held in escrow)
  const { data: heldParcels } = await supabase
    .from("parcels")
    .select("total_price")
    .eq("carrier_id", user.id)
    .eq("escrow_status", "held");

  const pendingPayout = (heldParcels || []).reduce(
    (sum, p) => sum + p.total_price * payoutMultiplier,
    0
  );

  // Get this month's earnings
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyParcels } = await supabase
    .from("parcels")
    .select("total_price, payout_at")
    .eq("carrier_id", user.id)
    .eq("escrow_status", "released")
    .gte("payout_at", startOfMonth.toISOString());

  const monthlyEarnings = (monthlyParcels || []).reduce(
    (sum, p) => sum + p.total_price * payoutMultiplier,
    0
  );

  // Get completed deliveries count
  const { count: completedDeliveries } = await supabase
    .from("parcels")
    .select("*", { count: "exact", head: true })
    .eq("carrier_id", user.id)
    .eq("status", "delivered");

  // Get payment history
  const { data: paymentHistory } = await supabase
    .from("parcels")
    .select(`
      id,
      title,
      total_price,
      escrow_status,
      paid_at,
      payout_at,
      trip:trips(origin, destination)
    `)
    .eq("carrier_id", user.id)
    .in("escrow_status", ["held", "released", "refunded"])
    .order("paid_at", { ascending: false })
    .limit(50);

  // Transform payment history data
  const payments = (paymentHistory || []).map((p) => {
    // Trip is returned as a single object from the join, cast through unknown first
    const tripData = p.trip as unknown as { origin: string; destination: string } | null;
    return {
      id: p.id,
      title: p.title,
      total_price: p.total_price,
      escrow_status: p.escrow_status,
      paid_at: p.paid_at,
      payout_at: p.payout_at,
      trip: {
        origin: tripData?.origin || "Unknown",
        destination: tripData?.destination || "Unknown",
      },
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Earnings"
        description="Track your income and payment history"
      />

      <EarningsStats
        totalEarnings={totalEarnings}
        monthlyEarnings={monthlyEarnings}
        pendingPayout={pendingPayout}
        completedDeliveries={completedDeliveries ?? 0}
      />

      <PaymentHistory payments={payments} />
    </div>
  );
}
