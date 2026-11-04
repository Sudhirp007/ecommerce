import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { calculateAndValidateCart } from "@/lib/checkout";

const orderCreationSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().min(1, "variantId required"),
      quantity: z.number().int().positive("quantity must be positive"),
    })
  ).min(1, "Cart cannot be empty"),
  shippingAddress: z.object({
    fullName: z.string().min(2, "Full recipient name required"),
    phone: z.string().min(10, "Valid phone number required"),
    street: z.string().min(5, "Street address required"),
    landmark: z.string().optional(),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
    postalCode: z.string().min(5, "Postal code required"),
    country: z.string().default("India"),
  }),
  paymentMethod: z.enum(["UPI_INTENT", "UPI_QR", "CARD", "NETBANKING"]).default("UPI_INTENT"),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = orderCreationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { items, shippingAddress, paymentMethod, notes } = parsed.data;

    // Check optional authenticated user session
    const session = await getSessionUser();
    const userId = session?.userId || null;

    // Recalculate and validate prices and stock from live database (ZERO CLIENT TRUST)
    const calculation = await calculateAndValidateCart(items);

    if (!calculation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Checkout validation failed. Some items may be out of stock or unavailable.",
          details: calculation.errors,
          items: calculation.items,
        },
        { status: 400 }
      );
    }

    // Generate unique order number prefix
    const count = await prisma.order.count();
    const year = new Date().getFullYear();
    const orderNumber = `MV-${year}-${String(count + 1).padStart(4, "0")}`;

    // Execute atomic interactive transaction: Order, Items, Inventory deduction, Audit Logs, and Payment
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Re-validate & decrement stock atomically within the transaction lock
      for (const item of calculation.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { id: true, stock: true, sku: true },
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for SKU ${item.sku}. Requested: ${item.quantity}, available: ${variant?.stock ?? 0}.`
          );
        }

        // Deduct inventory
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 2. Create Order record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal: calculation.subtotal,
          discountTotal: calculation.discountTotal,
          shippingFee: calculation.shippingFee,
          grandTotal: calculation.grandTotal,
          shippingAddress: shippingAddress as object,
          notes: notes || null,
        },
      });

      // 3. Create OrderItem records with immutable purchase snapshots and inventory audit logs
      for (const item of calculation.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            productName: item.productName,
            sku: item.sku,
            size: item.size,
            color: item.colorName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.lineSubtotal,
          },
        });

        // Audit inventory reduction
        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            quantity: -item.quantity,
            reason: "ORDER_PURCHASE",
            referenceId: order.id,
            notes: `Inventory deducted for Order ${order.orderNumber}`,
          },
        });
      }

      // 4. Create pending payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: paymentMethod,
          amount: calculation.grandTotal,
          status: "PENDING",
        },
      });

      // 5. If user has a database cart, clear it
      if (userId) {
        const userCart = await tx.cart.findUnique({ where: { userId } });
        if (userCart) {
          await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      }

      return order;
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          grandTotal: calculation.grandTotal,
          subtotal: calculation.subtotal,
          shippingFee: calculation.shippingFee,
          status: createdOrder.status,
          itemCount: calculation.itemCount,
          shippingAddress,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}
