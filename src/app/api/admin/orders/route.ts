import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type OrderStatus = "completed" | "pending" | "cancelled";

type Order = {
  id: string;
  orderNumber: string;
  items: string[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

// TODO: Replace with real DB queries when Order model is added to Prisma schema
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "#8842",
    items: ["2x Ethiopian Single Origin", "1x Almond Croissant"],
    total: 24.50,
    status: "completed",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    orderNumber: "#8841",
    items: ["1x Matcha Latte", "1x Avocado Sourdough Toast"],
    total: 18.20,
    status: "completed",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    orderNumber: "#8840",
    items: ["3x Flat White", "2x Banana Bread"],
    total: 42.00,
    status: "completed",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ orders: mockOrders });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as Partial<Order>;

  // TODO: Save to DB when Order model is ready
  const newOrder: Order = {
    id: String(Date.now()),
    orderNumber: `#${Math.floor(8000 + Math.random() * 1000)}`,
    items: body.items ?? [],
    total: body.total ?? 0,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ order: newOrder }, { status: 201 });
}
