import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("Auth session query error:", error);
    return NextResponse.json(
      { success: false, authenticated: false, error: "Failed to query session" },
      { status: 500 }
    );
  }
}
