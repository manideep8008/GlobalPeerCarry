"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  LayoutDashboard,
  Plane,
  Search,
  Package,
  MessageSquare,
  User,
  PlusCircle,
} from "lucide-react";

const sidebarLinks = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.NEW_TRIP, label: "Post a Trip", icon: PlusCircle },
  { href: ROUTES.TRIPS, label: "Browse Trips", icon: Search },
  { href: ROUTES.BOOKINGS, label: "My Bookings", icon: Package },
  { href: ROUTES.MESSAGES, label: "Messages", icon: MessageSquare },
  { href: ROUTES.PROFILE, label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

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
      </nav>
    </aside>
  );
}
