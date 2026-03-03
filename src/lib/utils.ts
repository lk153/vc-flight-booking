import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceVND: number): string {
  return new Intl.NumberFormat("vi-VN").format(priceVND) + "đ";
}

export function formatPriceShort(priceVND: number): string {
  if (priceVND >= 1_000_000) {
    return (priceVND / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  return Math.round(priceVND / 1_000) + "k";
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
