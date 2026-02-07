"use client";

import { MapPin } from "lucide-react";

interface MapSkeletonProps {
  height?: string;
}

export function MapSkeleton({ height = "h-[400px]" }: MapSkeletonProps) {
  return (
    <div
      className={`${height} flex w-full items-center justify-center rounded-lg bg-slate-100`}
    >
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <MapPin className="h-8 w-8 animate-pulse" />
        <p className="text-sm">Loading map...</p>
      </div>
    </div>
  );
}
