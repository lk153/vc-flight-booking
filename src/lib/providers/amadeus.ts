import type { FlightOffer, SearchParams } from "@/types";
import { getAirline } from "@/lib/airports";
import type { FlightProvider } from "./types";

// Amadeus API types (simplified)
interface AmadeusToken {
  access_token: string;
  expires_in: number;
  fetchedAt: number;
}

let cachedToken: AmadeusToken | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Amadeus API credentials not configured");
  }

  // Reuse token if still valid (with 60s buffer)
  if (
    cachedToken &&
    Date.now() - cachedToken.fetchedAt < (cachedToken.expires_in - 60) * 1000
  ) {
    return cachedToken.access_token;
  }

  const res = await fetch(
    "https://api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Amadeus auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = { ...data, fetchedAt: Date.now() };
  return data.access_token;
}

function parseDuration(iso8601: string): number {
  // PT2H10M → 130 minutes
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || "0") * 60) + parseInt(match[2] || "0");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapAmadeusToFlightOffer(offer: any): FlightOffer | null {
  try {
    const segment = offer.itineraries[0].segments[0];
    const airlineCode = segment.carrierCode;
    const airline = getAirline(airlineCode);
    if (!airline) return null;

    return {
      id: `amadeus-${offer.id}`,
      airline,
      flightNumber: `${airlineCode} ${segment.number}`,
      origin: segment.departure.iataCode,
      destination: segment.arrival.iataCode,
      departureTime: segment.departure.at,
      arrivalTime: segment.arrival.at,
      duration: parseDuration(offer.itineraries[0].duration),
      priceVND: Math.round(parseFloat(offer.price.grandTotal) * 25_000), // USD to VND approximate
      source: "amadeus",
    };
  } catch {
    return null;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const amadeusProvider: FlightProvider = {
  name: "Amadeus",

  async search(params: SearchParams): Promise<FlightOffer[]> {
    const token = await getAccessToken();

    const url = new URL(
      "https://api.amadeus.com/v2/shopping/flight-offers"
    );
    url.searchParams.set("originLocationCode", params.origin);
    url.searchParams.set("destinationLocationCode", params.destination);
    url.searchParams.set("departureDate", params.departureDate);
    url.searchParams.set("adults", String(params.passengers));
    url.searchParams.set("currencyCode", "USD");
    url.searchParams.set("max", "20");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`Amadeus search failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const offers: FlightOffer[] = [];

    for (const offer of data.data || []) {
      const mapped = mapAmadeusToFlightOffer(offer);
      if (mapped) offers.push(mapped);
    }

    return offers;
  },
};
