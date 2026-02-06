import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Flag, Users, Ban } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get counts
  const { count: pendingKycCount } = await supabase
    .from("kyc_documents")
    .select("*", { count: "exact", head: true })
    .eq("review_status", "pending");

  const { count: pendingReportsCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "reviewing"]);

  const { count: totalUsersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: bannedUsersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_banned", true);

  const stats = [
    {
      title: "Pending KYC",
      value: pendingKycCount ?? 0,
      icon: ShieldCheck,
      href: "/admin/kyc",
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      title: "Open Reports",
      value: pendingReportsCount ?? 0,
      icon: Flag,
      href: "/admin/reports",
      color: "text-red-600 bg-red-100",
    },
    {
      title: "Total Users",
      value: totalUsersCount ?? 0,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Banned Users",
      value: bannedUsersCount ?? 0,
      icon: Ban,
      href: "/admin/users",
      color: "text-slate-600 bg-slate-100",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Manage users, KYC verification, and reports"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
