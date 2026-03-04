"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AirportSelect } from "./AirportSelect";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Search } from "lucide-react";

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

  // Min date is today
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
          {/* Origin */}
          <div className="flex-1">
            <AirportSelect
              label="From"
              value={origin}
              onChange={setOrigin}
              excludeCode={destination}
            />
          </div>

          {/* Swap button */}
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-full border border-border bg-muted text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
            title="Swap origin and destination"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          {/* Destination */}
          <div className="flex-1">
            <AirportSelect
              label="To"
              value={destination}
              onChange={setDestination}
              excludeCode={origin}
            />
          </div>

          {/* Date */}
          <div className="w-full sm:w-40">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Departure
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="h-[50px] w-full rounded-xl border border-border bg-muted px-4 text-sm text-foreground transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          {/* Passengers */}
          <div className="w-full sm:w-24">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Pax
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="h-[50px] w-full rounded-xl border border-border bg-muted px-3 text-sm text-foreground transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Search button */}
          <Button
            type="submit"
            disabled={!origin || !destination || !date}
            className="h-[50px] shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
