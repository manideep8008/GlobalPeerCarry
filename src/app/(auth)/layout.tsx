import Link from "next/link";
import { Package } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[var(--color-navy-950)] via-[var(--color-navy-800)] to-slate-800 px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-white transition-opacity hover:opacity-80"
      >
        <Package className="h-8 w-8" />
        <span className="text-2xl font-bold">GlobalCarry</span>
      </Link>
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
