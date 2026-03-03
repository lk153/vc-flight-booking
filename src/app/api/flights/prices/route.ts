import { NextRequest, NextResponse } from "next/server";
import {
  generateMockPriceHistory,
  generateMockCalendarPrices,
} from "@/lib/providers/mock-trends";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = searchParams.get("origin");
  const destination = searchParams.get("dest");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type"); // "history" or "calendar"

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "Missing required parameters: origin, dest" },
      { status: 400 }
    );
  }

  // Simulate latency
  await new Promise((r) => setTimeout(r, 300));

  if (type === "calendar") {
    const data = generateMockCalendarPrices(origin, destination);
    return NextResponse.json({ calendar: data });
  }

  // Default: history
  const fromDate =
    from || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const toDate = to || new Date().toISOString().split("T")[0];

  const snapshots = generateMockPriceHistory(
    origin,
    destination,
    fromDate,
    toDate
  );

  return NextResponse.json({ snapshots });
}
