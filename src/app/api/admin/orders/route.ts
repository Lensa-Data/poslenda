import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbOrders = await prisma.order.findMany({
      include: {
        table: {
          include: { area: true },
        },
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const orders = dbOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      tableId: o.tableId,
      tableName: o.table.name,
      areaName: o.table.area.name,
      status: o.status,
      totalAmount: o.totalAmount,
      totalBatches: Math.max(...o.items.map((i) => i.batchNumber), 1),
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        options: i.options || undefined,
        batchNumber: i.batchNumber,
        itemStatus: i.itemStatus,
        createdAt: i.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required" },
        { status: 400 }
      );
    }

    if (!["PENDING", "PAID", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        table: {
          include: { area: true },
        },
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        tableId: order.tableId,
        tableName: order.table.name,
        areaName: order.table.area.name,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          options: i.options || undefined,
          batchNumber: i.batchNumber,
          itemStatus: i.itemStatus,
          createdAt: i.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
