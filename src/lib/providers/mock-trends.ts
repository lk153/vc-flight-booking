import { AIRLINES } from "@/lib/airports";
import type { PriceSnapshot } from "@/types";

// Generate realistic mock price history data
export function generateMockPriceHistory(
  origin: string,
  destination: string,
  fromDate: string,
  toDate: string
): PriceSnapshot[] {
  const snapshots: PriceSnapshot[] = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const airlines = AIRLINES.filter((a) => a.iataCode !== "0V");

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const daysSinceStart = Math.floor(
      (d.getTime() - start.getTime()) / 86400000
    );

    for (const airline of airlines) {
      // Base price depends on airline type
      let base: number;
      switch (airline.iataCode) {
        case "VJ":
          base = 750_000;
          break;
        case "BL":
          base = 800_000;
          break;
        case "VU":
          base = 850_000;
          break;
        case "QH":
          base = 950_000;
          break;
        case "VN":
          base = 1_100_000;
          break;
        default:
          base = 900_000;
      }

      // Weekend markup
      if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
        base *= 1.15;
      }

      // Slight trend (prices rise closer to travel date)
      base *= 1 + daysSinceStart * 0.003;

      // Daily random variation (±10%)
      const variation = 0.9 + Math.random() * 0.2;
      const price = Math.round((base * variation) / 1000) * 1000;

      snapshots.push({
        date: dateStr,
        airlineCode: airline.iataCode,
        priceVND: price,
      });
    }
  }

  return snapshots;
}

// Generate next 30 days cheapest-per-day data
export function generateMockCalendarPrices(
  origin: string,
  destination: string
): { date: string; minPrice: number; airline: string }[] {
  const result: { date: string; minPrice: number; airline: string }[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();

    // Cheapest price of the day across all airlines
    let base = 700_000 + Math.random() * 300_000;

    // Weekends are more expensive
    if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
      base *= 1.25;
    }

    // Prices rise for dates further out
    base *= 1 + i * 0.005;

    const price = Math.round(base / 1000) * 1000;
    const airlines = ["VJ", "BL", "VU", "QH", "VN"];
    const airline = airlines[Math.floor(Math.random() * 3)]; // Bias toward LCCs

    result.push({ date: dateStr, minPrice: price, airline });
  }

  return result;
}
