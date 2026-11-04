import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";

if (typeof globalThis.WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = globalThis.WebSocket;
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL missing");

const adapter = new PrismaNeon({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function runCheckoutTests() {
  console.log("=== MorningVeg Cart & Checkout Architecture Integration Test ===");
  const baseUrl = "http://localhost:3000";

  // 1. Fetch live variants for testing
  const teeVariant = await prisma.productVariant.findFirst({
    where: { sku: "MV-TEE-BLK-M" },
    include: { product: true },
  });
  const capVariant = await prisma.productVariant.findFirst({
    where: { sku: "MV-CAP-NVY-OS" },
    include: { product: true },
  });

  if (!teeVariant || !capVariant) {
    throw new Error("Required seed variants not found");
  }

  console.log(`Found Test Variants:
- ${teeVariant.product.name} (SKU: ${teeVariant.sku}, DB Price: ₹${teeVariant.price}, Stock: ${teeVariant.stock})
- ${capVariant.product.name} (SKU: ${capVariant.sku}, DB Price: ₹${capVariant.price}, Stock: ${capVariant.stock})`);

  // [Test 1] Zero Client Trust: Server Price Recalculation
  console.log("\n[Test 1] POST /api/cart/validate — Zero Client Trust Price Recalculation");
  // Client attempts to pass a tampered price of ₹10 instead of DB price (₹799)
  const res1 = await fetch(`${baseUrl}/api/cart/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [
        { variantId: teeVariant.id, quantity: 1, price: 10, total: 10 }, // tampered client values
      ],
    }),
  });
  const data1 = await res1.json();
  console.log(`Status: ${res1.status}`);
  console.log(`Calculated Unit Price: ₹${data1.calculation.items[0]?.unitPrice} (Expected: ₹${Number(teeVariant.price)})`);
  console.log(`Calculated Subtotal: ₹${data1.calculation.subtotal}`);

  if (data1.calculation.items[0]?.unitPrice !== Number(teeVariant.price)) {
    throw new Error("Zero Client Trust Failed: Server did not enforce authoritative DB price!");
  }
  console.log("✅ Zero Client Trust verified: Tampered client price was completely ignored.");

  // [Test 2] Shipping Threshold: Under ₹999 incurs ₹99 shipping
  console.log("\n[Test 2] Shipping calculation under ₹999 threshold");
  console.log(`Subtotal: ₹${data1.calculation.subtotal}, Shipping: ₹${data1.calculation.shippingFee} (Expected: ₹99)`);
  if (data1.calculation.shippingFee !== 99) {
    throw new Error("Expected ₹99 shipping fee for order under ₹999");
  }
  console.log("✅ Standard shipping fee (₹99) applied correctly.");

  // [Test 3] Shipping Threshold: $\ge$ ₹999 qualifies for Free Shipping
  console.log("\n[Test 3] Shipping calculation at/above ₹999 threshold");
  const res3 = await fetch(`${baseUrl}/api/cart/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [
        { variantId: teeVariant.id, quantity: 2 }, // 2 * 799 = 1598
      ],
    }),
  });
  const data3 = await res3.json();
  console.log(`Subtotal: ₹${data3.calculation.subtotal}, Shipping: ₹${data3.calculation.shippingFee} (Expected: ₹0 / Free)`);
  if (data3.calculation.shippingFee !== 0 || !data3.calculation.qualifiesForFreeShipping) {
    throw new Error("Expected ₹0 free shipping for subtotal >= ₹999");
  }
  console.log("✅ Free shipping (₹0) applied correctly for order above threshold.");

  // [Test 4] Out-of-Stock Validation
  console.log("\n[Test 4] Out of Stock rejection");
  const res4 = await fetch(`${baseUrl}/api/cart/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [
        { variantId: teeVariant.id, quantity: teeVariant.stock + 50 }, // Exceeds available stock
      ],
    }),
  });
  const data4 = await res4.json();
  console.log(`Valid: ${data4.calculation.valid} (Expected: false)`);
  console.log(`Errors:`, data4.calculation.errors);
  if (data4.calculation.valid !== false || data4.calculation.errors.length === 0) {
    throw new Error("Out-of-stock validation failed to flag excessive quantity");
  }
  console.log("✅ Out-of-stock quantity blocked correctly.");

  // [Test 5] Place Valid Order via POST /api/orders
  console.log("\n[Test 5] POST /api/orders — Complete Order Placement");
  const orderPayload = {
    items: [
      { variantId: teeVariant.id, quantity: 1 },
      { variantId: capVariant.id, quantity: 1 },
    ],
    shippingAddress: {
      fullName: "Vikram Malhotra",
      phone: "9876543210",
      street: "Flat 302, Palm Grove Residences",
      landmark: "Near Forum Mall",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560095",
      country: "India",
    },
    paymentMethod: "UPI_INTENT",
    notes: "Please deliver during afternoon hours.",
  };

  const res5 = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });
  const data5 = await res5.json();
  console.log(`Status: ${res5.status} (Expected: 201)`);
  console.log(`Order Result:`, data5);

  if (res5.status !== 201 || !data5.success || !data5.order?.orderNumber) {
    throw new Error("Order creation failed");
  }
  const createdOrderNumber = data5.order.orderNumber;
  console.log(`✅ Order placed successfully! Generated Order Number: ${createdOrderNumber}`);

  // [Test 6] Lookup Placed Order via GET /api/orders/[orderNumber]
  console.log(`\n[Test 6] GET /api/orders/${createdOrderNumber} — Immutable Snapshot Check`);
  const res6 = await fetch(`${baseUrl}/api/orders/${createdOrderNumber}`);
  const data6 = await res6.json();
  console.log(`Status: ${res6.status} (Expected: 200)`);
  console.log(`Order Details:`, {
    orderNumber: data6.order.orderNumber,
    status: data6.order.status,
    grandTotal: data6.order.grandTotal,
    itemsCount: data6.order.items.length,
    paymentMethod: data6.order.payment?.method,
  });

  const firstItem = data6.order.items[0];
  console.log(`Snapshot Item 1: ${firstItem.productName} (SKU: ${firstItem.sku}, Snapshot UnitPrice: ₹${firstItem.unitPrice}, Qty: ${firstItem.quantity})`);

  if (!firstItem.sku || Number(firstItem.unitPrice) <= 0) {
    throw new Error("Immutable purchase snapshot was not properly stored");
  }
  console.log("✅ Immutable purchase snapshot verified in database!");

  // [Test 7] Verify Atomic Inventory Deduction & Audit Log
  console.log(`\n[Test 7] Atomic Inventory & Audit Log Verification`);
  const updatedTee = await prisma.productVariant.findUnique({ where: { id: teeVariant.id } });
  console.log(`Initial Tee Stock: ${teeVariant.stock}, Current Stock: ${updatedTee?.stock} (Expected: ${teeVariant.stock - 1})`);
  if (!updatedTee || updatedTee.stock !== teeVariant.stock - 1) {
    throw new Error("Atomic stock deduction failed!");
  }
  const inventoryLog = await prisma.inventoryLog.findFirst({
    where: { variantId: teeVariant.id, reason: "ORDER_PURCHASE" },
    orderBy: { createdAt: "desc" },
  });
  console.log(`Inventory Log Entry:`, {
    variantId: inventoryLog?.variantId,
    quantity: inventoryLog?.quantity,
    reason: inventoryLog?.reason,
    referenceId: inventoryLog?.referenceId,
  });
  if (!inventoryLog || inventoryLog.quantity !== -1) {
    throw new Error("Inventory audit log entry missing or quantity invalid!");
  }
  console.log("✅ Atomic stock decrement and InventoryLog audit record verified!");

  console.log("\n🎉 ALL MILESTONE 5 CART & CHECKOUT INTEGRATION TESTS PASSED CLEANLY!\n");
}

runCheckoutTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
