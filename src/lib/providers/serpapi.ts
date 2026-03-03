import type { FlightOffer, SearchParams } from "@/types";
import { getAirline, AIRLINES } from "@/lib/airports";
import type { FlightProvider } from "./types";

// Map Google Flights carrier names to our airline IATA codes
const CARRIER_NAME_MAP: Record<string, string> = {
  "Vietnam Airlines": "VN",
  "Vietjet Air": "VJ",
  "VietJet Air": "VJ",
  "Bamboo Airways": "QH",
  "Vietravel Airlines": "VU",
  "Pacific Airlines": "BL",
  "VASCO": "0V",
};

function resolveAirlineCode(carrierName: string): string | null {
  // Direct name match
  if (CARRIER_NAME_MAP[carrierName]) {
    return CARRIER_NAME_MAP[carrierName];
  }
  // Partial match
  const lower = carrierName.toLowerCase();
  for (const [name, code] of Object.entries(CARRIER_NAME_MAP)) {
    if (lower.includes(name.toLowerCase()) || name.toLowerCase().includes(lower)) {
      return code;
    }
  }
  return null;
}

function parseDurationMinutes(durationStr: string): number {
  // "2 hr 10 min" → 130
  let minutes = 0;
  const hrMatch = durationStr.match(/(\d+)\s*hr/);
  const minMatch = durationStr.match(/(\d+)\s*min/);
  if (hrMatch) minutes += parseInt(hrMatch[1]) * 60;
  if (minMatch) minutes += parseInt(minMatch[1]);
  return minutes || 120; // fallback 2h
}

function parseTimeToISO(timeStr: string, baseDate: string): string {
  // "6:00 AM" or "14:30" → ISO string
  let hours: number;
  let mins: number;

  const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    hours = parseInt(match12[1]);
    mins = parseInt(match12[2]);
    const period = match12[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  } else {
    const match24 = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match24) {
      hours = parseInt(match24[1]);
      mins = parseInt(match24[2]);
    } else {
      hours = 0;
      mins = 0;
    }
  }

  return `${baseDate}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapSerpApiFlights(data: any, params: SearchParams): FlightOffer[] {
  const flights: FlightOffer[] = [];

  // SerpApi returns best_flights and other_flights arrays
  const allFlights = [
    ...(data.best_flights || []),
    ...(data.other_flights || []),
  ];

  for (const itinerary of allFlights) {
    // Each itinerary has a flights array (segments)
    const segments = itinerary.flights || [];
    if (segments.length === 0) continue;

    // We focus on direct flights (1 segment) for simplicity
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];

    const carrierName = firstSeg.airline || "";
    const airlineCode = resolveAirlineCode(carrierName);
    if (!airlineCode) continue; // Skip non-Vietnamese airlines

    const airline = getAirline(airlineCode);
    if (!airline) continue;

    const price = itinerary.price;
    if (!price) continue;

    const departureTime = firstSeg.departure_airport?.time
      ? parseTimeToISO(firstSeg.departure_airport.time, params.departureDate)
      : `${params.departureDate}T00:00:00`;

    const arrivalTime = lastSeg.arrival_airport?.time
      ? parseTimeToISO(lastSeg.arrival_airport.time, params.departureDate)
      : `${params.departureDate}T02:00:00`;

    const totalDuration = itinerary.total_duration || parseDurationMinutes(
      firstSeg.duration?.toString() || "120"
    );

    const flightNumber = firstSeg.flight_number
      ? `${airlineCode} ${firstSeg.flight_number}`
      : `${airlineCode} ${Math.floor(Math.random() * 900) + 100}`;

    flights.push({
      id: `serpapi-${airlineCode}-${flightNumber}-${Date.now()}-${flights.length}`,
      airline,
      flightNumber,
      origin: params.origin,
      destination: params.destination,
      departureTime,
      arrivalTime,
      duration: typeof totalDuration === "number" ? totalDuration : parseDurationMinutes(String(totalDuration)),
      priceVND: Math.round(price * 25_000), // USD to VND approximate
      source: "serpapi",
    });
  }

  return flights;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const serpApiProvider: FlightProvider = {
  name: "SerpApi",

  async search(params: SearchParams): Promise<FlightOffer[]> {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error("SERPAPI_KEY not configured");
    }

    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_flights");
    url.searchParams.set("departure_id", params.origin);
    url.searchParams.set("arrival_id", params.destination);
    url.searchParams.set("outbound_date", params.departureDate);
    url.searchParams.set("adults", String(params.passengers));
    url.searchParams.set("currency", "USD");
    url.searchParams.set("hl", "en");
    url.searchParams.set("type", "2"); // one-way
    url.searchParams.set("api_key", apiKey);

    const res = await fetch(url.toString());

    if (!res.ok) {
      console.error(`SerpApi search failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return mapSerpApiFlights(data, params);
  },
};
