"use client";

import type { PriceAlert } from "@/types";
import { getAirport } from "@/lib/airports";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Pause, Play, Trash2, Plane } from "lucide-react";

interface AlertListProps {
  alerts: PriceAlert[];
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export function AlertList({ alerts, onDelete, onToggle }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="mb-3 text-4xl">🔔</div>
        <h3 className="mb-1 text-base font-semibold text-foreground">
          No alerts yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Create an alert to get notified when prices drop
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const originAirport = getAirport(alert.origin);
        const destAirport = getAirport(alert.destination);

        return (
          <div
            key={alert.id}
            className={cn(
              "rounded-xl border bg-white p-4 transition-all",
              alert.isActive ? "border-border" : "border-border opacity-60"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* Route */}
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">
                    {alert.origin}
                  </span>
                  <Plane className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">
                    {alert.destination}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {formatDate(alert.departureDate)}
                  </span>
                </div>

                {/* Details */}
                <p className="mb-2 text-sm text-muted-foreground">
                  Alert when price drops below{" "}
                  <span className="font-semibold text-foreground">
                    {formatPrice(alert.maxPriceVND)}
                  </span>
                </p>

                {/* Route names */}
                <p className="mb-2 text-xs text-muted-foreground">
                  {originAirport?.city} → {destAirport?.city}
                </p>

                {/* Notification channels */}
                <div className="flex items-center gap-2">
                  {alert.notifyPush && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs font-normal"
                    >
                      <Bell className="h-3 w-3" />
                      Browser
                    </Badge>
                  )}
                  {alert.notifyEmail && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs font-normal"
                    >
                      <Mail className="h-3 w-3" />
                      Email
                    </Badge>
                  )}
                  {!alert.isActive && (
                    <Badge variant="outline" className="text-xs font-normal">
                      Paused
                    </Badge>
                  )}
                  {alert.triggeredAt && (
                    <Badge className="bg-emerald-500 text-xs font-normal text-white hover:bg-emerald-500">
                      Triggered
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggle(alert.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title={alert.isActive ? "Pause" : "Resume"}
                >
                  {alert.isActive ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onDelete(alert.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
