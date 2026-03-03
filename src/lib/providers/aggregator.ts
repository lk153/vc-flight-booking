import type { FlightOffer, SearchParams } from "@/types";
import type { FlightProvider } from "./types";
import { amadeusProvider } from "./amadeus";
import { serpApiProvider } from "./serpapi";
import { mockProvider } from "./mock";

function getProviders(): FlightProvider[] {
  const providers: FlightProvider[] = [];

  // Add Amadeus if credentials are configured
  if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
    providers.push(amadeusProvider);
  }

  // Add SerpApi (Google Flights) if key is configured
  if (process.env.SERPAPI_KEY) {
    providers.push(serpApiProvider);
  }

  // Fallback to mock data if no real API keys are available
  if (providers.length === 0) {
    return [mockProvider];
  }

  return providers;
}

function deduplicateFlights(flights: FlightOffer[]): FlightOffer[] {
  const seen = new Map<string, FlightOffer>();

  for (const flight of flights) {
    // Use flight number + departure time as unique key
    const key = `${flight.flightNumber}-${flight.departureTime}`;
    const existing = seen.get(key);
    if (!existing || flight.priceVND < existing.priceVND) {
      seen.set(key, flight);
    }
  }

  return Array.from(seen.values());
}

export async function searchFlights(
  params: SearchParams
): Promise<FlightOffer[]> {
  const providers = getProviders();

  const results = await Promise.allSettled(
    providers.map((p) => p.search(params))
  );

  const allFlights: FlightOffer[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allFlights.push(...result.value);
    } else {
      console.error("Provider failed:", result.reason);
    }
  }

  const deduplicated = deduplicateFlights(allFlights);
  return deduplicated.sort((a, b) => a.priceVND - b.priceVND);
}
