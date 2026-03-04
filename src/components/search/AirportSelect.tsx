"use client";

import { useState, useRef, useEffect } from "react";
import { searchAirports } from "@/lib/airports";
import type { Airport } from "@/types";
import { cn } from "@/lib/utils";

interface AirportSelectProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
  excludeCode?: string;
}

export function AirportSelect({
  label,
  value,
  onChange,
  excludeCode,
}: AirportSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Airport[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedAirport = searchAirports(value).find(
    (a) => a.iataCode === value
  );

  useEffect(() => {
    const filtered = searchAirports(query).filter(
      (a) => a.iataCode !== excludeCode
    );
    setResults(filtered);
  }, [query, excludeCode]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setQuery("");
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          "flex w-full overflow-hidden items-baseline gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-left transition-all",
          "hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
          isOpen && "border-primary ring-2 ring-primary/20"
        )}
      >
        {selectedAirport ? (
          <>
            <span className="shrink-0 text-xl font-bold text-foreground">
              {selectedAirport.iataCode}
            </span>
            <span className="min-w-0 truncate text-sm text-muted-foreground">
              {selectedAirport.city}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Select airport</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or airport code..."
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="max-h-60 overflow-y-auto px-1 pb-1">
            {results.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                No airports found
              </p>
            ) : (
              results.map((airport) => (
                <button
                  key={airport.iataCode}
                  type="button"
                  onClick={() => {
                    onChange(airport.iataCode);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/5",
                    airport.iataCode === value && "bg-primary/10"
                  )}
                >
                  <span className="w-10 text-sm font-bold text-primary">
                    {airport.iataCode}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {airport.city}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {airport.name}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
