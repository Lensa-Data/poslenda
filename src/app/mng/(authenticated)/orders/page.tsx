import prisma from "@/lib/db";
import OrderClient, { type OrderData, type ProductData, type TableData } from "@/components/admin/order-client";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  // 1. Fetch Orders
  const dbOrders = await prisma.order.findMany({
    include: {
      table: {
        include: { area: true }
      },
      items: true,
      fees: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Map to Client shape
  const orders: OrderData[] = dbOrders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    tableId: o.tableId,
    tableName: o.table.name,
    areaName: o.table.area.name,
    status: o.status,
    subtotalAmount: o.subtotalAmount,
    totalAmount: o.totalAmount,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map(i => ({
      id: i.id,
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      options: i.options || undefined,
    })),
    fees: (o as any).fees ? (o as any).fees.map((f: any) => ({
      id: f.id,
      name: f.name,
      amount: f.amount
    })) : []
  }));

  // 2. Fetch Available Tables for new order binding
  const dbTables = await prisma.table.findMany({
    include: { area: true },
    orderBy: { name: 'asc' }
  });
  
  const tables: TableData[] = dbTables.map(t => ({
    id: t.id,
    name: t.name,
    areaName: t.area.name,
  }));

  // 3. Fetch Products for POS Menu selection
  const dbProducts = await prisma.product.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: { name: 'asc' }
  });

  const products: ProductData[] = dbProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    categoryId: p.categoryId,
    categoryName: p.category.name,
  }));

  // 4. Fetch Active Fees for POS Calculator preview
  const activeFees = await prisma.fee.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  });

  return <OrderClient initialOrders={orders} tables={tables} products={products} activeFees={activeFees.map(f => ({...f, type: f.type as "FIXED"|"PERCENTAGE"}))} />;
}
