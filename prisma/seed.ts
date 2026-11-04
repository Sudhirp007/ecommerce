import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaNeonHttp(databaseUrl, {});
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seed() {
  console.log("🌱 Starting MorningVeg Apparel Database Seed (Sequential HTTP mode)...");

  // 1. Clear existing seed data in correct reverse foreign key order
  console.log("Cleaning existing records...");
  await prisma.inventoryLog.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users & Addresses (Sequential without nested transactions)
  console.log("Creating default users and addresses...");
  const defaultPasswordHash = await hashPassword("Password123!");

  const admin = await prisma.user.create({
    data: {
      email: "admin@morningveg.com",
      name: "Store Administrator",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      phone: "+91 98765 43210",
    },
  });

  await prisma.address.create({
    data: {
      userId: admin.id,
      fullName: "MorningVeg HQ Operations",
      phone: "+91 98765 43210",
      street: "102 Warehouse District, HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560102",
      country: "India",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@morningveg.com",
      name: "Rahul Sharma",
      passwordHash: defaultPasswordHash,
      role: "CUSTOMER",
      phone: "+91 91234 56789",
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: "Rahul Sharma",
      phone: "+91 91234 56789",
      street: "Flat 402, Green Glen Layout, Bellandur",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560103",
      country: "India",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  });

  // 3. Seed Categories
  console.log("Creating categories...");
  const catTees = await prisma.category.create({
    data: {
      name: "T-Shirts",
      slug: "t-shirts",
      description: "Premium 100% combed organic cotton tees designed for breathability and shape retention.",
      imageUrl: "/images/categories/tees.jpg",
    },
  });

  const catShirts = await prisma.category.create({
    data: {
      name: "Shirts",
      slug: "shirts",
      description: "Breathable pure linen and relaxed cotton shirts for effortless daily layering.",
      imageUrl: "/images/categories/shirts.jpg",
    },
  });

  const catBottoms = await prisma.category.create({
    data: {
      name: "Bottoms & Trousers",
      slug: "bottoms",
      description: "Tailored chinos, everyday stretch trousers, and relaxed drawstring pants.",
      imageUrl: "/images/categories/bottoms.jpg",
    },
  });

  const catKnitwear = await prisma.category.create({
    data: {
      name: "Knitwear & Outerwear",
      slug: "knitwear",
      description: "Cozy brushed French terry pullovers, fleece hoodies, and lightweight zip-ups.",
      imageUrl: "/images/categories/knitwear.jpg",
    },
  });

  const catAccessories = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Organic cotton canvas totes, unstructured twill caps, and combed socks.",
      imageUrl: "/images/categories/accessories.jpg",
    },
  });

  // 4. Products Data with Variants
  console.log("Creating apparel products with variants and inventory...");

  const productsData = [
    // --- T-SHIRTS ---
    {
      categoryId: catTees.id,
      name: "Organic Heavyweight Classic Crew Tee",
      slug: "organic-heavyweight-classic-crew-tee",
      description: "Crafted from 220 GSM single jersey organic cotton. Pre-shrunk, reinforced collar, and tailored standard drape.",
      details: "100% Organic Cotton. 220 GSM. Machine wash cold with like colors. Do not bleach. Tumble dry low.",
      sizeChart: "S: Chest 38in, Length 27in | M: Chest 40in, Length 28in | L: Chest 42in, Length 29in | XL: Chest 44in, Length 30in",
      basePrice: 899.00,
      salePrice: 799.00,
      isFeatured: true,
      images: [
        { url: "/images/products/crew-tee-black-front.jpg", altText: "Heavyweight Crew Tee Front View", isPrimary: true, sortOrder: 0 },
        { url: "/images/products/crew-tee-black-back.jpg", altText: "Heavyweight Crew Tee Back View", isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: "S", colorName: "Pitch Black", colorHex: "#111111", sku: "MV-TEE-BLK-S", price: 799.00, stock: 25 },
        { size: "M", colorName: "Pitch Black", colorHex: "#111111", sku: "MV-TEE-BLK-M", price: 799.00, stock: 40 },
        { size: "L", colorName: "Pitch Black", colorHex: "#111111", sku: "MV-TEE-BLK-L", price: 799.00, stock: 35 },
        { size: "XL", colorName: "Pitch Black", colorHex: "#111111", sku: "MV-TEE-BLK-XL", price: 799.00, stock: 15 },
        { size: "S", colorName: "Olive Sage", colorHex: "#4A5D4E", sku: "MV-TEE-OLV-S", price: 799.00, stock: 20 },
        { size: "M", colorName: "Olive Sage", colorHex: "#4A5D4E", sku: "MV-TEE-OLV-M", price: 799.00, stock: 30 },
        { size: "L", colorName: "Olive Sage", colorHex: "#4A5D4E", sku: "MV-TEE-OLV-L", price: 799.00, stock: 25 },
        { size: "XL", colorName: "Olive Sage", colorHex: "#4A5D4E", sku: "MV-TEE-OLV-XL", price: 799.00, stock: 10 },
      ],
    },
    {
      categoryId: catTees.id,
      name: "Vintage Wash Oversized Drop-Shoulder Tee",
      slug: "vintage-wash-oversized-drop-shoulder-tee",
      description: "Relaxed boxy silhouette with dropped shoulder seams and subtle mineral garment wash.",
      details: "100% Combed Cotton. 240 GSM. Acid enzyme wash. Ribbed crew neck.",
      sizeChart: "S: Chest 42in, Length 28in | M: Chest 44in, Length 29in | L: Chest 46in, Length 30in | XL: Chest 48in, Length 31in",
      basePrice: 1099.00,
      salePrice: 949.00,
      isFeatured: true,
      images: [
        { url: "/images/products/oversized-tee-wash-1.jpg", altText: "Oversized Tee Vintage Wash", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "S", colorName: "Washed Charcoal", colorHex: "#36454F", sku: "MV-OVTEE-CHR-S", price: 949.00, stock: 18 },
        { size: "M", colorName: "Washed Charcoal", colorHex: "#36454F", sku: "MV-OVTEE-CHR-M", price: 949.00, stock: 24 },
        { size: "L", colorName: "Washed Charcoal", colorHex: "#36454F", sku: "MV-OVTEE-CHR-L", price: 949.00, stock: 22 },
        { size: "XL", colorName: "Washed Charcoal", colorHex: "#36454F", sku: "MV-OVTEE-CHR-XL", price: 949.00, stock: 12 },
        { size: "M", colorName: "Earthy Terracotta", colorHex: "#C06C54", sku: "MV-OVTEE-TER-M", price: 949.00, stock: 16 },
        { size: "L", colorName: "Earthy Terracotta", colorHex: "#C06C54", sku: "MV-OVTEE-TER-L", price: 949.00, stock: 20 },
      ],
    },

    // --- SHIRTS ---
    {
      categoryId: catShirts.id,
      name: "Pure French Linen Resort Overshirt",
      slug: "pure-french-linen-resort-overshirt",
      description: "Naturally thermoregulating 100% Normandy flax linen. Camp collar with mother-of-pearl buttons.",
      details: "100% Pure Linen. Yarn-dyed. Pre-washed for soft hand-feel. Gentle hand or machine wash.",
      sizeChart: "S: Chest 40in | M: Chest 42in | L: Chest 44in | XL: Chest 46in",
      basePrice: 1899.00,
      salePrice: 1599.00,
      isFeatured: true,
      images: [
        { url: "/images/products/linen-shirt-natural.jpg", altText: "Linen Resort Shirt Natural", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "S", colorName: "Natural Oatmeal", colorHex: "#E3DAC9", sku: "MV-LINEN-NAT-S", price: 1599.00, stock: 14 },
        { size: "M", colorName: "Natural Oatmeal", colorHex: "#E3DAC9", sku: "MV-LINEN-NAT-M", price: 1599.00, stock: 20 },
        { size: "L", colorName: "Natural Oatmeal", colorHex: "#E3DAC9", sku: "MV-LINEN-NAT-L", price: 1599.00, stock: 18 },
        { size: "XL", colorName: "Natural Oatmeal", colorHex: "#E3DAC9", sku: "MV-LINEN-NAT-XL", price: 1599.00, stock: 8 },
        { size: "M", colorName: "Deep Sky Indigo", colorHex: "#2C3E50", sku: "MV-LINEN-IND-M", price: 1599.00, stock: 15 },
        { size: "L", colorName: "Deep Sky Indigo", colorHex: "#2C3E50", sku: "MV-LINEN-IND-L", price: 1599.00, stock: 12 },
      ],
    },
    {
      categoryId: catShirts.id,
      name: "Tailored Oxford Button-Down Shirt",
      slug: "tailored-oxford-button-down-shirt",
      description: "Substantial basketweave Oxford cloth engineered for smart casual wear that transitions to evening.",
      details: "100% Long-Staple Cotton. Button-down collar. Curved hem. Chest patch pocket.",
      sizeChart: "S: Collar 15in, Chest 39in | M: Collar 15.5in, Chest 41in | L: Collar 16in, Chest 43in | XL: Collar 16.5in, Chest 45in",
      basePrice: 1699.00,
      salePrice: null,
      isFeatured: false,
      images: [
        { url: "/images/products/oxford-shirt-white.jpg", altText: "Oxford Shirt Crisp White", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "S", colorName: "Crisp White", colorHex: "#FFFFFF", sku: "MV-OXF-WHT-S", price: 1699.00, stock: 22 },
        { size: "M", colorName: "Crisp White", colorHex: "#FFFFFF", sku: "MV-OXF-WHT-M", price: 1699.00, stock: 35 },
        { size: "L", colorName: "Crisp White", colorHex: "#FFFFFF", sku: "MV-OXF-WHT-L", price: 1699.00, stock: 28 },
        { size: "XL", colorName: "Crisp White", colorHex: "#FFFFFF", sku: "MV-OXF-WHT-XL", price: 1699.00, stock: 14 },
      ],
    },

    // --- BOTTOMS ---
    {
      categoryId: catBottoms.id,
      name: "Everyday Stretch Twill Chino Trousers",
      slug: "everyday-stretch-twill-chino-trousers",
      description: "Tapered leg cut with 2% elastane for effortless active flex. Clean flat front with reinforced belt loops.",
      details: "98% Cotton, 2% Spandex. YKK zip fly. Double welt back pockets with button closures.",
      sizeChart: "Waist 30: Inseam 31in | Waist 32: Inseam 32in | Waist 34: Inseam 32in | Waist 36: Inseam 33in",
      basePrice: 1999.00,
      salePrice: 1799.00,
      isFeatured: true,
      images: [
        { url: "/images/products/chinos-khaki.jpg", altText: "Stretch Chino Trousers Khaki", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "30", colorName: "British Khaki", colorHex: "#C3B091", sku: "MV-CHINO-KHK-30", price: 1799.00, stock: 16 },
        { size: "32", colorName: "British Khaki", colorHex: "#C3B091", sku: "MV-CHINO-KHK-32", price: 1799.00, stock: 30 },
        { size: "34", colorName: "British Khaki", colorHex: "#C3B091", sku: "MV-CHINO-KHK-34", price: 1799.00, stock: 25 },
        { size: "36", colorName: "British Khaki", colorHex: "#C3B091", sku: "MV-CHINO-KHK-36", price: 1799.00, stock: 10 },
        { size: "30", colorName: "Midnight Navy", colorHex: "#000080", sku: "MV-CHINO-NVY-30", price: 1799.00, stock: 14 },
        { size: "32", colorName: "Midnight Navy", colorHex: "#000080", sku: "MV-CHINO-NVY-32", price: 1799.00, stock: 28 },
        { size: "34", colorName: "Midnight Navy", colorHex: "#000080", sku: "MV-CHINO-NVY-34", price: 1799.00, stock: 20 },
      ],
    },
    {
      categoryId: catBottoms.id,
      name: "Relaxed Drawstring Linen-Cotton Pants",
      slug: "relaxed-drawstring-linen-cotton-pants",
      description: "Airy 55/45 linen-cotton blend with an elasticized drawstring waist. Perfect for tropical climates.",
      details: "55% Linen, 45% Cotton. Relaxed straight leg. Side slash pockets.",
      sizeChart: "S (28-30) | M (31-33) | L (34-36) | XL (37-39)",
      basePrice: 1799.00,
      salePrice: null,
      isFeatured: false,
      images: [
        { url: "/images/products/linen-pants-sand.jpg", altText: "Relaxed Drawstring Linen Pants Sand", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "S", colorName: "Desert Sand", colorHex: "#EDC9AF", sku: "MV-LPANT-SND-S", price: 1799.00, stock: 12 },
        { size: "M", colorName: "Desert Sand", colorHex: "#EDC9AF", sku: "MV-LPANT-SND-M", price: 1799.00, stock: 18 },
        { size: "L", colorName: "Desert Sand", colorHex: "#EDC9AF", sku: "MV-LPANT-SND-L", price: 1799.00, stock: 15 },
        { size: "XL", colorName: "Desert Sand", colorHex: "#EDC9AF", sku: "MV-LPANT-SND-XL", price: 1799.00, stock: 9 },
      ],
    },

    // --- KNITWEAR & OUTERWEAR ---
    {
      categoryId: catKnitwear.id,
      name: "Loopback French Terry Classic Crewneck Sweatshirt",
      slug: "loopback-french-terry-classic-crewneck-sweatshirt",
      description: "Knitted from 380 GSM combed unbrushed loopback cotton. Vintage V-insert at the neck and raglan sleeves.",
      details: "100% Combed Cotton. 380 GSM Heavyweight Terry. Flatlock seams. Ribbed cuffs and hem.",
      sizeChart: "S: Chest 40in | M: Chest 42in | L: Chest 44in | XL: Chest 46in",
      basePrice: 2299.00,
      salePrice: 1999.00,
      isFeatured: true,
      images: [
        { url: "/images/products/crewneck-grey.jpg", altText: "French Terry Sweatshirt Heather Grey", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "S", colorName: "Heather Melange Grey", colorHex: "#9AA0A6", sku: "MV-SWEAT-GRY-S", price: 1999.00, stock: 15 },
        { size: "M", colorName: "Heather Melange Grey", colorHex: "#9AA0A6", sku: "MV-SWEAT-GRY-M", price: 1999.00, stock: 25 },
        { size: "L", colorName: "Heather Melange Grey", colorHex: "#9AA0A6", sku: "MV-SWEAT-GRY-L", price: 1999.00, stock: 22 },
        { size: "XL", colorName: "Heather Melange Grey", colorHex: "#9AA0A6", sku: "MV-SWEAT-GRY-XL", price: 1999.00, stock: 10 },
        { size: "M", colorName: "Pine Needle Green", colorHex: "#1B4D3E", sku: "MV-SWEAT-PNE-M", price: 1999.00, stock: 18 },
        { size: "L", colorName: "Pine Needle Green", colorHex: "#1B4D3E", sku: "MV-SWEAT-PNE-L", price: 1999.00, stock: 14 },
      ],
    },
    {
      categoryId: catKnitwear.id,
      name: "Minimalist Full-Zip Fleece Hoodie",
      slug: "minimalist-full-zip-fleece-hoodie",
      description: "Clean aesthetic hoodie with hidden side-seam pockets and double-layered hood without dangling drawstrings.",
      details: "80% Cotton, 20% Polyester fleece. Brushed interior. Two-way antique metal zipper.",
      sizeChart: "S: Chest 41in | M: Chest 43in | L: Chest 45in | XL: Chest 47in",
      basePrice: 2499.00,
      salePrice: null,
      isFeatured: false,
      images: [
        { url: "/images/products/hoodie-black.jpg", altText: "Minimalist Full-Zip Hoodie Black", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "S", colorName: "Jet Black", colorHex: "#0D0D0D", sku: "MV-HOOD-BLK-S", price: 2499.00, stock: 12 },
        { size: "M", colorName: "Jet Black", colorHex: "#0D0D0D", sku: "MV-HOOD-BLK-M", price: 2499.00, stock: 20 },
        { size: "L", colorName: "Jet Black", colorHex: "#0D0D0D", sku: "MV-HOOD-BLK-L", price: 2499.00, stock: 16 },
      ],
    },

    // --- ACCESSORIES ---
    {
      categoryId: catAccessories.id,
      name: "Heavy Canvas Market Tote Bag",
      slug: "heavy-canvas-market-tote-bag",
      description: "Durable 16 oz organic cotton canvas with reinforced box-stitched handles and interior zippered key pocket.",
      details: "100% Organic Cotton Canvas. Capacity: 22L. Dual handle length for shoulder or hand carry.",
      sizeChart: "One Size: 18in W x 15in H x 5in D",
      basePrice: 699.00,
      salePrice: 599.00,
      isFeatured: true,
      images: [
        { url: "/images/products/tote-raw.jpg", altText: "Canvas Market Tote Raw Ecru", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "One Size", colorName: "Raw Ecru", colorHex: "#F5F5DC", sku: "MV-TOTE-ECR-OS", price: 599.00, stock: 50 },
        { size: "One Size", colorName: "Olive Drab", colorHex: "#556B2F", sku: "MV-TOTE-OLV-OS", price: 599.00, stock: 35 },
      ],
    },
    {
      categoryId: catAccessories.id,
      name: "Unstructured Washed Twill Dad Cap",
      slug: "unstructured-washed-twill-dad-cap",
      description: "Low-profile six-panel silhouette with curved brim and self-fabric strap with antique brass buckle.",
      details: "100% Washed Cotton Twill. Embroidered tonal eyelets. Adjustable closure.",
      sizeChart: "One Size (Adjustable: 56-61 cm circumference)",
      basePrice: 799.00,
      salePrice: null,
      isFeatured: false,
      images: [
        { url: "/images/products/cap-navy.jpg", altText: "Washed Twill Cap Navy", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "One Size", colorName: "Washed Navy", colorHex: "#1B263B", sku: "MV-CAP-NVY-OS", price: 799.00, stock: 40 },
        { size: "One Size", colorName: "Faded Sage", colorHex: "#8A9A86", sku: "MV-CAP-SGE-OS", price: 799.00, stock: 30 },
      ],
    },
  ];

  let totalVariantsCreated = 0;

  for (const item of productsData) {
    const product = await prisma.product.create({
      data: {
        categoryId: item.categoryId,
        name: item.name,
        slug: item.slug,
        description: item.description,
        details: item.details,
        sizeChart: item.sizeChart,
        basePrice: item.basePrice,
        salePrice: item.salePrice,
        isFeatured: item.isFeatured,
      },
    });

    for (const img of item.images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        },
      });
    }

    for (const v of item.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          price: v.price,
          stock: v.stock,
        },
      });

      await prisma.inventoryLog.create({
        data: {
          variantId: variant.id,
          quantity: v.stock,
          reason: "RESTOCK",
          notes: "Initial inventory seed for M2 milestone",
        },
      });

      totalVariantsCreated++;
    }
  }

  // 5. Create a sample Cart and Sample Order to verify complete relational schema
  console.log("Creating verified sample Cart and Order transactions...");
  const sampleVariant = await prisma.productVariant.findFirst({
    where: { sku: "MV-TEE-BLK-M" },
  });

  if (sampleVariant) {
    // Sample Cart
    const cart = await prisma.cart.create({
      data: {
        userId: customer.id,
      },
    });

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: sampleVariant.id,
        quantity: 2,
      },
    });

    // Sample Order
    const order = await prisma.order.create({
      data: {
        orderNumber: "MV-2026-0001",
        userId: customer.id,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        subtotal: 1598.00,
        discountTotal: 0.00,
        shippingFee: 0.00,
        grandTotal: 1598.00,
        shippingAddress: {
          fullName: "Rahul Sharma",
          phone: "+91 91234 56789",
          street: "Flat 402, Green Glen Layout, Bellandur",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560103",
          country: "India",
        },
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        variantId: sampleVariant.id,
        productName: "Organic Heavyweight Classic Crew Tee",
        sku: sampleVariant.sku,
        size: sampleVariant.size,
        color: sampleVariant.colorName,
        unitPrice: sampleVariant.price,
        quantity: 2,
        subtotal: 1598.00,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: "order_test_demo_001",
        razorpayPaymentId: "pay_test_demo_001",
        razorpaySignature: "sig_verified_mock_test_hash",
        method: "UPI_INTENT",
        amount: 1598.00,
        status: "PAID",
      },
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log(`- Categories created: 5`);
  console.log(`- Products created: ${productsData.length}`);
  console.log(`- Variants created: ${totalVariantsCreated}`);
  console.log(`- Sample Users, Carts & Orders verified.`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
