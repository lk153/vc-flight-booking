import { NextRequest, NextResponse } from "next/server";
import { getAlerts, createAlert, deleteAlert, toggleAlert } from "@/lib/alerts-store";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") || undefined;
  const alerts = getAlerts(email);
  return NextResponse.json({ alerts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, maxPriceVND, email, notifyEmail, notifyPush } = body;

    if (!origin || !destination || !departureDate || !maxPriceVND) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const alert = createAlert({
      origin,
      destination,
      departureDate,
      maxPriceVND: Number(maxPriceVND),
      email: email || undefined,
      notifyEmail: !!notifyEmail,
      notifyPush: !!notifyPush,
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing alert id" }, { status: 400 });
  }

  const deleted = deleteAlert(Number(id));
  if (!deleted) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing alert id" }, { status: 400 });
  }

  const alert = toggleAlert(Number(id));
  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  return NextResponse.json({ alert });
}
