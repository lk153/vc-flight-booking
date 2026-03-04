"use client";

import { useState } from "react";
import { AirportSelect } from "@/components/search/AirportSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Bell, Mail, Smartphone } from "lucide-react";

interface AlertFormProps {
  onCreated: () => void;
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDate?: string;
  defaultMaxPrice?: string;
}

export function AlertForm({
  onCreated,
  defaultOrigin = "",
  defaultDestination = "",
  defaultDate = "",
  defaultMaxPrice = "",
}: AlertFormProps) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [date, setDate] = useState(defaultDate);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);
  const [email, setEmail] = useState("");
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyNtfy, setNotifyNtfy] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination || !date || !maxPrice) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          departureDate: date,
          maxPriceVND: Number(maxPrice),
          email: notifyEmail ? email : undefined,
          notifyPush,
          notifyEmail,
          notifyNtfy,
        }),
      });

      if (res.ok) {
        // Reset form
        setDate("");
        setMaxPrice("");
        onCreated();
      }
    } catch (err) {
      console.error("Failed to create alert:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <h3 className="mb-4 text-base font-semibold text-foreground">
        Create Price Alert
      </h3>

      <div className="space-y-4">
        {/* Route */}
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <AirportSelect
              label="From"
              value={origin}
              onChange={setOrigin}
              excludeCode={destination}
            />
          </div>
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <AirportSelect
              label="To"
              value={destination}
              onChange={setDestination}
              excludeCode={origin}
            />
          </div>
        </div>

        {/* Date + Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Departure Date
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Max Price (VND)
            </label>
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="900000"
              min={100000}
              step={10000}
              required
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Notification channels */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Notify via
          </label>
          <div className="flex flex-wrap gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
              <input
                type="checkbox"
                checked={notifyPush}
                onChange={(e) => setNotifyPush(e.target.checked)}
                className="accent-primary"
              />
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Browser</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="accent-primary"
              />
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Email</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
              <input
                type="checkbox"
                checked={notifyNtfy}
                onChange={(e) => setNotifyNtfy(e.target.checked)}
                className="accent-primary"
              />
              <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Mobile</span>
            </label>
          </div>
        </div>

        {/* Email input (shown if email notifications enabled) */}
        {notifyEmail && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required={notifyEmail}
              className="h-11 rounded-xl"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting || !origin || !destination || !date || !maxPrice}
          className="w-full rounded-xl"
        >
          {submitting ? "Creating..." : "Create Alert"}
        </Button>
      </div>
    </form>
  );
}
