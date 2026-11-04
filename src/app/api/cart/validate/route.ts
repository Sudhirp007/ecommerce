import { NextResponse } from "next/server";
import { calculateAndValidateCart } from "@/lib/checkout";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body.items;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: 'items' array expected." },
        { status: 400 }
      );
    }

    const result = await calculateAndValidateCart(items);

    return NextResponse.json({
      success: true,
      calculation: result,
    });
  } catch (error) {
    console.error("Cart validation API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to recalculate and validate cart." },
      { status: 500 }
    );
  }
}
