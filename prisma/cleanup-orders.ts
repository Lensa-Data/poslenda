import prisma from '../src/lib/db';

async function main() {
  console.log("Emptying order table before push...");
  await prisma.$executeRawUnsafe(`DELETE FROM "order"`);
  console.log("Order table emptied.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
