"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { AlertForm } from "@/components/alerts/AlertForm";
import { AlertList } from "@/components/alerts/AlertList";
import { PushToggle } from "@/components/alerts/PushToggle";
import { Skeleton } from "@/components/ui/skeleton";
import type { PriceAlert } from "@/types";

function AlertsContent() {
  const searchParams = useSearchParams();
  const prefillOrigin = searchParams.get("origin") || "";
  const prefillDest = searchParams.get("dest") || "";
  const prefillDate = searchParams.get("date") || "";
  const prefillPrice = searchParams.get("price") || "";

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  }

  async function handleToggle(id: number) {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? data.alert : a))
        );
      }
    } catch (err) {
      console.error("Failed to toggle alert:", err);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 pb-12">
        <div className="py-6">
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            Price Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Get notified when flight prices drop below your target
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Alert list */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <AlertList
                alerts={alerts}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            )}

            {/* Push notification toggle */}
            <PushToggle />
          </div>

          {/* Create form (sidebar on desktop) */}
          <div>
            <AlertForm
              onCreated={fetchAlerts}
              defaultOrigin={prefillOrigin}
              defaultDestination={prefillDest}
              defaultDate={prefillDate}
              defaultMaxPrice={prefillPrice}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense>
      <AlertsContent />
    </Suspense>
  );
}
