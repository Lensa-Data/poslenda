import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Replace with real DB queries when Order/Table models are added to schema
  return NextResponse.json({
    revenue: {
      total: 4280.50,
      change: 12.4,
      trend: "up" as const,
    },
    orders: {
      total: 142,
      breakdown: { pourOver: 86, espresso: 56 },
    },
    occupancy: {
      percentage: 85,
      label: "Busy hours",
    },
  });
}
