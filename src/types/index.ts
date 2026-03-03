export interface Airport {
  iataCode: string;
  name: string;
  city: string;
  isInternational: boolean;
}

export interface Airline {
  iataCode: string;
  name: string;
  type: "full-service" | "low-cost" | "regional";
  color: string;
  bookingDomain: string;
}

export interface FlightOffer {
  id: string;
  airline: Airline;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string; // ISO datetime
  arrivalTime: string;   // ISO datetime
  duration: number;      // minutes
  priceVND: number;
  source: "amadeus" | "serpapi" | "scraper";
  bookingUrl?: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  passengers: number;
}

export interface SearchResult {
  params: SearchParams;
  flights: FlightOffer[];
  searchedAt: string;
  cached: boolean;
}

export interface PriceSnapshot {
  date: string;
  airlineCode: string;
  priceVND: number;
}

export interface PriceAlert {
  id: number;
  origin: string;
  destination: string;
  departureDate: string;
  maxPriceVND: number;
  email?: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}
