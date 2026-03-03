"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { AirportSelect } from "@/components/search/AirportSelect";
import { PriceChart } from "@/components/trends/PriceChart";
import { PriceCalendar } from "@/components/trends/PriceCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, TrendingDown } from "lucide-react";
import type { PriceSnapshot } from "@/types";

interface CalendarDay {
  date: string;
  minPrice: number;
  airline: string;
}

export default function TrendsPage() {
  const [origin, setOrigin] = useState("HAN");
  const [destination, setDestination] = useState("SGN");

  const [snapshots, setSnapshots] = useState<PriceSnapshot[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  async function fetchData() {
    if (!origin || !destination || origin === destination) return;
    setLoading(true);

    try {
      const [historyRes, calendarRes] = await Promise.all([
        fetch(
          `/api/flights/prices?origin=${origin}&dest=${destination}&type=history`
        ),
        fetch(
          `/api/flights/prices?origin=${origin}&dest=${destination}&type=calendar`
        ),
      ]);

      if (historyRes.ok) {
        const data = await historyRes.json();
        setSnapshots(data.snapshots || []);
      }
      if (calendarRes.ok) {
        const data = await calendarRes.json();
        setCalendar(data.calendar || []);
      }
    } catch (err) {
      console.error("Failed to fetch trends:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-12">
        {/* Route selector */}
        <div className="py-6">
          <h1 className="mb-4 text-2xl font-bold text-foreground">
            Price Trends
          </h1>
          <div className="flex items-end gap-2">
            <div className="w-44">
              <AirportSelect
                label="From"
                value={origin}
                onChange={setOrigin}
                excludeCode={destination}
              />
            </div>
            <button
              type="button"
              onClick={handleSwap}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-all hover:border-primary hover:text-primary"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
            <div className="w-44">
              <AirportSelect
                label="To"
                value={destination}
                onChange={setDestination}
                excludeCode={origin}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Price History Chart */}
            <section className="rounded-2xl border border-border bg-white p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <TrendingDown className="h-4 w-4 text-primary" />
                30-Day Price History
              </h2>
              <PriceChart snapshots={snapshots} />
            </section>

            {/* Calendar Heatmap */}
            <section className="rounded-2xl border border-border bg-white p-4 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                Cheapest Days to Fly (next 30 days)
              </h2>
              <PriceCalendar days={calendar} />
            </section>

            {/* Tip */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Tip:</span> Flights on
                Tuesday and Wednesday are typically 15-20% cheaper. Book 3-4
                weeks in advance for the best deals.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
