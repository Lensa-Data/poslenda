import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";
import { validateTableSession, getNextBatchNumber } from "@/lib/session";

/**
 * POST /api/orders/additional
 *
 * Flow:
 * 1. Validasi session + meja + produk
 * 2. Hitung nextBatch
 * 3. Insert OrderItem (batchNumber = nextBatch) + update totalAmount — atomic
 * 4a. Jika Xendit tersedia & OK → return { invoiceUrl }  (frontend redirect ke Xendit)
 * 4b. Jika Xendit error / tidak ada key → return { demoMode: true }
 *     Items TETAP di DB, frontend tampilkan QRIS palsu + tombol konfirmasi.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionToken, tableId, items } = body as {
      sessionToken: string;
      tableId: string;
      items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        options?: string;
      }>;
    };

    // ─── 1. Validasi input dasar ───────────────────────────────────────────────
    if (!sessionToken || typeof sessionToken !== "string") {
      return NextResponse.json(
        { error: "sessionToken wajib diisi" },
        { status: 400 },
      );
    }
    if (!tableId || typeof tableId !== "string") {
      return NextResponse.json(
        { error: "tableId wajib diisi" },
        { status: 400 },
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items tidak boleh kosong" },
        { status: 400 },
      );
    }

    for (const item of items) {
      if (
        !item.id ||
        !item.name ||
        typeof item.price !== "number" ||
        typeof item.quantity !== "number"
      ) {
        return NextResponse.json(
          { error: "Format item tidak valid" },
          { status: 400 },
        );
      }
      if (item.quantity <= 0 || item.price < 0) {
        return NextResponse.json(
          { error: "Quantity/price item tidak valid" },
          { status: 400 },
        );
      }
    }

    // ─── 2. Validasi session token ─────────────────────────────────────────────
    const session = await validateTableSession(sessionToken);

    if (!session) {
      return NextResponse.json(
        {
          error: "SESSION_INVALID",
          message:
            "Sesi tidak valid, sudah berakhir, atau pesanan sudah dibayar.",
        },
        { status: 401 },
      );
    }

    // ─── 3. Validasi kepemilikan meja ─────────────────────────────────────────
    if (session.tableId !== tableId) {
      return NextResponse.json(
        {
          error: "TABLE_MISMATCH",
          message: "Token sesi tidak cocok dengan meja ini.",
        },
        { status: 403 },
      );
    }

    // ─── 4. Validasi produk tersedia ──────────────────────────────────────────
    const productIds = items.map((i) => i.id);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
      select: { id: true },
    });

    if (existingProducts.length !== productIds.length) {
      const foundIds = new Set(existingProducts.map((p) => p.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      return NextResponse.json(
        {
          error: "PRODUCT_NOT_FOUND",
          message: `Produk tidak tersedia: ${missingIds.join(", ")}`,
        },
        { status: 422 },
      );
    }

    // ─── 5. Hitung batch berikutnya & jumlah tambahan ─────────────────────────
    const orderId = session.orderId;
    const nextBatch = await getNextBatchNumber(orderId);

    const additionalAmount = Math.round(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    );

    // XENDIT_KEY opsional — fallback ke demo mode jika tidak ada / error
    const xenditKey = process.env.XENDIT_KEY;

    // ─── 6. Atomic transaction: insert items + update total Order induk ───────
    const [, updatedOrder] = await prisma.$transaction([
      prisma.orderItem.createMany({
        data: items.map((item) => ({
          orderId,
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          options: item.options ?? "",
          batchNumber: nextBatch,
          // itemStatus default PENDING_KITCHEN
        })),
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { totalAmount: { increment: additionalAmount } },
        select: { orderNumber: true, totalAmount: true },
      }),
    ]);

    const orderNumber = updatedOrder.orderNumber;

    // ─── 7. Coba buat Xendit Invoice untuk jumlah TAMBAHAN saja ───────────────
    // Jika gagal: items TETAP di DB, return demoMode agar frontend bisa
    // menampilkan QRIS palsu + tombol "Sudah Bayar" (POST /api/demo/pay).
    // Set FORCE_DEMO_MODE=true di .env untuk paksa demo mode tanpa ubah key.
    const forceDemoMode = process.env.FORCE_DEMO_MODE === "true";

    if (xenditKey && !forceDemoMode) {
      try {
        const externalId = `${orderNumber}-B${nextBatch}-${uuidv4().slice(0, 6).toUpperCase()}`;

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL || "https://poslenda.example.com";
        const callbackUrl = appUrl.startsWith("http://localhost")
          ? "https://poslenda.example.com/api/checkout/callback"
          : `${appUrl}/api/checkout/callback`;
        const successRedirectUrl = `${appUrl}/order/checkout/success?order=${orderNumber}`;
        const failureRedirectUrl = `${appUrl}/order/checkout?status=failed&order=${orderNumber}`;

        const credentials = Buffer.from(xenditKey + ":").toString("base64");

        const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify({
            external_id: externalId,
            amount: additionalAmount,
            description: `Tambahan Pesanan ${orderNumber} — Batch ${nextBatch}`,
            currency: "IDR",
            payment_methods: ["QRIS"],
            success_redirect_url: successRedirectUrl,
            failure_redirect_url: failureRedirectUrl,
            callback_url: callbackUrl,
          }),
        });

        const raw = await xenditRes.text();

        if (xenditRes.ok) {
          const invoice = JSON.parse(raw);
          return NextResponse.json({
            success: true,
            invoiceUrl: invoice.invoice_url,
            batchNumber: nextBatch,
            additionalAmount,
            orderNumber,
          });
        }

        // Xendit HTTP error — fallthrough ke demo mode
        console.warn("[additional] Xendit HTTP error, switching to demo mode:", raw);
      } catch (xenditErr) {
        // Network error ke Xendit — fallthrough ke demo mode
        console.warn("[additional] Xendit unreachable, switching to demo mode:", xenditErr);
      }
    } else {
      console.warn("[additional] XENDIT_KEY tidak ada, menggunakan demo mode.");
    }

    // ─── Demo Mode Fallback ────────────────────────────────────────────────────
    // Items sudah tersimpan. Frontend akan tampilkan QRIS palsu.
    return NextResponse.json({
      demoMode: true,
      orderNumber,
      batchNumber: nextBatch,
      additionalAmount,
    });
  } catch (error: any) {
    console.error("[API /orders/additional] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
