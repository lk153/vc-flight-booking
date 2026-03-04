"use client";

import { useRouter } from "next/navigation";
import type { FlightOffer } from "@/types";
import { formatPrice, formatDuration, formatTime, cn } from "@/lib/utils";
import { getBookingUrl } from "@/lib/airports";
import { Badge } from "@/components/ui/badge";
import { Bell, ExternalLink, Plane } from "lucide-react";

interface FlightCardProps {
  flight: FlightOffer;
  isBestPrice?: boolean;
  rank: number;
}

export function FlightCard({ flight, isBestPrice, rank }: FlightCardProps) {
  const router = useRouter();
  const departureDate = flight.departureTime.split("T")[0];

  function handleBook() {
    const url = getBookingUrl(
      flight.airline,
      flight.origin,
      flight.destination,
      departureDate
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleAlert() {
    const params = new URLSearchParams({
      origin: flight.origin,
      dest: flight.destination,
      date: departureDate,
      price: String(flight.priceVND),
    });
    router.push(`/alerts?${params.toString()}`);
  }

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-all hover:shadow-md sm:p-5",
        isBestPrice
          ? "border-accent/60 shadow-sm ring-1 ring-accent/30"
          : "border-border"
      )}
    >
      {/* Best price badge */}
      {isBestPrice && (
        <Badge className="absolute -top-2.5 left-4 bg-accent text-accent-foreground hover:bg-accent">
          BEST PRICE
        </Badge>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Airline info */}
        <div className="flex items-center gap-3 sm:w-40">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: flight.airline.color }}
          >
            {flight.airline.iataCode}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {flight.airline.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {flight.flightNumber}
            </p>
          </div>
        </div>

        {/* Flight times */}
        <div className="flex flex-1 items-center gap-3 sm:justify-center">
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">
              {formatTime(flight.departureTime)}
            </p>
            <p className="text-xs text-muted-foreground">{flight.origin}</p>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1 px-2 sm:px-4">
            <p className="text-xs text-muted-foreground">
              {formatDuration(flight.duration)}
            </p>
            <div className="flex w-full items-center gap-1">
              <div className="h-px flex-1 bg-border" />
              <Plane className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-xs text-muted-foreground">Direct</p>
          </div>

          <div className="text-left">
            <p className="text-lg font-semibold text-foreground">
              {formatTime(flight.arrivalTime)}
            </p>
            <p className="text-xs text-muted-foreground">
              {flight.destination}
            </p>
          </div>
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:w-48 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <p
            className={cn(
              "text-xl font-bold",
              isBestPrice ? "text-accent" : "text-foreground"
            )}
          >
            {formatPrice(flight.priceVND)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAlert}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              title="Set price alert"
            >
              <Bell className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleBook}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-white transition-colors hover:bg-primary/90"
            >
              Book
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Rank indicator */}
      {rank <= 3 && !isBestPrice && (
        <div className="absolute -top-2 right-4">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            #{rank}
          </span>
        </div>
      )}
    </div>
  );
}
