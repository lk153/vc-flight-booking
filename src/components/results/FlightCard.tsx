import type { FlightOffer } from "@/types";
import { formatPrice, formatDuration, formatTime, cn } from "@/lib/utils";
import { Plane } from "lucide-react";

interface FlightCardProps {
  flight: FlightOffer;
  isBestPrice?: boolean;
  isFastest?: boolean;
  rank: number;
}

export function FlightCard({ flight, isBestPrice, isFastest }: FlightCardProps) {
  const badge = isBestPrice
    ? { label: "CHEAPEST", color: "bg-emerald-500" }
    : isFastest
      ? { label: "FASTEST", color: "bg-blue-500" }
      : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        isBestPrice
          ? "border-emerald-200 dark:border-emerald-800/40"
          : "border-border"
      )}
    >
      {/* Badge */}
      {badge && (
        <div
          className={cn(
            "absolute right-0 top-0 rounded-bl-2xl px-3 py-1.5 text-[10px] font-bold tracking-wide text-white",
            badge.color
          )}
        >
          {badge.label}
        </div>
      )}

      {/* Airline + Price row */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: flight.airline.color }}
          >
            {flight.airline.iataCode}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {flight.airline.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {flight.flightNumber}
            </p>
          </div>
        </div>
        <div className={cn("text-right", badge && "mt-4")}>
          <p className="text-lg font-bold text-primary">
            {formatPrice(flight.priceVND)}
          </p>
          <p className="text-[10px] text-muted-foreground">incl. taxes</p>
        </div>
      </div>

      {/* Flight timeline */}
      <div className="flex items-center justify-between px-2">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">
            {formatTime(flight.departureTime)}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {flight.origin}
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center px-4">
          <p className="mb-1 text-[10px] font-medium text-muted-foreground">
            {formatDuration(flight.duration)}
          </p>
          <div className="relative w-full">
            <div className="h-px w-full bg-border" />
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-card px-1">
              <Plane className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase text-emerald-500">
            Direct
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-foreground">
            {formatTime(flight.arrivalTime)}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {flight.destination}
          </p>
        </div>
      </div>
    </div>
  );
}
