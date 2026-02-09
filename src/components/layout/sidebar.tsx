"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useUser } from "@/hooks/use-user";
import {
  LayoutDashboard,
  Search,
  Package,
  MessageSquare,
  User,
  PlusCircle,
  ShieldAlert,
  DollarSign,
} from "lucide-react";

const sidebarLinks = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.NEW_TRIP, label: "Post a Trip", icon: PlusCircle },
  { href: ROUTES.TRIPS, label: "Browse Trips", icon: Search },
  { href: ROUTES.BOOKINGS, label: "My Bookings", icon: Package },
  { href: "/earnings", label: "Earnings", icon: DollarSign },
  { href: ROUTES.MESSAGES, label: "Messages", icon: MessageSquare },
  { href: ROUTES.PROFILE, label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useUser();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-slate-50/50 md:block">
      <nav className="flex flex-col gap-1 p-4">
        {sidebarLinks.map((link) => {
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

        {/* Admin Link */}
        {profile?.is_admin && (
          <>
            <div className="my-2 h-px bg-slate-200" />
            <Link
              href={ROUTES.ADMIN}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-purple-600 text-white"
                  : "text-purple-600 hover:bg-purple-50"
              )}
            >
              <ShieldAlert className="h-4 w-4" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
