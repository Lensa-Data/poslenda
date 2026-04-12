import prisma from "@/lib/db";
import MenuClient, { type MenuItem, type StockStatus, type CategoryDTO } from "@/components/admin/menu-client";

// This is a dynamic server component since we're fetching live data
export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  // Fetch products and categories concurrently
  const [products, dbCategories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc", // Default newest first
      },
    }),
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  // Extract categories for the client
  const categoriesToClient: CategoryDTO[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name
  }));

  // Map Prisma Product models to the MenuItem structure expected by the client
  const mappedItems: MenuItem[] = products.map((prod) => {
    // Basic stock logic
    let stockStatus: StockStatus = "in-stock";
    if (!prod.isAvailable || (prod.stock !== null && prod.stock <= 0)) {
      stockStatus = "out-of-stock";
    } else if (prod.stock !== null && prod.stock < 10) {
      stockStatus = "low-stock";
    }

    return {
      id: prod.id,
      name: prod.name,
      description: prod.description || "",
      price: prod.price,
      categoryId: prod.categoryId,
      categoryName: prod.category?.name || "Uncategorized",
      stock: prod.stock,
      isAvailable: prod.isAvailable,
      stockStatus,
      imageUrl: prod.imageUrl || "",
      imageAlt: prod.name,
    };
  });

  return <MenuClient initialItems={mappedItems} categories={categoriesToClient} />;
}
