"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

export function TripSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin") || "");
  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );
  const [date, setDate] = useState(searchParams.get("date") || "");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    router.push(`/trips?${params.toString()}`);
  };

  const handleClear = () => {
    setOrigin("");
    setDestination("");
    setDate("");
    router.push("/trips");
  };

  const hasFilters = origin || destination || date;

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="filter-origin" className="text-xs">
            Origin
          </Label>
          <Input
            id="filter-origin"
            placeholder="From where?"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-destination" className="text-xs">
            Destination
          </Label>
          <Input
            id="filter-destination"
            placeholder="To where?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-date" className="text-xs">
            Date
          </Label>
          <Input
            id="filter-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            onClick={handleSearch}
            className="flex-1 bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          {hasFilters && (
            <Button variant="outline" size="icon" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
