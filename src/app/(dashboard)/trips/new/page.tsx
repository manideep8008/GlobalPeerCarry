import { TripForm } from "@/components/trips/trip-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Post a Trip"
        description="List your travel route and available luggage space"
      />
      <TripForm />
    </div>
  );
}
