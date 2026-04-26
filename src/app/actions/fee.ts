"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export type FeeInput = {
  name: string;
  type: "FIXED" | "PERCENTAGE";
  value: number;
  isActive: boolean;
};

export async function createFee(data: FeeInput) {
  try {
    const fee = await prisma.fee.create({
      data: {
        name: data.name,
        type: data.type,
        value: data.value,
        isActive: data.isActive,
      }
    });
    
    revalidatePath("/mng/settings");
    revalidatePath("/mng/orders");
    
    return { success: true, data: fee };
  } catch (error: any) {
    console.error("Error creating fee:", error);
    if (error.code === 'P2002') return { success: false, error: "Fee name already exists." };
    return { success: false, error: "Failed to create fee" };
  }
}

export async function updateFee(id: string, data: FeeInput) {
  try {
    const fee = await prisma.fee.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        value: data.value,
        isActive: data.isActive,
      }
    });
    
    revalidatePath("/mng/settings");
    revalidatePath("/mng/orders");
    
    return { success: true, data: fee };
  } catch (error: any) {
    console.error("Error updating fee:", error);
    if (error.code === 'P2002') return { success: false, error: "Fee name already exists." };
    return { success: false, error: "Failed to update fee" };
  }
}

export async function toggleFee(id: string, isActive: boolean) {
  try {
    const fee = await prisma.fee.update({
      where: { id },
      data: { isActive },
    });
    
    revalidatePath("/mng/settings");
    revalidatePath("/mng/orders");
    
    return { success: true, data: fee };
  } catch (error: any) {
    console.error("Error toggling fee:", error);
    return { success: false, error: "Failed to toggle fee" };
  }
}

export async function deleteFee(id: string) {
  try {
    const fee = await prisma.fee.delete({
      where: { id },
    });
    
    revalidatePath("/mng/settings");
    revalidatePath("/mng/orders");
    
    return { success: true, data: fee };
  } catch (error: any) {
    console.error("Error deleting fee:", error);
    return { success: false, error: "Failed to delete fee" };
  }
}
