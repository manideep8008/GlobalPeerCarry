import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "GlobalCarry/1.0 (https://globalcarry.com)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    // Transform to simpler format
    const results = data.map(
      (item: {
        display_name: string;
        lat: string;
        lon: string;
        address?: {
          city?: string;
          town?: string;
          village?: string;
          country?: string;
        };
      }) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        city:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          "",
        country: item.address?.country || "",
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to geocode location" },
      { status: 500 }
    );
  }
}
