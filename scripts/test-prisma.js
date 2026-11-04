require("dotenv").config({ path: ".env.local" });
const { PrismaNeonHttp } = require("@prisma/adapter-neon");
const { PrismaClient } = require("@prisma/client");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const adapter = new PrismaNeonHttp(connectionString);
const prisma = new PrismaClient({ adapter });

async function testPrisma() {
  try {
    console.log("--- TESTING PRISMA + @prisma/adapter-neon (HTTP) ---");

    // 1. Raw query test via Prisma
    const [raw] = await prisma.$queryRaw`SELECT version(), current_database(), now() AS server_time`;
    console.log("Raw query via Prisma:", {
      database: raw.current_database,
      version: raw.version.split(" ")[0] + " " + raw.version.split(" ")[1],
      serverTime: raw.server_time,
    });

    // 2. Model CRUD test via Prisma (SystemStatus)
    const record = await prisma.systemStatus.create({
      data: {
        service: "MorningVeg Apparel API",
        status: "operational",
      },
    });
    console.log("Prisma Model Create (SystemStatus):", record);

    const count = await prisma.systemStatus.count();
    console.log("Total SystemStatus records in Neon DB:", count);

    console.log("PRISMA + NEON ADAPTER VERIFICATION: 100% OPERATIONAL");
    process.exit(0);
  } catch (err) {
    console.error("Prisma test failed:", err);
    process.exit(1);
  }
}

testPrisma();
