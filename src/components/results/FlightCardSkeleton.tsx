import { Skeleton } from "@/components/ui/skeleton";

export function FlightCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Airline */}
        <div className="flex items-center gap-3 sm:w-40">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Times */}
        <div className="flex flex-1 items-center gap-3 sm:justify-center">
          <div className="text-right">
            <Skeleton className="mb-1 h-6 w-14" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 px-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-px w-full" />
          </div>
          <div>
            <Skeleton className="mb-1 h-6 w-14" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between gap-3 sm:w-48 sm:flex-col sm:items-end">
          <Skeleton className="h-7 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlightListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Price bar skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Sort skeleton */}
      <div className="flex justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-56" />
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
