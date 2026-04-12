import prisma from '../src/lib/db';

async function main() {
  console.log('Seeding areas and tables...');

  // Create Areas
  const areasToCreate = [
    { name: "Main Hall" },
    { name: "Patio" },
    { name: "VIP Lounge" },
  ];

  for (const area of areasToCreate) {
    const existing = await prisma.area.findUnique({ where: { name: area.name } });
    if (!existing) {
      await prisma.area.create({ data: area });
      console.log(`Created area: ${area.name}`);
    }
  }

  // Fetch areas to assign tables
  const dbAreas = await prisma.area.findMany();
  
  const mainHall = dbAreas.find(a => a.name === "Main Hall");
  const patio = dbAreas.find(a => a.name === "Patio");
  const vipLounge = dbAreas.find(a => a.name === "VIP Lounge");

  if (!mainHall || !patio || !vipLounge) {
    throw new Error("Failed to find seeded areas.");
  }

  // Tables
  const tablesToCreate = [
    { name: "01", seats: 4, areaId: mainHall.id },
    { name: "02", seats: 2, areaId: mainHall.id },
    { name: "03", seats: 1, areaId: mainHall.id },
    { name: "04", seats: 6, areaId: patio.id },
    { name: "05", seats: 4, areaId: patio.id },
    { name: "VIP-A", seats: 8, areaId: vipLounge.id },
  ];

  for (const t of tablesToCreate) {
    const existing = await prisma.table.findUnique({ where: { name: t.name } });
    if (!existing) {
      await prisma.table.create({ data: t });
      console.log(`Created table: ${t.name} in area: ${t.areaId}`);
    }
  }

  console.log('Areas and tables seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
