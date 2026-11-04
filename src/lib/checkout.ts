import { prisma } from "@/lib/db";

export interface CartInputItem {
  variantId: string;
  quantity: number;
}

export interface ValidatedLineItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  primaryImage: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
  availableStock: number;
  isOutOfStock: boolean;
  stockSufficient: boolean;
}

export interface CartCalculationResult {
  valid: boolean;
  items: ValidatedLineItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  grandTotal: number;
  freeShippingThreshold: number;
  qualifiesForFreeShipping: boolean;
  errors: string[];
}

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

/**
 * Authoritative Server-Side Cart Recalculation & Stock Check.
 * ZERO CLIENT TRUST: Ignores any client-submitted prices or totals.
 * Fetches current prices and stock directly from Neon PostgreSQL.
 */
export async function calculateAndValidateCart(
  cartItems: CartInputItem[]
): Promise<CartCalculationResult> {
  const errors: string[] = [];
  const validatedItems: ValidatedLineItem[] = [];

  if (!cartItems || cartItems.length === 0) {
    return {
      valid: false,
      items: [],
      itemCount: 0,
      subtotal: 0,
      shippingFee: 0,
      discountTotal: 0,
      grandTotal: 0,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      qualifiesForFreeShipping: false,
      errors: ["Cart is empty"],
    };
  }

  // Extract unique variant IDs
  const variantIds = Array.from(new Set(cartItems.map((i) => i.variantId)));

  // Query database for authoritative variants, products, and images
  const dbVariants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
        },
      },
    },
  });

  const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

  let subtotal = 0;
  let totalQuantity = 0;
  let allStockSufficient = true;

  for (const item of cartItems) {
    const variant = variantMap.get(item.variantId);

    if (!variant) {
      errors.push(`Variant with ID '${item.variantId}' is no longer available.`);
      allStockSufficient = false;
      continue;
    }

    const requestedQty = Math.max(1, Math.floor(item.quantity));
    const unitPrice = Number(variant.price);
    const lineSubtotal = unitPrice * requestedQty;
    const isOutOfStock = variant.stock <= 0;
    const stockSufficient = variant.stock >= requestedQty;

    if (!stockSufficient) {
      allStockSufficient = false;
      if (isOutOfStock) {
        errors.push(`'${variant.product.name} (${variant.size} / ${variant.colorName})' is out of stock.`);
      } else {
        errors.push(
          `Only ${variant.stock} item(s) left in stock for '${variant.product.name} (${variant.size} / ${variant.colorName})'.`
        );
      }
    }

    subtotal += lineSubtotal;
    totalQuantity += requestedQty;

    validatedItems.push({
      variantId: variant.id,
      productId: variant.productId,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      primaryImage: variant.product.images[0]?.url || "/images/placeholder.jpg",
      sku: variant.sku,
      size: variant.size,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      unitPrice,
      quantity: requestedQty,
      lineSubtotal,
      availableStock: variant.stock,
      isOutOfStock,
      stockSufficient,
    });
  }

  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const discountTotal = 0;
  const grandTotal = subtotal + shippingFee - discountTotal;

  return {
    valid: allStockSufficient && errors.length === 0,
    items: validatedItems,
    itemCount: totalQuantity,
    subtotal,
    shippingFee,
    discountTotal,
    grandTotal,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    qualifiesForFreeShipping,
    errors,
  };
}
