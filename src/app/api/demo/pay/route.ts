import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * POST /api/demo/pay
 *
 * Endpoint khusus DEMO — simulasi pembayaran tanpa Xendit.
 * Hanya aktif saat NODE_ENV !== "production" ATAU env DEMO_MODE=true.
 *
 * Body: { orderNumber: string }
 * Response: { success: true, orderNumber: string }
 */
export async function POST(req: Request) {
  // Guard: blokir di production kecuali DEMO_MODE explicitly true
  const isDemoAllowed =
    process.env.NODE_ENV !== "production" ||
    process.env.DEMO_MODE === "true";

  if (!isDemoAllowed) {
    return NextResponse.json(
      { error: "Demo mode tidak tersedia di production." },
      { status: 403 },
    );
  }

  try {
    const { orderNumber } = await req.json() as { orderNumber: string };

    if (!orderNumber || typeof orderNumber !== "string") {
      return NextResponse.json(
        { error: "orderNumber wajib diisi" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true, status: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: `Order sudah berstatus ${order.status}` },
        { status: 409 },
      );
    }

    // Tandai order sebagai PAID (simulasi konfirmasi Xendit)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentId: `DEMO-${Date.now()}`,
        paymentUrl: null,
      },
    });

    return NextResponse.json({ success: true, orderNumber });
  } catch (error: any) {
    console.error("[API /demo/pay] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
