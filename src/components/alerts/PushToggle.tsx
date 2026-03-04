"use client";

import { useState, useEffect } from "react";
import {
  isPushSupported,
  isPushSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSupported(isPushSupported());
    isPushSubscribed().then(setSubscribed);
  }, []);

  async function handleToggle() {
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
      } else {
        const sub = await subscribeToPush();
        setSubscribed(!!sub);
      }
    } catch (err) {
      console.error("Push toggle failed:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
        <p className="text-xs text-accent">
          Browser push notifications are not supported in this browser.
          Use email alerts instead.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {subscribed ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              Browser notifications
            </p>
            <p className="text-xs text-muted-foreground">
              {subscribed
                ? "You'll receive push notifications for price alerts"
                : "Enable to get notified when prices drop"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={cn(
            "relative h-7 w-12 rounded-full transition-colors",
            subscribed ? "bg-primary" : "bg-secondary",
            loading && "opacity-50"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
              subscribed ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}
