"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export type CreateTableInput = {
  name: string;
  seats: number;
  areaId: string;
};

export async function createTable(data: CreateTableInput) {
  try {
    const table = await prisma.table.create({
      data: {
        name: data.name,
        seats: data.seats,
        areaId: data.areaId,
      },
    });
    
    revalidatePath("/mng/tables");
    revalidatePath("/mng/areas");
    
    return { success: true, data: table };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "A table with this name already exists" };
    }
    console.error("Error creating table:", error);
    return { success: false, error: "Failed to create table" };
  }
}

export async function updateTable(id: string, data: CreateTableInput) {
  try {
    const table = await prisma.table.update({
      where: { id },
      data: {
        name: data.name,
        seats: data.seats,
        areaId: data.areaId,
      },
    });
    
    revalidatePath("/mng/tables");
    revalidatePath("/mng/areas");
    
    return { success: true, data: table };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "A table with this name already exists" };
    }
    console.error("Error updating table:", error);
    return { success: false, error: "Failed to update table" };
  }
}

export async function deleteTable(id: string) {
  try {
    // Check if Table has active orders
    const activeOrders = await prisma.order.count({
      where: { 
        tableId: id,
        status: { not: "CANCELLED" } // Assuming PAID orders are historical, but maybe we only care about real active?
      }
    });

    if (activeOrders > 0) {
      return { 
        success: false, 
        error: `Cannot delete this table because it has ${activeOrders} orders attached to it.` 
      };
    }

    const table = await prisma.table.delete({
      where: { id },
    });
    
    revalidatePath("/mng/tables");
    revalidatePath("/mng/areas");
    
    return { success: true, data: table };
  } catch (error: any) {
    console.error("Error deleting table:", error);
    return { success: false, error: "Failed to delete table" };
  }
}
