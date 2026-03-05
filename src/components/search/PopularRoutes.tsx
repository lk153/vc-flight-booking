"use client";

import Link from "next/link";
import { POPULAR_ROUTES, getAirport } from "@/lib/airports";
import { Plane, ArrowRight } from "lucide-react";

// Indicative starting prices (VND) for popular routes — just for display
const ROUTE_PRICES: Record<string, string> = {
  "HAN-SGN": "890K",
  "DAD-SGN": "590K",
  "SGN-PQC": "690K",
  "HAN-DAD": "490K",
  "SGN-CXR": "490K",
  "HAN-PQC": "790K",
};

export function PopularRoutes() {
  const defaultDate = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .split("T")[0];

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">
          Popular Routes
        </h2>
        <span className="text-xs text-muted-foreground">From prices</span>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
        {POPULAR_ROUTES.map((route) => {
          const originAirport = getAirport(route.origin);
          const destAirport = getAirport(route.destination);
          const price = ROUTE_PRICES[`${route.origin}-${route.destination}`] ?? "—";

          return (
            <Link
              key={`${route.origin}-${route.destination}`}
              href={`/search?origin=${route.origin}&dest=${route.destination}&date=${defaultDate}&pax=1`}
              className="group flex min-w-[140px] shrink-0 flex-col rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md sm:min-w-0"
            >
              {/* Route */}
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground">
                  {route.origin}
                </span>
                <Plane className="h-3 w-3 text-primary" />
                <span className="text-sm font-bold text-foreground">
                  {route.destination}
                </span>
              </div>

              {/* Cities */}
              <p className="mb-3 text-xs text-muted-foreground leading-tight">
                {originAirport?.city}
                <ArrowRight className="mx-1 inline h-2.5 w-2.5" />
                {destAirport?.city}
              </p>

              {/* Price */}
              <div className="mt-auto">
                <span className="text-xs text-muted-foreground">from </span>
                <span className="text-sm font-bold text-primary">{price}đ</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
