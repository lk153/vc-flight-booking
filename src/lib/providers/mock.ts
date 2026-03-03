import type { FlightOffer, SearchParams } from "@/types";
import { AIRLINES } from "@/lib/airports";
import type { FlightProvider } from "./types";

// Generate realistic mock flight data for development
function generateMockFlights(params: SearchParams): FlightOffer[] {
  const flights: FlightOffer[] = [];
  const baseDate = new Date(params.departureDate + "T00:00:00");

  // Each airline has 2-4 flights per route per day
  const activeAirlines = AIRLINES.filter((a) => a.iataCode !== "0V"); // VASCO only on specific routes

  for (const airline of activeAirlines) {
    const numFlights = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numFlights; i++) {
      const departureHour = 5 + Math.floor(Math.random() * 17); // 5:00 - 22:00
      const departureMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      const duration = 100 + Math.floor(Math.random() * 40); // 1h40 - 2h20

      const departure = new Date(baseDate);
      departure.setHours(departureHour, departureMinute, 0, 0);

      const arrival = new Date(departure.getTime() + duration * 60000);

      // Price varies by airline type and time
      let basePrice: number;
      switch (airline.type) {
        case "low-cost":
          basePrice = 650_000 + Math.random() * 800_000;
          break;
        case "full-service":
          basePrice = 900_000 + Math.random() * 1_200_000;
          break;
        case "regional":
          basePrice = 800_000 + Math.random() * 600_000;
          break;
      }

      // Early morning and late night are cheaper
      if (departureHour < 7 || departureHour > 20) {
        basePrice *= 0.8;
      }

      // Weekend flights are more expensive
      const dayOfWeek = departure.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        basePrice *= 1.2;
      }

      const flightNum = Math.floor(Math.random() * 900) + 100;

      flights.push({
        id: `mock-${airline.iataCode}-${flightNum}-${i}`,
        airline,
        flightNumber: `${airline.iataCode} ${flightNum}`,
        origin: params.origin,
        destination: params.destination,
        departureTime: departure.toISOString(),
        arrivalTime: arrival.toISOString(),
        duration,
        priceVND: Math.round(basePrice / 1000) * 1000, // Round to nearest 1,000đ
        source: "amadeus",
      });
    }
  }

  return flights.sort((a, b) => a.priceVND - b.priceVND);
}

export const mockProvider: FlightProvider = {
  name: "Mock",
  async search(params: SearchParams): Promise<FlightOffer[]> {
    // Simulate API latency
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));
    return generateMockFlights(params);
  },
};
