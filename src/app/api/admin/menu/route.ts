import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type MenuCategory = "coffee" | "tea" | "food" | "pastry";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  available: boolean;
};

// TODO: Replace with real DB queries when MenuItem model is added to Prisma schema
const mockMenuItems: MenuItem[] = [
  { id: "m01", name: "Ethiopian Single Origin", description: "Light roast, fruity notes", price: 6.50, category: "coffee", available: true },
  { id: "m02", name: "Flat White", description: "Double ristretto with steamed milk", price: 5.50, category: "coffee", available: true },
  { id: "m03", name: "Matcha Latte", description: "Ceremonial grade matcha", price: 6.00, category: "tea", available: true },
  { id: "m04", name: "Almond Croissant", description: "Buttery, flaky, with almond cream", price: 5.00, category: "pastry", available: true },
  { id: "m05", name: "Avocado Sourdough Toast", description: "With poached egg and chilli flakes", price: 14.50, category: "food", available: true },
  { id: "m06", name: "Banana Bread", description: "Housemade, served warm", price: 5.50, category: "pastry", available: false },
];

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ items: mockMenuItems });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as Partial<MenuItem>;

  // TODO: Save to DB when MenuItem model is ready
  const newItem: MenuItem = {
    id: `m${String(Date.now()).slice(-4)}`,
    name: body.name ?? "New Item",
    description: body.description ?? "",
    price: body.price ?? 0,
    category: body.category ?? "coffee",
    available: body.available ?? true,
  };

  return NextResponse.json({ item: newItem }, { status: 201 });
}
