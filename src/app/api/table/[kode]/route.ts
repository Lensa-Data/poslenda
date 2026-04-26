import { NextResponse } from "next/server";
import prisma from "@/lib/db";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  const { kode } = await params;

  const table = await prisma.table.findUnique({
    where: { qrToken: kode },
    select: { id: true, seats: true },
  });

  if (!table) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(table);
}
