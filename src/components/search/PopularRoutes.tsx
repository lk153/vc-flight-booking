"use client";

import Link from "next/link";
import { POPULAR_ROUTES, getAirport } from "@/lib/airports";
import { Plane } from "lucide-react";

export function PopularRoutes() {
  // Default date: 7 days from now
  const defaultDate = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .split("T")[0];

  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Popular Routes
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {POPULAR_ROUTES.map((route) => {
          const originAirport = getAirport(route.origin);
          const destAirport = getAirport(route.destination);

          return (
            <Link
              key={`${route.origin}-${route.destination}`}
              href={`/search?origin=${route.origin}&dest=${route.destination}&date=${defaultDate}&pax=1`}
              className="group rounded-xl border border-border bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-bold text-foreground">
                  {route.origin}
                </span>
                <Plane className="h-3 w-3" />
                <span className="font-bold text-foreground">
                  {route.destination}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {originAirport?.city} → {destAirport?.city}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
