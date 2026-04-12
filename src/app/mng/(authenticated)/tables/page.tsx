import prisma from "@/lib/db";
import TableClient, { type TableNode, type AreaStatInfo } from "@/components/admin/table-client";

export const dynamic = 'force-dynamic';

export default async function TablesPage() {
  // Fetch Tables with Areas and their active orders if any
  const dbTables = await prisma.table.findMany({
    include: {
      area: true,
      orders: {
        where: {
          status: { not: "CANCELLED" }, // or whatever your logic is for an active order
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const dbAreas = await prisma.area.findMany({
    include: {
      tables: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  let totalCapacity = 0;
  let totalSeats = 0;

  const initialTables: TableNode[] = dbTables.map((t) => {
    totalSeats += t.seats;
    const isOccupied = t.orders.length > 0;
    
    // Simulate guests mapping
    const guestsCount = isOccupied ? Math.floor(t.seats * 0.8) || 1 : 0; 
    if (isOccupied) totalCapacity += guestsCount;

    return {
      id: t.id,
      name: t.name,
      seats: t.seats,
      qrToken: t.qrToken,
      areaId: t.areaId,
      areaName: t.area?.name || "Unassigned",
      status: isOccupied ? "Occupied" : "Available",
      guests: guestsCount,
      details: isOccupied ? `${t.orders.length} active orders` : "Ready to serve",
    };
  });

  const areasInfo: AreaStatInfo[] = dbAreas.map((a) => ({
    id: a.id,
    name: a.name,
    tableCount: a.tables.length,
    totalSeats: a.tables.reduce((acc, table) => acc + table.seats, 0),
  }));

  return (
    <TableClient 
      initialTables={initialTables} 
      areas={areasInfo} 
      totalCapacity={totalCapacity} 
      totalSeats={totalSeats} 
      waitListGroups={0} 
    />
  );
}
