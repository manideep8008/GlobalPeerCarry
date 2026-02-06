"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  LayoutDashboard,
  ShieldCheck,
  Flag,
  Users,
  CreditCard,
} from "lucide-react";

const adminLinks = [
  { href: ROUTES.ADMIN, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.ADMIN_KYC, label: "KYC Review", icon: ShieldCheck },
  { href: ROUTES.ADMIN_REPORTS, label: "Reports", icon: Flag },
  { href: ROUTES.ADMIN_USERS, label: "Users", icon: Users },
  { href: ROUTES.ADMIN_PAYMENTS, label: "Payments", icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-slate-50/50 md:block">
      <div className="border-b p-4">
        <h2 className="font-semibold text-[var(--color-navy-800)]">Admin Panel</h2>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-navy-800)] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
