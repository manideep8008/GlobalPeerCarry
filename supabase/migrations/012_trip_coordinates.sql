-- Phase 5: Discovery & Search with Map
-- Migration: 012_trip_coordinates.sql

-- Add coordinate columns to trips table
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS origin_lat NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS origin_lng NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS destination_lat NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS destination_lng NUMERIC(9,6);

-- Create indexes for coordinate-based queries
CREATE INDEX IF NOT EXISTS trips_origin_coords_idx ON public.trips (origin_lat, origin_lng);
CREATE INDEX IF NOT EXISTS trips_destination_coords_idx ON public.trips (destination_lat, destination_lng);

-- Comments for documentation
COMMENT ON COLUMN public.trips.origin_lat IS 'Latitude of origin location';
COMMENT ON COLUMN public.trips.origin_lng IS 'Longitude of origin location';
COMMENT ON COLUMN public.trips.destination_lat IS 'Latitude of destination location';
COMMENT ON COLUMN public.trips.destination_lng IS 'Longitude of destination location';
