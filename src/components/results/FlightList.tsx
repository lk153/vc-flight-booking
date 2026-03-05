"use client";

import { useState, useMemo } from "react";
import type { FlightOffer } from "@/types";
import { AIRLINES } from "@/lib/airports";
import { formatPriceShort, formatDuration, cn } from "@/lib/utils";
import { FlightCard } from "./FlightCard";
import { ChevronDown } from "lucide-react";

type SortKey = "price" | "departure" | "duration";

interface FlightListProps {
  flights: FlightOffer[];
}

export function FlightList({ flights }: FlightListProps) {
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [airlineFilter, setAirlineFilter] = useState<string | null>(null);

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

  // Summary stats
  const stats = useMemo(() => {
    const sorted = [...flights];
    const cheapest = sorted.sort((a, b) => a.priceVND - b.priceVND)[0];
    const fastest = sorted.sort((a, b) => a.duration - b.duration)[0];
    return {
      cheapestPrice: cheapest ? formatPriceShort(cheapest.priceVND) + "đ" : "—",
      fastestDuration: fastest ? formatDuration(fastest.duration) : "—",
    };
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

  const SORT_TABS: { key: SortKey; label: string; value: string }[] = [
    { key: "price", label: "Cheapest", value: stats.cheapestPrice },
    { key: "duration", label: "Fastest", value: stats.fastestDuration },
    { key: "departure", label: "Earliest", value: "By time" },
  ];

  return (
    <div>
      {/* Sort tabs — underline style */}
      <div className="flex border-b border-border">
        {SORT_TABS.map(({ key, label, value }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={cn(
              "flex flex-1 flex-col items-center pb-3 pt-4 transition-colors",
              sortBy === key
                ? "border-b-2 border-primary text-primary"
                : "border-b-2 border-transparent text-muted-foreground"
            )}
          >
            <span className="text-sm font-bold">{label}</span>
            <span className="text-[10px] opacity-80">{value}</span>
          </button>
        ))}
      </div>

      {/* Filter pills — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto py-3">
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
                  airlineFilter === airline.iataCode ? null : airline.iataCode
                )
              }
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all",
                airlineFilter === airline.iataCode
                  ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                  : "border-border bg-card text-foreground hover:border-primary/30"
              )}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: airline.color }}
              />
              {airline.iataCode}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
        {airlineFilter && (
          <button
            onClick={() => setAirlineFilter(null)}
            className="flex h-9 shrink-0 items-center rounded-full border border-destructive/30 bg-destructive/10 px-4 text-sm font-medium text-destructive"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="mb-3 text-xs text-muted-foreground">
        {displayed.length} flight{displayed.length !== 1 ? "s" : ""} found
        {airlineFilter && ` for ${airlineFilter}`}
      </p>

      {/* Flight cards */}
      <div className="space-y-4 pb-4">
        {displayed.map((flight, index) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            isBestPrice={index === 0 && sortBy === "price" && !airlineFilter}
            isFastest={index === 0 && sortBy === "duration" && !airlineFilter}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
