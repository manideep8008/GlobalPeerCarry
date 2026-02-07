import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, User, LayoutDashboard, ShieldAlert } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { LogoutButton } from "./logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <Package className="h-7 w-7 text-[var(--color-navy-800)]" />
          <span className="text-xl font-bold text-[var(--color-navy-800)]">
            GlobalCarry
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {user ? (
            <>
              <Link
                href={ROUTES.TRIPS}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[var(--color-navy-800)]"
              >
                Browse Trips
              </Link>
              <Link
                href={ROUTES.BOOKINGS}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[var(--color-navy-800)]"
              >
                My Bookings
              </Link>
              <Link
                href={ROUTES.MESSAGES}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[var(--color-navy-800)]"
              >
                Messages
              </Link>
              <NotificationBell userId={user.id} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={profile?.avatar_url || ""}
                        alt={profile?.full_name || ""}
                      />
                      <AvatarFallback className="bg-[var(--color-navy-800)] text-white">
                        {profile?.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.DASHBOARD} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.PROFILE} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {profile?.is_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={ROUTES.ADMIN} className="cursor-pointer text-purple-600">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.LOGIN}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[var(--color-navy-800)]"
              >
                Log in
              </Link>
              <Button asChild className="bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]">
                <Link href={ROUTES.SIGNUP}>Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav user={user} profile={profile} />
      </div>
    </nav>
  );
}
