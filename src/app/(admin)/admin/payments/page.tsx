import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentTransactionCard } from "@/components/admin/payment-transaction-card";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/stripe/config";
import type { PaymentTransaction, Parcel } from "@/types/database";
import { DollarSign, TrendingUp, RefreshCcw, CreditCard } from "lucide-react";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  // Fetch all payment transactions with parcel details
  const { data: transactionsData } = await supabase
    .from("payment_transactions")
    .select("*, parcel:parcels(*)")
    .order("created_at", { ascending: false });

  const transactions = (transactionsData || []) as unknown as (PaymentTransaction & {
    parcel: Parcel;
  })[];

  // Calculate stats
  const charges = transactions.filter((t) => t.type === "charge");
  const refunds = transactions.filter((t) => t.type === "refund");
  const payouts = transactions.filter((t) => t.type === "payout");

  const totalCharges = charges.reduce((sum, t) => sum + t.amount_cents, 0);
  const totalRefunds = refunds.reduce((sum, t) => sum + t.amount_cents, 0);
  const totalPayouts = payouts.reduce((sum, t) => sum + t.amount_cents, 0);
  const netRevenue = totalCharges - totalRefunds - totalPayouts;

  // Pending payouts (charges with held escrow)
  const pendingPayouts = transactions.filter(
    (t) => t.type === "charge" && t.parcel?.escrow_status === "held"
  );
  const pendingAmount = pendingPayouts.reduce(
    (sum, t) => sum + t.amount_cents,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Manage payment transactions and refunds"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Charges</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalCharges)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <RefreshCcw className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Refunds</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalRefunds)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(netRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
          <TabsTrigger value="charges">Charges ({charges.length})</TabsTrigger>
          <TabsTrigger value="refunds">Refunds ({refunds.length})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts ({payouts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No transactions yet
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <PaymentTransactionCard
                key={transaction.id}
                transaction={transaction}
                showRefundButton
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="charges" className="mt-4 space-y-4">
          {charges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No charges yet
              </CardContent>
            </Card>
          ) : (
            charges.map((transaction) => (
              <PaymentTransactionCard
                key={transaction.id}
                transaction={transaction}
                showRefundButton
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="refunds" className="mt-4 space-y-4">
          {refunds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No refunds yet
              </CardContent>
            </Card>
          ) : (
            refunds.map((transaction) => (
              <PaymentTransactionCard
                key={transaction.id}
                transaction={transaction}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="payouts" className="mt-4 space-y-4">
          {payouts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No payouts yet
              </CardContent>
            </Card>
          ) : (
            payouts.map((transaction) => (
              <PaymentTransactionCard
                key={transaction.id}
                transaction={transaction}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
