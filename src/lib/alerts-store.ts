import type { PriceAlert } from "@/types";

// In-memory store for development (replace with Prisma/PostgreSQL in production)
// This persists within a single server process lifecycle

let alerts: PriceAlert[] = [];
let nextId = 1;

export function getAlerts(email?: string): PriceAlert[] {
  if (email) {
    return alerts.filter((a) => a.email === email);
  }
  return [...alerts];
}

export function getAlert(id: number): PriceAlert | undefined {
  return alerts.find((a) => a.id === id);
}

export function createAlert(
  data: Omit<PriceAlert, "id" | "createdAt" | "triggeredAt" | "isActive">
): PriceAlert {
  const alert: PriceAlert = {
    ...data,
    id: nextId++,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  alerts.push(alert);
  return alert;
}

export function deleteAlert(id: number): boolean {
  const index = alerts.findIndex((a) => a.id === id);
  if (index === -1) return false;
  alerts.splice(index, 1);
  return true;
}

export function toggleAlert(id: number): PriceAlert | undefined {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) return undefined;
  alert.isActive = !alert.isActive;
  return alert;
}

// Push subscription storage (in-memory for dev)
interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

const pushSubscriptions = new Map<string, PushSubscription>();

export function savePushSubscription(
  endpoint: string,
  keys: { p256dh: string; auth: string }
) {
  pushSubscriptions.set(endpoint, { endpoint, keys });
}

export function removePushSubscription(endpoint: string) {
  pushSubscriptions.delete(endpoint);
}

export function getAllPushSubscriptions(): PushSubscription[] {
  return Array.from(pushSubscriptions.values());
}
