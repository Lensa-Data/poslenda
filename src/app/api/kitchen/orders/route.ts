import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ItemStatus } from "@/generated/client";
/**
 * GET /api/kitchen/orders
 *
 * Dashboard Dapur: Mengambil semua OrderItem yang belum selesai dimasak,
 * dikelompokkan per Order. Item "TAMBAHAN" (batchNumber > 1) diberi label khusus.
 *
 * Query params:
 * - status: "PENDING_KITCHEN" | "PREPARING" | "all"  (default: "PENDING_KITCHEN")
 * - since: ISO datetime string — hanya ambil item yang dibuat setelah timestamp ini
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") ?? "PENDING_KITCHEN";
    const sinceParam = searchParams.get("since");

    const statusFilter =
      statusParam === "all"
        ? { in: ["PENDING_KITCHEN", "PREPARING"] as ItemStatus[] }
        : { equals: statusParam as "PENDING_KITCHEN" | "PREPARING" };

    // ─── Query: hanya item yang belum SERVED, dari order yang PENDING ──────────
    const items = await prisma.orderItem.findMany({
      where: {
        itemStatus: statusFilter,
        order: {
          status: "PENDING", // jangan tampil kalau order sudah PAID/CANCELLED
        },
        // Opsional: filter berdasarkan waktu masuk
        ...(sinceParam ? { createdAt: { gt: new Date(sinceParam) } } : {}),
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            table: {
              select: {
                name: true,
                area: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: [
        { batchNumber: "asc" }, // Batch lama dulu
        { createdAt: "asc" },
      ],
    });

    // ─── Kelompokkan per order untuk tampilan dapur ────────────────────────────
    type KitchenItem = {
      id: string;
      name: string;
      quantity: number;
      options: string | null;
      batchNumber: number;
      isAdditional: boolean; // true jika batchNumber > 1
      itemStatus: string;
      createdAt: Date;
    };

    type KitchenOrder = {
      orderNumber: string;
      tableName: string;
      areaName: string;
      items: KitchenItem[];
      hasAdditional: boolean;
    };

    const orderMap = new Map<string, KitchenOrder>();

    for (const item of items) {
      const key = item.order.orderNumber;
      if (!orderMap.has(key)) {
        orderMap.set(key, {
          orderNumber: item.order.orderNumber,
          tableName: item.order.table.name,
          areaName: item.order.table.area.name,
          items: [],
          hasAdditional: false,
        });
      }
      const orderEntry = orderMap.get(key)!;
      const isAdditional = item.batchNumber > 1;
      orderEntry.items.push({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        options: item.options,
        batchNumber: item.batchNumber,
        isAdditional,
        itemStatus: item.itemStatus,
        createdAt: item.createdAt,
      });
      if (isAdditional) orderEntry.hasAdditional = true;
    }

    const result = Array.from(orderMap.values());

    return NextResponse.json({
      total: items.length,
      orders: result,
    });
  } catch (error: any) {
    console.error("[API /kitchen/orders] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/kitchen/orders
 *
 * Update status satu item dari PENDING_KITCHEN → PREPARING → SERVED
 *
 * Body: { itemId: string, status: "PREPARING" | "SERVED" }
 */
export async function PATCH(req: Request) {
  try {
    const { itemId, status } = (await req.json()) as {
      itemId: string;
      status: "PREPARING" | "SERVED";
    };

    if (!itemId || !["PREPARING", "SERVED"].includes(status)) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }

    const updated = await prisma.orderItem.update({
      where: { id: itemId },
      data: { itemStatus: status },
      select: { id: true, name: true, itemStatus: true, orderId: true },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error("[API PATCH /kitchen/orders] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
