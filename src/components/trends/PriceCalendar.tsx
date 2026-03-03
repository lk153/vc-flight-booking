"use client";

import { useMemo } from "react";
import { formatPriceShort, cn } from "@/lib/utils";

interface CalendarDay {
  date: string;
  minPrice: number;
  airline: string;
}

interface PriceCalendarProps {
  days: CalendarDay[];
}

function getPriceLevel(
  price: number,
  min: number,
  max: number
): "low" | "mid" | "high" {
  const range = max - min;
  if (range === 0) return "mid";
  const ratio = (price - min) / range;
  if (ratio < 0.33) return "low";
  if (ratio < 0.66) return "mid";
  return "high";
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PriceCalendar({ days }: PriceCalendarProps) {
  const { minPrice, maxPrice, cheapestDate } = useMemo(() => {
    const prices = days.map((d) => d.minPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const cheapest = days.find((d) => d.minPrice === min);
    return { minPrice: min, maxPrice: max, cheapestDate: cheapest?.date };
  }, [days]);

  if (days.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No calendar data available
      </div>
    );
  }

  // Pad the beginning to align with weekday columns
  const firstDate = new Date(days[0].date);
  // JS getDay: 0=Sun, we want 0=Mon
  const startPad = (firstDate.getDay() + 6) % 7;

  return (
    <div>
      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty padding cells */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const level = getPriceLevel(day.minPrice, minPrice, maxPrice);
          const isCheapest = day.date === cheapestDate;
          const date = new Date(day.date);

          return (
            <div
              key={day.date}
              className={cn(
                "flex flex-col items-center rounded-lg p-1.5 transition-all sm:p-2",
                level === "low" && "bg-emerald-50 text-emerald-700",
                level === "mid" && "bg-amber-50 text-amber-700",
                level === "high" && "bg-red-50 text-red-600",
                isCheapest && "ring-2 ring-emerald-400"
              )}
            >
              <span className="text-xs font-medium">{date.getDate()}</span>
              <span className="text-[10px] font-bold leading-tight sm:text-xs">
                {formatPriceShort(day.minPrice)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
          Cheap
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
          Average
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-400" />
          Expensive
        </span>
      </div>
    </div>
  );
}
