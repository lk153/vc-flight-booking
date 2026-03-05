import { Skeleton } from "@/components/ui/skeleton";

export function FlightCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      {/* Airline + Price row */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="mb-1 ml-auto h-5 w-28" />
          <Skeleton className="ml-auto h-2.5 w-14" />
        </div>
      </div>

      {/* Timeline row */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-1 px-4">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}

export function FlightListSkeleton() {
  return (
    <div>
      {/* Sort tabs skeleton */}
      <div className="flex border-b border-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1 pb-3 pt-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Filter pills skeleton */}
      <div className="flex gap-2 py-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
