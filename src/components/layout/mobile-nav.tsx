"use client";

import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Package, ShieldAlert } from "lucide-react";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

interface MobileNavProps {
  user: User | null;
  profile: Profile | null;
}

export function MobileNav({ user, profile }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetTitle className="flex items-center gap-2 px-2">
          <Package className="h-5 w-5 text-[var(--color-navy-800)]" />
          GlobalCarry
        </SheetTitle>
        <div className="mt-6 flex flex-col gap-3">
          {user ? (
            <>
              <p className="px-2 text-sm text-muted-foreground">
                Signed in as {profile?.full_name || user.email}
              </p>
              <Link
                href={ROUTES.DASHBOARD}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
              >
                Dashboard
              </Link>
              <Link
                href={ROUTES.TRIPS}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
              >
                Browse Trips
              </Link>
              <Link
                href={ROUTES.BOOKINGS}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
              >
                My Bookings
              </Link>
              <Link
                href="/earnings"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
              >
                Earnings
              </Link>
              <Link
                href={ROUTES.MESSAGES}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
              >
                Messages
              </Link>
              <Link
                href={ROUTES.PROFILE}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
              >
                Profile
              </Link>

              {/* Admin Link */}
              {profile?.is_admin && (
                <>
                  <div className="my-1 h-px bg-slate-200" />
                  <Link
                    href={ROUTES.ADMIN}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.LOGIN} onClick={() => setOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button
                asChild
                className="w-full bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
              >
                <Link href={ROUTES.SIGNUP} onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
