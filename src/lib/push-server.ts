import webpush from "web-push";
import { getAllPushSubscriptions } from "./alerts-store";
import type { PriceAlert, FlightOffer } from "@/types";
import { formatPrice } from "./utils";

// Configure VAPID keys (required for push notifications)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

let vapidConfigured = false;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  vapidConfigured = true;
}

export async function sendPushNotification(
  alert: PriceAlert,
  flight: FlightOffer
): Promise<number> {
  if (!vapidConfigured) {
    console.warn(
      "[Push] VAPID keys not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local"
    );
    return 0;
  }

  const subscriptions = getAllPushSubscriptions();
  if (subscriptions.length === 0) {
    console.warn("[Push] No push subscriptions registered");
    return 0;
  }

  const payload = JSON.stringify({
    title: `Price Drop: ${alert.origin} → ${alert.destination}`,
    body: `${flight.airline.name} ${flight.flightNumber} — ${formatPrice(flight.priceVND)} (target: ${formatPrice(alert.maxPriceVND)})`,
    tag: `alert-${alert.id}`,
    url: `/search?origin=${alert.origin}&dest=${alert.destination}&date=${alert.departureDate}&pax=1`,
  });

  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode =
        err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode: number }).statusCode
          : 0;
      // 410 Gone or 404 means subscription expired — could remove it
      if (statusCode === 410 || statusCode === 404) {
        console.warn(`[Push] Subscription expired: ${sub.endpoint}`);
      } else {
        console.error(`[Push] Failed to send:`, err);
      }
    }
  }

  return sent;
}
