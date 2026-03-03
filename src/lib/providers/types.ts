import type { FlightOffer, SearchParams } from "@/types";

export interface FlightProvider {
  name: string;
  search(params: SearchParams): Promise<FlightOffer[]>;
}
