import prisma from "@/lib/db";
import CategoryClient, { type CategoryDTO } from "@/components/admin/category-client";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const dbCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  const categoriesToClient: CategoryDTO[] = dbCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    productsCount: cat._count.products
  }));

  return <CategoryClient initialCategories={categoriesToClient} />;
}
