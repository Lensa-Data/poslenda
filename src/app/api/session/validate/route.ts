import { NextResponse } from "next/server";
import { validateTableSession } from "@/lib/session";

/**
 * GET /api/session/validate?token=xxx
 * Validates a table session token and returns the active order info.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 },
      );
    }

    const session = await validateTableSession(token);

    if (!session) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    // Calculate per-batch summaries
    const batchMap = new Map<
      number,
      { items: typeof session.order.items; subtotal: number }
    >();
    for (const item of session.order.items) {
      if (!batchMap.has(item.batchNumber)) {
        batchMap.set(item.batchNumber, { items: [], subtotal: 0 });
      }
      const batch = batchMap.get(item.batchNumber)!;
      batch.items.push(item);
      batch.subtotal += item.price * item.quantity;
    }

    const batches = Array.from(batchMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([batchNumber, data]) => ({
        batchNumber,
        itemCount: data.items.length,
        subtotal: data.subtotal,
      }));

    return NextResponse.json({
      valid: true,
      session: {
        id: session.id,
        tableId: session.tableId,
        tableName: session.table.name,
        orderId: session.orderId,
        orderNumber: session.order.orderNumber,
        orderStatus: session.order.status,
        totalAmount: session.order.totalAmount,
        totalItems: session.order.items.length,
        currentBatch: batches.length,
        batches,
        expiresAt: session.expiresAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Session validate error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
