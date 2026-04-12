"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export type OrderItemInput = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  options?: string;
};

export type CreateOrderInput = {
  tableId: string;
  items: OrderItemInput[];
};

export async function createOrder(data: CreateOrderInput) {
  try {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Cannot create an empty order." };
    }

    // Server-side calculation of total amount for security
    const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate unique order number (e.g. ORD-123456)
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        tableId: data.tableId,
        status: "PENDING",
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            options: item.options,
          }))
        }
      },
      include: {
        items: true
      }
    });
    
    revalidatePath("/mng/orders");
    revalidatePath("/mng/tables"); // Updating tables since table status might switch to occupied
    
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function updateOrderStatus(orderId: string, status: "PENDING" | "PAID" | "CANCELLED") {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    
    revalidatePath("/mng/orders");
    revalidatePath("/mng/tables");
    
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function deleteOrder(id: string) {
  try {
    const order = await prisma.order.delete({
      where: { id },
    });
    
    revalidatePath("/mng/orders");
    revalidatePath("/mng/tables");
    
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return { success: false, error: "Failed to delete order" };
  }
}
