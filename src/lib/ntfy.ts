import { execSync } from "node:child_process";
import type { PriceAlert, FlightOffer } from "@/types";

export function sendNtfyNotification(
  alert: PriceAlert,
  flight: FlightOffer
): boolean {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.warn("[ntfy] NTFY_TOPIC not configured in .env.local");
    return false;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const searchUrl = `${appUrl}/search?origin=${alert.origin}&dest=${alert.destination}&date=${alert.departureDate}&pax=1`;

  const body =
    `${flight.airline.name} ${flight.flightNumber}\n` +
    `Price: ${flight.priceVND.toLocaleString("en")} VND (target: ${alert.maxPriceVND.toLocaleString("en")} VND)\n` +
    `Date: ${alert.departureDate}`;

  try {
    execSync(
      `curl -s -o /dev/null -w "%{http_code}" ` +
        `-H "Title: ${alert.origin} - ${alert.destination} Price Drop" ` +
        `-H "Tags: airplane,moneybag" ` +
        `-H "Priority: high" ` +
        `-H "Click: ${searchUrl}" ` +
        `-d ${JSON.stringify(body)} ` +
        `https://ntfy.sh/${topic}`,
      { timeout: 10000 }
    );
    console.log(`[ntfy] Notification sent to topic: ${topic}`);
    return true;
  } catch (err) {
    console.error("[ntfy] Error:", err);
    return false;
  }
}
