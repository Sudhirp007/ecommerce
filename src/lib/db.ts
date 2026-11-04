import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing. Check .env.local.");
}

/**
 * Neon Serverless SQL Client
 * Uses HTTP pipeline optimized for serverless functions, edge workers, and Next.js App Router.
 */
export const sql = neon(databaseUrl);

export interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  database: string;
  serverTime: string;
  postgresVersion: string;
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const rows = await sql`SELECT version(), current_database(), now() AS server_time`;
  const first = rows[0] as {
    version: string;
    current_database: string;
    server_time: string;
  };

  return {
    status: "healthy",
    database: first.current_database,
    serverTime: first.server_time,
    postgresVersion: first.version,
  };
}
