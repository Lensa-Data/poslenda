import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET /api/cashier/orders/[orderNumber]
 *
 * Dashboard Kasir: Mengambil satu Order LENGKAP beserta SEMUA OrderItem
 * dari semua batch, dikelompokkan per batch, untuk struk final.
 *
 * Response mencakup:
 * - Order header (nomor, status, meja, area, total)
 * - Breakdown per batch
 * - Grand total (sama dengan order.totalAmount)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "orderNumber wajib diisi" },
        { status: 400 },
      );
    }

    // ─── Query lengkap untuk struk kasir ──────────────────────────────────────
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        table: {
          include: { area: true },
        },
        items: {
          orderBy: [
            { batchNumber: "asc" },
            { createdAt: "asc" },
          ],
        },
        tableSession: {
          select: { expiresAt: true, isActive: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    // ─── Group items per batch ─────────────────────────────────────────────────
    const batchMap = new Map<
      number,
      {
        batchNumber: number;
        items: typeof order.items;
        subtotal: number;
      }
    >();

    for (const item of order.items) {
      if (!batchMap.has(item.batchNumber)) {
        batchMap.set(item.batchNumber, {
          batchNumber: item.batchNumber,
          items: [],
          subtotal: 0,
        });
      }
      const batch = batchMap.get(item.batchNumber)!;
      batch.items.push(item);
      batch.subtotal += item.price * item.quantity;
    }

    const batches = Array.from(batchMap.values());
    const grandTotal = batches.reduce((sum, b) => sum + b.subtotal, 0);

    // Sanity check: grandTotal harus sesuai order.totalAmount
    // (bisa berbeda akibat pajak kalau diaplikasikan di checkout — ambil order.totalAmount)
    const receipt = {
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      table: {
        name: order.table.name,
        area: order.table.area.name,
      },
      paymentUrl: order.paymentUrl,
      paymentId: order.paymentId,
      totalBatches: batches.length,
      totalItems: order.items.length,
      batches,
      grandTotal,                      // dihitung dari items
      totalAmountRecorded: order.totalAmount, // dari DB (termasuk pajak dsb)
      session: order.tableSession
        ? {
            isActive: order.tableSession.isActive,
            expiresAt: order.tableSession.expiresAt,
          }
        : null,
    };

    return NextResponse.json(receipt);
  } catch (error: any) {
    console.error("[API /cashier/orders] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
