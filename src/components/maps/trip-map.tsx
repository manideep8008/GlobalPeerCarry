"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { TripMarkerPopup } from "./trip-marker-popup";
import type { TripWithCarrier } from "@/types";

// Fix for default marker icon in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom origin marker (blue)
const OriginIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface TripMapProps {
  trips: TripWithCarrier[];
  selectedTripId?: string;
  onTripSelect?: (tripId: string) => void;
  height?: string;
  showOrigins?: boolean;
  showDestinations?: boolean;
}

// Component to fit bounds when trips change
function FitBounds({ trips }: { trips: TripWithCarrier[] }) {
  const map = useMap();
  const prevTripsRef = useRef<string>("");

  useEffect(() => {
    // Get trips with coordinates
    const tripsWithCoords = trips.filter(
      (trip) =>
        (trip.origin_lat && trip.origin_lng) ||
        (trip.destination_lat && trip.destination_lng)
    );

    // Create a string key to compare trips
    const tripsKey = tripsWithCoords.map((t) => t.id).join(",");

    // Only update if trips actually changed
    if (tripsKey === prevTripsRef.current) return;
    prevTripsRef.current = tripsKey;

    if (tripsWithCoords.length === 0) return;

    const bounds: [number, number][] = [];

    tripsWithCoords.forEach((trip) => {
      if (trip.origin_lat && trip.origin_lng) {
        bounds.push([trip.origin_lat, trip.origin_lng]);
      }
      if (trip.destination_lat && trip.destination_lng) {
        bounds.push([trip.destination_lat, trip.destination_lng]);
      }
    });

    if (bounds.length > 0) {
      const leafletBounds = L.latLngBounds(bounds);
      map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [trips, map]);

  return null;
}

export default function TripMap({
  trips,
  selectedTripId,
  onTripSelect,
  height = "h-[400px]",
  showOrigins = true,
  showDestinations = false,
}: TripMapProps) {
  // Default center (world view)
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;

  // Filter trips with coordinates
  const tripsWithCoords = useMemo(
    () =>
      trips.filter(
        (trip) =>
          (showOrigins && trip.origin_lat && trip.origin_lng) ||
          (showDestinations && trip.destination_lat && trip.destination_lng)
      ),
    [trips, showOrigins, showDestinations]
  );

  return (
    <div className={`${height} w-full overflow-hidden rounded-lg border`}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds trips={trips} />

        {tripsWithCoords.map((trip) => (
          <Marker
            key={trip.id}
            position={[trip.origin_lat!, trip.origin_lng!]}
            icon={OriginIcon}
            eventHandlers={{
              click: () => onTripSelect?.(trip.id),
            }}
          >
            <Popup>
              <TripMarkerPopup trip={trip} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
