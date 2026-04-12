"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export type CreateMenuInput = {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  stock: number | null;
  isAvailable: boolean;
  imageUrl?: string;
};

export async function createMenu(data: CreateMenuInput) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        stock: data.stock,
        isAvailable: data.isAvailable,
        imageUrl: data.imageUrl,
      },
    });
    
    revalidatePath("/mng/menu");
    revalidatePath("/mng/categories");
    
    return { success: true, data: product };
  } catch (error: any) {
    console.error("Error creating menu item:", error);
    return { success: false, error: error.message || "Failed to create menu item" };
  }
}

export async function updateMenu(id: string, data: CreateMenuInput) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        stock: data.stock,
        isAvailable: data.isAvailable,
        imageUrl: data.imageUrl,
      },
    });
    
    revalidatePath("/mng/menu");
    revalidatePath("/mng/categories");
    
    return { success: true, data: product };
  } catch (error: any) {
    console.error("Error updating menu item:", error);
    return { success: false, error: error.message || "Failed to update menu item" };
  }
}

export async function deleteMenu(id: string) {
  try {
    const product = await prisma.product.delete({
      where: { id },
    });
    
    revalidatePath("/mng/menu");
    revalidatePath("/mng/categories");
    
    return { success: true, data: product };
  } catch (error: any) {
    console.error("Error deleting menu item:", error);
    return { success: false, error: error.message || "Failed to delete menu item" };
  }
}
