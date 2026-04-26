import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mapped = products.map((prod) => ({
      id: prod.id,
      name: prod.name,
      description: prod.description || "",
      price: Number(prod.price),
      image: prod.imageUrl || "",
      category: prod.category?.name || "Uncategorized",
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
