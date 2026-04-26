import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { validateTableSession, getNextBatchNumber } from "@/lib/session";

/**
 * POST /api/checkout/additional
 *
 * Adds items to an existing order (new batch) without creating a new bill.
 * Requires a valid sessionToken.
 */
export async function POST(req: Request) {
  try {
    const { sessionToken, items } = await req.json();

    // ─── Validate inputs ───
    if (!sessionToken || typeof sessionToken !== "string") {
      return NextResponse.json(
        { error: "Session token diperlukan" },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Item pesanan tidak boleh kosong" },
        { status: 400 },
      );
    }

    // ─── Validate session ───
    const session = await validateTableSession(sessionToken);

    if (!session) {
      return NextResponse.json(
        {
          error: "SESSION_INVALID",
          message:
            "Sesi meja tidak valid atau sudah kadaluarsa. Silakan scan QR code kembali.",
        },
        { status: 401 },
      );
    }

    // ─── Calculate next batch number ───
    const nextBatch = await getNextBatchNumber(session.orderId);

    // ─── Calculate additional amount ───
    const additionalAmount = items.reduce(
      (sum: number, item: any) =>
        sum + Math.round(Number(item.price)) * Number(item.quantity),
      0,
    );

    if (additionalAmount <= 0) {
      return NextResponse.json(
        { error: "Total tambahan harus lebih dari 0" },
        { status: 400 },
      );
    }

    // ─── Insert new items and update total in a transaction ───
    const result = await prisma.$transaction(async (tx) => {
      // Create new order items with the next batch number
      await tx.orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: session.orderId,
          productId: item.id,
          name: item.name,
          price: Math.round(Number(item.price)),
          quantity: Number(item.quantity),
          options: item.options ?? "",
          batchNumber: nextBatch,
          itemStatus: "PENDING_KITCHEN" as const,
        })),
      });

      // Recalculate total from ALL items (all batches)
      const allItems = await tx.orderItem.findMany({
        where: { orderId: session.orderId },
      });

      const newTotal = allItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Update order total
      const updatedOrder = await tx.order.update({
        where: { id: session.orderId },
        data: { totalAmount: Math.round(newTotal) },
        include: {
          items: { orderBy: { createdAt: "asc" } },
          table: { include: { area: true } },
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      batchNumber: nextBatch,
      orderNumber: result.orderNumber,
      newTotal: result.totalAmount,
      addedItems: items.length,
      order: {
        id: result.id,
        orderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
        status: result.status,
        tableName: result.table.name,
        areaName: result.table.area.name,
        items: result.items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          options: i.options,
          batchNumber: i.batchNumber,
          itemStatus: i.itemStatus,
          createdAt: i.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error("Additional order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
