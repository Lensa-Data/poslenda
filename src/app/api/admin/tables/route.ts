import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type TableStatus = "occupied" | "open" | "closing" | "reserved";

type Table = {
  id: string;
  label: string;
  occupied: number;
  capacity: number;
  status: TableStatus;
  updatedAt: string;
};

// TODO: Replace with real DB queries when Table model is added to Prisma schema
const mockTables: Table[] = [
  { id: "t01", label: "T-01", occupied: 2, capacity: 2, status: "occupied", updatedAt: new Date().toISOString() },
  { id: "t02", label: "T-02", occupied: 0, capacity: 4, status: "open", updatedAt: new Date().toISOString() },
  { id: "t03", label: "T-03", occupied: 1, capacity: 2, status: "occupied", updatedAt: new Date().toISOString() },
  { id: "t04", label: "T-04", occupied: 3, capacity: 4, status: "closing", updatedAt: new Date().toISOString() },
  { id: "t05", label: "T-05", occupied: 0, capacity: 6, status: "reserved", updatedAt: new Date().toISOString() },
  { id: "t06", label: "T-06", occupied: 4, capacity: 4, status: "occupied", updatedAt: new Date().toISOString() },
];

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ tables: mockTables });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { id: string; status: TableStatus };

  // TODO: Update in DB when Table model is ready
  return NextResponse.json({
    table: { ...mockTables.find((t) => t.id === body.id), status: body.status },
  });
}
