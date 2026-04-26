import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";
import {
  generateSessionToken,
  getSessionExpiry,
  validateTableSession,
} from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { total, items, tableId, sessionToken } = await req.json();

    if (typeof total !== "number" || total <= 0 || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid total or items" },
        { status: 400 },
      );
    }

    if (!tableId || typeof tableId !== "string") {
      return NextResponse.json(
        { error: "Missing tableId" },
        { status: 400 },
      );
    }

    // ─── Check for existing active session on this table ───
    // If a valid session token is provided, redirect to additional order flow
    if (sessionToken) {
      const existingSession = await validateTableSession(sessionToken);
      if (existingSession && existingSession.tableId === tableId) {
        return NextResponse.json(
          {
            error: "ACTIVE_SESSION_EXISTS",
            message:
              "Anda sudah memiliki pesanan aktif. Gunakan fitur Tambah Pesanan.",
            orderNumber: existingSession.order.orderNumber,
            sessionToken: existingSession.token,
          },
          { status: 409 },
        );
      }
    }

    const amount = Math.round(total);

    // XENDIT_KEY opsional di mode demo
    const xenditKey = process.env.XENDIT_KEY;

    const referenceId = `POSLENDA-${uuidv4().slice(0, 8).toUpperCase()}`;
    const newSessionToken = generateSessionToken();

    const order = await prisma.order.create({
      data: {
        orderNumber: referenceId,
        totalAmount: amount,
        tableId: tableId,
        sessionToken: newSessionToken,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            options: item.options ?? "",
            batchNumber: 1,
          })),
        },
      },
    });

    // ─── Create TableSession ───
    await prisma.tableSession.create({
      data: {
        token: newSessionToken,
        tableId: tableId,
        orderId: order.id,
        expiresAt: getSessionExpiry(),
      },
    });

    // ─── Coba buat Xendit Invoice ──────────────────────────────────────────────
    // Jika Xendit tidak tersedia (key kosong / API error), fallback ke demo mode.
    // Set FORCE_DEMO_MODE=true di .env untuk paksa demo mode tanpa ubah key.
    const forceDemoMode = process.env.FORCE_DEMO_MODE === "true";

    if (xenditKey && !forceDemoMode) {
      try {
        const credentials = Buffer.from(xenditKey + ":").toString("base64");

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL || "https://poslenda.example.com";
        const callbackUrl = appUrl.startsWith("http://localhost")
          ? "https://poslenda.example.com/api/checkout/callback"
          : `${appUrl}/api/checkout/callback`;

        const successRedirectUrl = `${appUrl}/order/checkout/success?order=${order.orderNumber}`;
        const failureRedirectUrl = `${appUrl}/order/checkout?status=failed&order=${order.orderNumber}`;

        const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify({
            external_id: order.orderNumber,
            amount,
            description: `Pembayaran POSLENDA - ${order.orderNumber}`,
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

          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentUrl: invoice.invoice_url,
              paymentId: invoice.id,
            },
          });

          return NextResponse.json({
            invoiceUrl: invoice.invoice_url,
            orderNumber: order.orderNumber,
            sessionToken: newSessionToken,
          });
        }

        // Xendit mengembalikan error HTTP — fallthrough ke demo mode
        console.warn("[checkout] Xendit error, switching to demo mode:", raw);
      } catch (xenditErr) {
        // Network error ke Xendit — fallthrough ke demo mode
        console.warn("[checkout] Xendit unreachable, switching to demo mode:", xenditErr);
      }
    } else {
      console.warn("[checkout] XENDIT_KEY tidak ada, menggunakan demo mode.");
    }

    // ─── Demo Mode Fallback ────────────────────────────────────────────────────
    // Order + session sudah tersimpan di DB. Kembalikan flag demoMode ke frontend.
    return NextResponse.json({
      demoMode: true,
      orderNumber: order.orderNumber,
      sessionToken: newSessionToken,
      amount,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
