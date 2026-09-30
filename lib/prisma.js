import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Initialize on first query so builds do not require a live database.
export function getPrisma() {
  if (!globalThis.sanfileyPrisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Set DATABASE_URL in .env.local to connect to PostgreSQL.");
    }
    globalThis.sanfileyPrisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }
  return globalThis.sanfileyPrisma;
}
