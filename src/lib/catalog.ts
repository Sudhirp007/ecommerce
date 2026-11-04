import { prisma } from "@/lib/db";

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  salePrice: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  primaryImage: string | null;
  availableSizes: string[];
  availableColors: { name: string; hex: string }[];
  totalStock: number;
}

/**
 * Fetch featured products for the storefront homepage
 */
export async function getFeaturedProducts(): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isArchived: false,
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      variants: {
        select: {
          size: true,
          colorName: true,
          colorHex: true,
          stock: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return formatProducts(products);
}

/**
 * Fetch all categories with product counts
 */
export async function getCategoriesWithCounts() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    productCount: c._count.products,
  }));
}

/**
 * Fetch a single product by slug with all variants and images
 */
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        orderBy: [{ colorName: "asc" }, { size: "asc" }],
      },
    },
  });

  if (!product) return null;

  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
  };
}

/**
 * Fetch category details with filtered products
 */
export async function getCategoryWithProducts(
  categorySlug: string,
  filter?: { size?: string; sort?: string }
) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) return null;

  const whereClause: Record<string, unknown> = {
    categoryId: category.id,
    isArchived: false,
  };

  if (filter?.size) {
    whereClause.variants = {
      some: {
        size: filter.size,
        stock: { gt: 0 },
      },
    };
  }

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (filter?.sort === "price-low") {
    orderBy = { basePrice: "asc" };
  } else if (filter?.sort === "price-high") {
    orderBy = { basePrice: "desc" };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      variants: {
        select: {
          size: true,
          colorName: true,
          colorHex: true,
          stock: true,
        },
      },
    },
    orderBy,
  });

  return {
    category,
    products: formatProducts(products),
  };
}

/**
 * Search products by keyword
 */
export async function searchProducts(query: string): Promise<ProductSummary[]> {
  if (!query || query.trim().length === 0) return [];

  const products = await prisma.product.findMany({
    where: {
      isArchived: false,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      variants: {
        select: {
          size: true,
          colorName: true,
          colorHex: true,
          stock: true,
        },
      },
    },
    take: 12,
  });

  return formatProducts(products);
}

// Helper formatter
interface RawProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: unknown;
  salePrice: unknown;
  category: { id: string; name: string; slug: string };
  images: { url: string }[];
  variants: { size: string; colorName: string; colorHex: string; stock: number }[];
}

function formatProducts(products: RawProductWithRelations[]): ProductSummary[] {
  return products.map((p) => {
    const sizeSet = new Set<string>();
    const colorMap = new Map<string, string>();
    let totalStock = 0;

    for (const v of p.variants) {
      sizeSet.add(v.size);
      if (!colorMap.has(v.colorName)) {
        colorMap.set(v.colorName, v.colorHex);
      }
      totalStock += v.stock;
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      category: p.category,
      primaryImage: p.images[0]?.url ?? null,
      availableSizes: Array.from(sizeSet),
      availableColors: Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex })),
      totalStock,
    };
  });
}
