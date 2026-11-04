import { NextResponse } from "next/server";
import { getCategoriesWithCounts, getFeaturedProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [categories, featuredProducts] = await Promise.all([
      getCategoriesWithCounts(),
      getFeaturedProducts(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        categories: categories.length,
        featuredProducts: featuredProducts.length,
      },
      categories,
      products: featuredProducts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to query catalog";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
