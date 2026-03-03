import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/providers/aggregator";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = searchParams.get("origin");
  const destination = searchParams.get("dest");
  const departureDate = searchParams.get("date");
  const passengers = parseInt(searchParams.get("pax") || "1", 10);

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: "Missing required parameters: origin, dest, date" },
      { status: 400 }
    );
  }

  if (origin === destination) {
    return NextResponse.json(
      { error: "Origin and destination must be different" },
      { status: 400 }
    );
  }

  try {
    const flights = await searchFlights({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      passengers: Math.max(1, Math.min(9, passengers)),
    });

    return NextResponse.json({
      params: { origin, destination, departureDate, passengers },
      flights,
      searchedAt: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Failed to search flights" },
      { status: 500 }
    );
  }
}
