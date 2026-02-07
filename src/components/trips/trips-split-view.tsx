"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapSkeleton } from "@/components/maps/map-skeleton";
import { TripList } from "./trip-list";
import { Map, List } from "lucide-react";
import type { TripWithCarrier } from "@/types";

// Dynamic import for map (client-side only)
const TripMap = dynamic(() => import("@/components/maps/trip-map"), {
  ssr: false,
  loading: () => <MapSkeleton height="h-full" />,
});

interface TripsSplitViewProps {
  trips: TripWithCarrier[];
}

export function TripsSplitView({ trips }: TripsSplitViewProps) {
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<string>("list");

  // Check if any trips have coordinates
  const hasCoordinates = trips.some(
    (trip) => trip.origin_lat && trip.origin_lng
  );

  return (
    <>
      {/* Desktop: Side by side layout */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Map Panel */}
        <div className="h-[calc(100vh-300px)] min-h-[400px]">
          {hasCoordinates ? (
            <TripMap
              trips={trips}
              selectedTripId={selectedTripId}
              onTripSelect={setSelectedTripId}
              height="h-full"
              showOrigins={true}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border bg-slate-50">
              <div className="text-center text-slate-500">
                <Map className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm">
                  No trips with location data yet.
                  <br />
                  Create a trip to see it on the map!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* List Panel */}
        <ScrollArea className="h-[calc(100vh-300px)] min-h-[400px] rounded-lg border bg-white p-4">
          <TripList
            trips={trips}
            selectedTripId={selectedTripId}
            onTripSelect={setSelectedTripId}
          />
        </ScrollArea>
      </div>

      {/* Mobile: Tabs layout */}
      <div className="lg:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-0">
            <TripList
              trips={trips}
              selectedTripId={selectedTripId}
              onTripSelect={setSelectedTripId}
            />
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            {hasCoordinates ? (
              <TripMap
                trips={trips}
                selectedTripId={selectedTripId}
                onTripSelect={(id) => {
                  setSelectedTripId(id);
                  setActiveTab("list"); // Switch to list to show selected
                }}
                height="h-[400px]"
                showOrigins={true}
              />
            ) : (
              <div className="flex h-[400px] items-center justify-center rounded-lg border bg-slate-50">
                <div className="text-center text-slate-500">
                  <Map className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p className="text-sm">No trips with location data yet.</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
