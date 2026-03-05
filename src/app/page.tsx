import { Header } from "@/components/ui/Header";
import { SearchForm } from "@/components/search/SearchForm";
import { PopularRoutes } from "@/components/search/PopularRoutes";
import { BottomNav } from "@/components/ui/BottomNav";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <Header />

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-orange-600 dark:from-primary/80 dark:via-primary/60 dark:to-amber-700/50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-10 sm:pb-32 sm:pt-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Flash Deals Available
            </span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white sm:text-4xl">
            Find Cheapest<br />Domestic Flights
          </h1>
          <p className="max-w-md text-sm text-white/80">
            Compare prices across all Vietnamese airlines in one search
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4">
        {/* Search form — pulled up over hero */}
        <div className="-mt-20 mb-8 sm:-mt-24">
          <SearchForm />
        </div>

        {/* Popular routes */}
        <PopularRoutes />
      </main>

      {/* Bottom navigation — mobile only */}
      <BottomNav />
    </div>
  );
}
