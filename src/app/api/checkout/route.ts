import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { total, items } = await req.json();
    console.log("ITEMS MASUK:", items);
    return;
    if (typeof total !== "number" || total <= 0 || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid total or items" },
        { status: 400 },
      );
    }

    const amount = Math.round(total);

    if (!process.env.XENDIT_KEY) {
      throw new Error("Missing XENDIT_SECRET_KEY");
    }

    const referenceId = `POSLENDA-${uuidv4().slice(0, 8).toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber: referenceId,
        totalAmount: amount,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            options: item.options ?? "",
          })),
        },
      },
    });

    const credentials = Buffer.from(process.env.XENDIT_KEY + ":").toString(
      "base64",
    );

    const xenditRes = await fetch("https://api.xendit.co/qr_codes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        reference_id: order.orderNumber,
        type: "DYNAMIC",
        currency: "IDR",
        amount,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/callback`,
      }),
    });
    const raw = await xenditRes.text();
    console.log("Xendit RAW RESPONSE:", raw);

    if (!xenditRes.ok) {
      const err = await xenditRes.text();
      throw new Error(`Xendit Error: ${err}`);
    }

    const qrCode = await xenditRes.json();

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentUrl: qrCode.qr_string,
      },
    });

    return NextResponse.json({
      qrString: qrCode.qr_string,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
