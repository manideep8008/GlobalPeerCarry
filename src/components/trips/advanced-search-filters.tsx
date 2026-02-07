"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  LocationAutocomplete,
  type LocationResult,
} from "@/components/maps/location-autocomplete";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";

interface AdvancedSearchFiltersProps {
  onSearch?: () => void;
}

export function AdvancedSearchFilters({
  onSearch,
}: AdvancedSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for locations
  const [origin, setOrigin] = useState(searchParams.get("origin") || "");
  const [originCoords, setOriginCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );
  const [destinationCoords, setDestinationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // State for dates
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") || "");

  // State for price range
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseFloat(searchParams.get("min_price") || "0"),
    parseFloat(searchParams.get("max_price") || "100"),
  ]);

  // State for weight range
  const [weightRange, setWeightRange] = useState<[number, number]>([
    parseFloat(searchParams.get("min_weight") || "0"),
    parseFloat(searchParams.get("max_weight") || "50"),
  ]);

  // Expanded filters toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleOriginChange = (location: LocationResult | null) => {
    if (location) {
      setOrigin(location.display_name);
      setOriginCoords({ lat: location.lat, lng: location.lng });
    } else {
      setOrigin("");
      setOriginCoords(null);
    }
  };

  const handleDestinationChange = (location: LocationResult | null) => {
    if (location) {
      setDestination(location.display_name);
      setDestinationCoords({ lat: location.lat, lng: location.lng });
    } else {
      setDestination("");
      setDestinationCoords(null);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (priceRange[0] > 0) params.set("min_price", priceRange[0].toString());
    if (priceRange[1] < 100) params.set("max_price", priceRange[1].toString());
    if (weightRange[0] > 0) params.set("min_weight", weightRange[0].toString());
    if (weightRange[1] < 50) params.set("max_weight", weightRange[1].toString());

    router.push(`/trips?${params.toString()}`);
    onSearch?.();
  };

  const handleClear = () => {
    setOrigin("");
    setOriginCoords(null);
    setDestination("");
    setDestinationCoords(null);
    setDateFrom("");
    setDateTo("");
    setPriceRange([0, 100]);
    setWeightRange([0, 50]);
    router.push("/trips");
    onSearch?.();
  };

  const hasFilters =
    origin ||
    destination ||
    dateFrom ||
    dateTo ||
    priceRange[0] > 0 ||
    priceRange[1] < 100 ||
    weightRange[0] > 0 ||
    weightRange[1] < 50;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {/* Basic Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <LocationAutocomplete
          value={origin}
          onChange={handleOriginChange}
          placeholder="From where?"
          label="Origin"
        />

        <LocationAutocomplete
          value={destination}
          onChange={handleDestinationChange}
          placeholder="To where?"
          label="Destination"
        />

        <div>
          <Label className="mb-2 block text-sm font-medium">From Date</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
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
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Toggle Advanced Filters */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-4 flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        {showAdvanced ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        {showAdvanced ? "Hide" : "Show"} advanced filters
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 grid gap-6 border-t pt-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label className="mb-2 block text-sm font-medium">To Date</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">
              Price Range ($/kg): ${priceRange[0]} - ${priceRange[1]}
            </Label>
            <Slider
              value={priceRange}
              onValueChange={(value) =>
                setPriceRange(value as [number, number])
              }
              min={0}
              max={100}
              step={1}
              className="mt-3"
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">
              Weight Range (kg): {weightRange[0]} - {weightRange[1]}
            </Label>
            <Slider
              value={weightRange}
              onValueChange={(value) =>
                setWeightRange(value as [number, number])
              }
              min={0}
              max={50}
              step={1}
              className="mt-3"
            />
          </div>
        </div>
      )}
    </div>
  );
}
