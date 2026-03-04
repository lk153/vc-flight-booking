"use client";

import { useState, useMemo } from "react";
import type { FlightOffer } from "@/types";
import { AIRLINES } from "@/lib/airports";
import { formatPriceShort, cn } from "@/lib/utils";
import { FlightCard } from "./FlightCard";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";

type SortKey = "price" | "departure" | "duration";

interface FlightListProps {
  flights: FlightOffer[];
}

export function FlightList({ flights }: FlightListProps) {
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [airlineFilter, setAirlineFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Best price per airline
  const bestByAirline = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of flights) {
      const current = map.get(f.airline.iataCode);
      if (!current || f.priceVND < current) {
        map.set(f.airline.iataCode, f.priceVND);
      }
    }
    return map;
  }, [flights]);

  // Filter & sort
  const displayed = useMemo(() => {
    let result = [...flights];

    if (airlineFilter) {
      result = result.filter((f) => f.airline.iataCode === airlineFilter);
    }

    switch (sortBy) {
      case "price":
        result.sort((a, b) => a.priceVND - b.priceVND);
        break;
      case "departure":
        result.sort(
          (a, b) =>
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime()
        );
        break;
      case "duration":
        result.sort((a, b) => a.duration - b.duration);
        break;
    }

    return result;
  }, [flights, sortBy, airlineFilter]);

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 text-6xl">✈</div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          No flights found
        </h3>
        <p className="text-sm text-muted-foreground">
          Try different dates or routes
        </p>
      </div>
    );
  }

  const airlinesInResults = AIRLINES.filter((a) =>
    flights.some((f) => f.airline.iataCode === a.iataCode)
  );

  return (
    <div className="space-y-4">
      {/* Price comparison bar */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
        <span className="mr-1 self-center text-xs font-medium text-muted-foreground">
          Best prices:
        </span>
        {airlinesInResults
          .sort(
            (a, b) =>
              (bestByAirline.get(a.iataCode) ?? Infinity) -
              (bestByAirline.get(b.iataCode) ?? Infinity)
          )
          .map((airline) => (
            <button
              key={airline.iataCode}
              onClick={() =>
                setAirlineFilter(
                  airlineFilter === airline.iataCode
                    ? null
                    : airline.iataCode
                )
              }
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                airlineFilter === airline.iataCode
                  ? "ring-2 ring-primary"
                  : "hover:bg-secondary"
              )}
              style={{
                backgroundColor:
                  airlineFilter === airline.iataCode
                    ? airline.color + "15"
                    : undefined,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: airline.color }}
              />
              <span>{airline.iataCode}</span>
              <span className="font-bold" style={{ color: airline.color }}>
                {formatPriceShort(bestByAirline.get(airline.iataCode) ?? 0)}
              </span>
            </button>
          ))}
        {airlineFilter && (
          <button
            onClick={() => setAirlineFilter(null)}
            className="ml-auto text-xs text-primary hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Sort & filter controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          {(
            [
              { key: "price", label: "Cheapest" },
              { key: "departure", label: "Earliest" },
              { key: "duration", label: "Fastest" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                sortBy === key
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {sortBy === key && <ArrowUpDown className="h-3 w-3" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {displayed.length} flight{displayed.length !== 1 ? "s" : ""} found
        {airlineFilter && ` for ${airlineFilter}`}
      </p>

      {/* Flight cards */}
      <div className="space-y-3">
        {displayed.map((flight, index) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            isBestPrice={index === 0 && sortBy === "price" && !airlineFilter}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
