import { NextRequest, NextResponse } from "next/server";
import { getAlerts } from "@/lib/alerts-store";
import { searchFlights } from "@/lib/providers/aggregator";

export async function POST(request: NextRequest) {
  // Verify cron secret
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

  for (const alert of activeAlerts) {
    try {
      const flights = await searchFlights({
        origin: alert.origin,
        destination: alert.destination,
        departureDate: alert.departureDate,
        passengers: 1,
      });

      const cheapest = flights[0];
      if (!cheapest) continue;

      if (cheapest.priceVND <= alert.maxPriceVND) {
        triggered++;

        // In production, send push notification and/or email here:
        // if (alert.notifyPush) await sendPushNotification(alert, cheapest);
        // if (alert.notifyEmail && alert.email) await sendEmail(alert, cheapest);

        console.log(
          `[ALERT TRIGGERED] ${alert.origin}→${alert.destination} ` +
            `${cheapest.priceVND.toLocaleString()}đ <= ${alert.maxPriceVND.toLocaleString()}đ`
        );
      }
    } catch (err) {
      console.error(`Failed to check alert #${alert.id}:`, err);
    }
  }

  return NextResponse.json({
    checked: activeAlerts.length,
    triggered,
    checkedAt: new Date().toISOString(),
  });
}
