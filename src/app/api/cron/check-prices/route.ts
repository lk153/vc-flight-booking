import { NextRequest, NextResponse } from "next/server";
import { getAlerts } from "@/lib/alerts-store";
import { searchFlights } from "@/lib/providers/aggregator";
import { sendPushNotification } from "@/lib/push-server";
import { sendNtfyNotification } from "@/lib/ntfy";
import { formatPrice } from "@/lib/utils";

export async function POST(request: NextRequest) {
  // Verify cron secret (skip check if no secret configured — dev mode)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeAlerts = getAlerts().filter((a) => a.isActive);

  if (activeAlerts.length === 0) {
    return NextResponse.json({ checked: 0, triggered: 0 });
  }

  let triggered = 0;
  const results: Array<{
    alertId: number;
    route: string;
    cheapestPrice: string;
    threshold: string;
    matched: boolean;
    pushSent: number;
    ntfySent: boolean;
  }> = [];

  for (const alert of activeAlerts) {
    try {
      const flights = await searchFlights({
        origin: alert.origin,
        destination: alert.destination,
        departureDate: alert.departureDate,
        passengers: 1,
      });

      const cheapest = flights[0];
      if (!cheapest) {
        results.push({
          alertId: alert.id,
          route: `${alert.origin}→${alert.destination}`,
          cheapestPrice: "N/A",
          threshold: formatPrice(alert.maxPriceVND),
          matched: false,
          pushSent: 0,
          ntfySent: false,
        });
        continue;
      }

      const matched = cheapest.priceVND <= alert.maxPriceVND;
      let pushSent = 0;
      let ntfySent = false;

      if (matched) {
        triggered++;

        // Send browser push notification
        if (alert.notifyPush) {
          pushSent = await sendPushNotification(alert, cheapest);
        }

        // Send ntfy.sh mobile notification
        if (alert.notifyNtfy) {
          ntfySent = sendNtfyNotification(alert, cheapest);
        }

        console.log(
          `[ALERT TRIGGERED] ${alert.origin}→${alert.destination} ` +
            `${cheapest.priceVND.toLocaleString()}d <= ${alert.maxPriceVND.toLocaleString()}d ` +
            `(push: ${pushSent}, ntfy: ${ntfySent})`
        );
      }

      results.push({
        alertId: alert.id,
        route: `${alert.origin}→${alert.destination}`,
        cheapestPrice: formatPrice(cheapest.priceVND),
        threshold: formatPrice(alert.maxPriceVND),
        matched,
        pushSent,
        ntfySent,
      });
    } catch (err) {
      console.error(`Failed to check alert #${alert.id}:`, err);
    }
  }

  return NextResponse.json({
    checked: activeAlerts.length,
    triggered,
    results,
    checkedAt: new Date().toISOString(),
  });
}
