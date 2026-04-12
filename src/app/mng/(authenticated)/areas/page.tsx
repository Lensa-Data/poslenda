import prisma from "@/lib/db";
import AreaClient from "@/components/admin/area-client";

export const dynamic = 'force-dynamic';

export default async function AreasPage() {
  const areas = await prisma.area.findMany({
    include: {
      tables: {
        select: { id: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const formattedAreas = areas.map((area) => ({
    id: area.id,
    name: area.name,
    tablesCount: area.tables.length,
  }));

  return <AreaClient initialAreas={formattedAreas} />;
}
