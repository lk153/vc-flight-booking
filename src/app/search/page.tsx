"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FlightList } from "@/components/results/FlightList";
import { FlightListSkeleton } from "@/components/results/FlightCardSkeleton";
import { BottomNav } from "@/components/ui/BottomNav";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Bell } from "lucide-react";
import type { SearchResult } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  function handleAlertForRoute() {
    const params = new URLSearchParams({
      origin,
      dest: destination,
      date,
    });
    router.push(`/alerts?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-md">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {origin && destination && (
              <div>
                <h2 className="text-lg font-bold leading-tight text-foreground">
                  {origin} to {destination}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {date && formatDate(date)} · {pax} Passenger{parseInt(pax) > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleAlertForRoute}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary transition-colors hover:bg-secondary"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>

        {/* Price alert banner */}
        {origin && destination && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between rounded-2xl bg-primary/10 p-3 dark:bg-primary/20">
              <p className="text-sm font-medium text-primary">
                Price alert is off for this route
              </p>
              <button
                onClick={handleAlertForRoute}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/90"
              >
                Set Alert
              </button>
            </div>
          </div>
        )}
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-6">
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

      <BottomNav />
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
