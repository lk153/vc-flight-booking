"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Header } from "@/components/ui/Header";
import { SearchForm } from "@/components/search/SearchForm";
import { FlightList } from "@/components/results/FlightList";
import { FlightListSkeleton } from "@/components/results/FlightCardSkeleton";
import { getAirport } from "@/lib/airports";
import { formatDate } from "@/lib/utils";
import type { SearchResult } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("dest") || "";
  const date = searchParams.get("date") || "";
  const pax = searchParams.get("pax") || "1";

  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || !destination || !date) return;

    const controller = new AbortController();

    async function fetchFlights() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          origin,
          dest: destination,
          date,
          pax,
        });
        const res = await fetch(`/api/flights/search?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResult(data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Failed to search flights. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
    return () => controller.abort();
  }, [origin, destination, date, pax]);

  const originAirport = getAirport(origin);
  const destAirport = getAirport(destination);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-12">
        {/* Compact search bar */}
        <div className="py-4">
          <SearchForm
            defaultOrigin={origin}
            defaultDestination={destination}
            defaultDate={date}
            defaultPassengers={parseInt(pax)}
          />
        </div>

        {/* Route header */}
        {origin && destination && date && (
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-foreground">
              {originAirport?.city || origin} → {destAirport?.city || destination}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(date)} · {pax} passenger{parseInt(pax) > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <FlightListSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : result ? (
          <FlightList flights={result.flights} />
        ) : (
          <div className="flex flex-col items-center py-16">
            <div className="mb-4 text-5xl">✈</div>
            <p className="text-sm text-muted-foreground">
              Search for flights to see results
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
