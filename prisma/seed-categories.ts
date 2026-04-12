import prisma from '../src/lib/db';

async function main() {
  const categories = [
    "Appetizers",
    "Main Course",
    "Drinks",
    "Desserts",
    "Pastries"
  ];

  console.log('Seeding categories...');

  for (const name of categories) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (!existing) {
      await prisma.category.create({
        data: { name }
      });
      console.log(`Created category: ${name}`);
    } else {
      console.log(`Category ${name} already exists. Skipping.`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
