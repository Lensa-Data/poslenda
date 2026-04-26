import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
        table: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
