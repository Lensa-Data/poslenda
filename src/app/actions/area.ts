"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createArea(name: string) {
  try {
    const area = await prisma.area.create({
      data: { name },
    });
    
    revalidatePath("/mng/areas");
    revalidatePath("/mng/tables");
    
    return { success: true, data: area };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Area with this name already exists" };
    }
    console.error("Error creating area:", error);
    return { success: false, error: "Failed to create area" };
  }
}

export async function updateArea(id: string, name: string) {
  try {
    const area = await prisma.area.update({
      where: { id },
      data: { name },
    });
    
    revalidatePath("/mng/areas");
    revalidatePath("/mng/tables");
    
    return { success: true, data: area };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Area with this name already exists" };
    }
    console.error("Error updating area:", error);
    return { success: false, error: "Failed to update area" };
  }
}

export async function deleteArea(id: string) {
  try {
    // Check if Area has tables
    const relatedTablesCount = await prisma.table.count({
      where: { areaId: id }
    });

    if (relatedTablesCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete this area because it has ${relatedTablesCount} tables associated with it. Please reassign or delete them first.` 
      };
    }

    const area = await prisma.area.delete({
      where: { id },
    });
    
    revalidatePath("/mng/areas");
    revalidatePath("/mng/tables");
    
    return { success: true, data: area };
  } catch (error: any) {
    console.error("Error deleting area:", error);
    return { success: false, error: "Failed to delete area" };
  }
}
