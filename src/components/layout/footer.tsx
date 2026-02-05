import Link from "next/link";
import { Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-[var(--color-navy-800)]" />
              <span className="text-lg font-bold text-[var(--color-navy-800)]">
                GlobalCarry
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-slate-500">
              Connect with travelers to send your parcels worldwide. Safe,
              affordable, and community-powered logistics.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/trips"
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Browse Trips
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Become a Carrier
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-slate-500">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-slate-500">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} GlobalCarry. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
