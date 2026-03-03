import { Header } from "@/components/ui/Header";
import { SearchForm } from "@/components/search/SearchForm";
import { PopularRoutes } from "@/components/search/PopularRoutes";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4">
        {/* Hero section */}
        <div className="pb-8 pt-12 text-center sm:pt-20">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find the cheapest domestic flights
          </h1>
          <p className="mx-auto max-w-lg text-base text-muted-foreground">
            Compare prices across all Vietnamese airlines in one search.
            Vietnam Airlines, Vietjet, Bamboo Airways, and more.
          </p>
        </div>

        {/* Search form */}
        <div className="mb-12">
          <SearchForm />
        </div>

        {/* Popular routes */}
        <PopularRoutes />
      </main>
    </div>
  );
}
