import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth();
    return NextResponse.json({
      service: "MorningVeg Apparel API",
      status: "operational",
      timestamp: new Date().toISOString(),
      database: dbHealth,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        service: "MorningVeg Apparel API",
        status: "degraded",
        timestamp: new Date().toISOString(),
        error: message,
      },
      { status: 500 }
    );
  }
}
