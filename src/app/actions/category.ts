"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCategory(name: string) {
  try {
    const category = await prisma.category.create({
      data: {
        name,
      },
    });
    
    // Refresh both category and menu pages
    revalidatePath("/mng/categories");
    revalidatePath("/mng/menu");
    
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    
    revalidatePath("/mng/categories");
    revalidatePath("/mng/menu");
    
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Note: Due to foreign key constraints, if there are products attached,
    // this will fail unless Prisma schema is setup with onDelete: Cascade
    // Wait, let's just attempt it and return an error if products exist.
    const categoryCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (categoryCount > 0) {
      return { success: false, error: "Cannot delete category with active products. Please reassign or delete products first." };
    }

    const category = await prisma.category.delete({
      where: { id },
    });
    
    revalidatePath("/mng/categories");
    revalidatePath("/mng/menu");
    
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
