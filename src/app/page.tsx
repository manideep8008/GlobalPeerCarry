import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Package,
  Plane,
  Shield,
  ArrowRight,
  MapPin,
  DollarSign,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-navy-950)] via-[var(--color-navy-800)] to-[var(--color-navy-700)] py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ship Anything, Anywhere
              <span className="block text-blue-300">
                With Travelers You Trust
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              GlobalCarry connects people who need to send parcels with
              travelers who have spare luggage space. Save money, reduce waste,
              and build a global community.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-white text-[var(--color-navy-800)] hover:bg-slate-100 sm:w-auto"
              >
                <Link href="/signup">
                  Send a Parcel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
              >
                <Link href="/signup">Become a Carrier</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              How It Works
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Three simple steps to ship your parcel
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Plane,
                title: "1. Post or Find a Trip",
                description:
                  "Carriers list their travel routes with available luggage space. Senders search for matching trips.",
              },
              {
                icon: Package,
                title: "2. Match & Book",
                description:
                  "Send a booking request. Once the carrier accepts, your payment is held safely in escrow.",
              },
              {
                icon: CheckCircle,
                title: "3. Deliver & Confirm",
                description:
                  "The carrier delivers your parcel. Confirm with a secure PIN to release payment.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="relative rounded-xl border bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                  <step.icon className="h-7 w-7 text-[var(--color-navy-800)]" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Built on Trust
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Your security is our top priority
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Verified Profiles",
                description:
                  "Every user goes through identity verification. Look for the verified badge on profiles.",
              },
              {
                icon: DollarSign,
                title: "Escrow Protection",
                description:
                  "Payments are held securely until delivery is confirmed with a PIN. No surprises.",
              },
              {
                icon: MapPin,
                title: "Safety Checklist",
                description:
                  "A mandatory safety checklist ensures both parties agree on terms before every handoff.",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 rounded-lg p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-navy-800)]">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-[var(--color-navy-800)] to-[var(--color-navy-950)] px-8 py-16 text-center shadow-lg sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Join GlobalCarry Today
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Whether you&apos;re sending or carrying, become part of the
              community.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-white text-[var(--color-navy-800)] hover:bg-slate-100"
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
