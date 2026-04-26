import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/kitchen
 *
 * Fetches order items for the kitchen dashboard.
 * Supports filtering by:
 * - status: PENDING_KITCHEN | PREPARING | SERVED (default: PENDING_KITCHEN)
 * - batch: specific batch number (optional)
 *
 * Returns items grouped by order, with "TAMBAHAN" label for batch > 1.
 */
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "PENDING_KITCHEN";
    const batchFilter = searchParams.get("batch");

    // Build where clause
    const where: any = {
      itemStatus: statusFilter,
      order: {
        status: { not: "CANCELLED" },
      },
    };

    if (batchFilter) {
      where.batchNumber = parseInt(batchFilter, 10);
    }

    const items = await prisma.orderItem.findMany({
      where,
      include: {
        order: {
          include: {
            table: { include: { area: true } },
          },
        },
        product: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by order
    const orderGroups = new Map<
      string,
      {
        orderId: string;
        orderNumber: string;
        tableName: string;
        areaName: string;
        items: any[];
      }
    >();

    for (const item of items) {
      if (!orderGroups.has(item.orderId)) {
        orderGroups.set(item.orderId, {
          orderId: item.orderId,
          orderNumber: item.order.orderNumber,
          tableName: item.order.table.name,
          areaName: item.order.table.area.name,
          items: [],
        });
      }

      orderGroups.get(item.orderId)!.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: item.options || undefined,
        batchNumber: item.batchNumber,
        isAdditional: item.batchNumber > 1,
        batchLabel:
          item.batchNumber === 1
            ? "Pesanan Awal"
            : `TAMBAHAN (Batch ${item.batchNumber})`,
        itemStatus: item.itemStatus,
        createdAt: item.createdAt.toISOString(),
        productImage: item.product.imageUrl,
      });
    }

    const orders = Array.from(orderGroups.values());

    return NextResponse.json({ orders, totalItems: items.length });
  } catch (error: any) {
    console.error("Kitchen dashboard error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/kitchen
 *
 * Update item status (e.g., PENDING_KITCHEN → PREPARING → SERVED)
 */
export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemId, itemStatus } = await req.json();

    if (!itemId || !itemStatus) {
      return NextResponse.json(
        { error: "itemId and itemStatus are required" },
        { status: 400 },
      );
    }

    if (!["PENDING_KITCHEN", "PREPARING", "SERVED"].includes(itemStatus)) {
      return NextResponse.json(
        { error: "Invalid itemStatus value" },
        { status: 400 },
      );
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { itemStatus },
      include: {
        order: {
          include: {
            table: { include: { area: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem.id,
        name: updatedItem.name,
        itemStatus: updatedItem.itemStatus,
        batchNumber: updatedItem.batchNumber,
        orderNumber: updatedItem.order.orderNumber,
        tableName: updatedItem.order.table.name,
      },
    });
  } catch (error: any) {
    console.error("Kitchen update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
