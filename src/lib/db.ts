import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/client";

import { env } from "./env";

export function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();
export default prisma;
