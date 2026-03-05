"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AirportSelect } from "./AirportSelect";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Search,
  CalendarDays,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TRIP_TYPES = ["One-way", "Round-trip"] as const;

export function SearchForm({
  defaultOrigin = "",
  defaultDestination = "",
  defaultDate = "",
  defaultPassengers = 1,
}: {
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDate?: string;
  defaultPassengers?: number;
}) {
  const router = useRouter();
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [date, setDate] = useState(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [passengers, setPassengers] = useState(defaultPassengers);
  const [tripType, setTripType] = useState<(typeof TRIP_TYPES)[number]>("One-way");

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination || !date) return;

    const params = new URLSearchParams({
      origin,
      dest: destination,
      date,
      pax: String(passengers),
    });

    router.push(`/search?${params.toString()}`);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6">
        {/* Trip type toggle */}
        <div className="mb-4 flex gap-1 rounded-xl bg-muted p-1">
          {TRIP_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTripType(type)}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                tripType === type
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* From / To with swap */}
        <div className="relative mb-3">
          <div className="space-y-2">
            <AirportSelect
              label="From"
              value={origin}
              onChange={setOrigin}
              excludeCode={destination}
            />
            <AirportSelect
              label="To"
              value={destination}
              onChange={setDestination}
              excludeCode={origin}
            />
          </div>
          {/* Swap button — positioned on the right edge between the two fields */}
          <button
            type="button"
            onClick={handleSwap}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary"
            title="Swap origin and destination"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        {/* Date & Passengers row */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              Departure
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-muted px-3 text-sm text-foreground transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3 w-3" />
              Passengers
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="h-12 w-full rounded-xl border border-border bg-muted px-3 text-sm text-foreground transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Adult" : "Adults"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search button */}
        <Button
          type="submit"
          disabled={!origin || !destination || !date}
          className="h-12 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
        >
          <Search className="mr-2 h-4 w-4" />
          Search Flights
        </Button>
      </div>
    </form>
  );
}
