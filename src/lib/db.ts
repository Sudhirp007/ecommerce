import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";

// Ensure Neon serverless client uses native WebSockets in Node.js / edge environments
if (typeof globalThis.WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = globalThis.WebSocket;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing. Check .env.local or .env.");
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// PrismaNeon enables interactive transactions ($transaction) with zero native C++ binaries
const adapter = new PrismaNeon({ connectionString: databaseUrl });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  recordCount: number;
  lastRecord: {
    id: string;
    service: string;
    status: string;
    timestamp: Date;
  } | null;
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const [count, lastRecord] = await Promise.all([
    prisma.systemStatus.count(),
    prisma.systemStatus.findFirst({
      orderBy: { timestamp: "desc" },
    }),
  ]);

  return {
    status: "healthy",
    recordCount: count,
    lastRecord,
  };
}
