# PROJECT_HANDOVER.md — MorningVeg Apparel E-commerce

> **This is the shared source of truth** between the Product Owner, CODVIAN (PM/Architect/QA), and the implementation agent (Gemini Antigravity).
> Read this BEFORE starting any task. Update it AFTER completing a task. Record all important decisions here, never only in chat.

---

## 1. Project Identity

| Field | Value |
|---|---|
| Project name | MorningVeg Apparel E-commerce |
| Business | Online clothing and apparel store |
| Domain | https://morningveg.com/ |
| GitHub repository | https://github.com/Sudhirp007/ecommerce.git |
| Local project root | `C:\Users\DELL\Downloads\ecommerce` |
| Current phase | **M3 — Storefront & Catalog Browsing: COMPLETE & VERIFIED** |
| Primary goal | PoC + controlled pilot, then migrate to managed production hosting |

---

## 2. Current Status Summary

- **M0 (Discovery & feasibility): COMPLETE / APPROVED.**
- **M1 (Architecture & Foundation): COMPLETE / VERIFIED:**
  - Next.js App Router, TypeScript, Tailwind CSS scaffolded.
  - Neon Lakebase PostgreSQL integration completed and verified live with server-side queries.
  - Approved ORM restored: Prisma 7.10 + @prisma/adapter-neon (PrismaNeonHttp) configured, generated, and verified with live Neon queries and table sync.
  - Production build (`npm run build`) passed cleanly with zero errors.
  - Production server started and tested end-to-end (`/api/health` and `/` storefront verified).
  - Android Device (Realme Narzo / Termux) successfully bridged via SSH (`u0_a317@192.168.1.14:8022`) with passwordless key authentication.
  - Git initialized with `main` branch and linked to remote `https://github.com/Sudhirp007/ecommerce.git`.
  - Sensitive files (`.env`, `.env.local`, `.neon`) safely excluded via `.gitignore`.
- **M2 (Database Design & Apparel Schema): COMPLETE / VERIFIED:**
  - Complete relational schema pushed to Neon PostgreSQL: `categories`, `products`, `product_images`, `product_variants`, `inventory_logs`, `users`, `addresses`, `carts`, `cart_items`, `orders`, `order_items`, `payments`.
  - Realistic apparel catalog seed script (`prisma/seed.ts`) executed: 5 categories, 10 products, 48 unique size/color variants with individual SKUs and stock, sample users, cart, and verified order.
  - Type-safe catalog domain service (`src/lib/catalog.ts`) and REST API (`/api/catalog/products`) implemented.
  - Storefront homepage (`src/app/page.tsx`) updated to render live catalog data directly from Neon PostgreSQL.
- **M3 (Storefront & Catalog Browsing): COMPLETE / VERIFIED:**
  - Client-side Cart state and localStorage persistence implemented in `src/context/CartContext.tsx` with dynamic item counters, subtotal, and ₹999 free-shipping progress tracker.
  - Slide-over `CartDrawer.tsx` component with live quantity adjustments (+/-), item removal, and subtotal calculation.
  - Responsive `Header.tsx` with brand logo, category navigation, real-time search form, and bag badge counter.
  - Reusable `ProductCard.tsx` with color swatches, size badges, discount pill, low-stock warning, and direct PDP links.
  - Interactive PDP client component `ProductDetailClient.tsx` featuring dynamic color swatch selection, dynamic size buttons disabled on out-of-stock variants, interactive Size Chart measurement modal (Inches/CM), quantity counter, and Add to Bag with automatic drawer slide-out.
  - Dynamic PDP route `src/app/product/[slug]/page.tsx` with server-rendered SEO metadata, schema tags, and product lookups.
  - Dynamic category browsing route `src/app/category/[slug]/page.tsx` with size query filtering (`?size=M`), price sorting (`?sort=price-low` / `?sort=price-high`), and breadcrumb navigation.
  - Keyword search page `src/app/search/page.tsx` querying live products and variants matching search queries.
  - `npm run build` executed successfully (7.7s compilation, zero TypeScript errors).
  - Production server (`next start`) executed and all endpoints verified live (`/api/health`, `/category/t-shirts`, `/category/t-shirts?size=M&sort=price-low`, `/product/organic-heavyweight-classic-crew-tee`, `/search?q=linen`, `/`).
- **Next milestone: M4 — Customer Accounts & Authentication** (Credentials auth, session management, user profile, address book, role-based guardrails).

---

## 3. Environment & Hardware Status (Verified)

| Environment | Host Details | Status |
|---|---|---|
| **Development Machine** | Windows 11 Pro x64 (Intel i5-8350U, Node v22.23.2, npm 10.9.8, Git 2.55.0) | **Active & Verified** |
| **Database** | Neon Serverless PostgreSQL 18.6 (`neondb`, AWS `ap-southeast-1`) | **Active & Verified** |
| **Android Device** | Realme Narzo, Android 14 (Kernel 4.19, aarch64, 89 GB available space) | **Connected via SSH (Port 8022)** |
| **Local Git Status** | Initialized, `main` branch, linked to GitHub remote | **Configured** |

### Important note on environment
- The **actual** dev machine is a **Windows desktop**, not the Android phone. The phone (Realme Narzo, Android 14, 8GB + 4GB extended RAM) is the *intended PoC hosting* device.
- All tooling (Node 22, npm, Git, x64) is fully compatible with the full Next.js/Prisma/Postgres stack **on this Windows machine**.
- **Decision (recorded):** Develop on the Windows machine. For PoC hosting, verify Termux feasibility before committing to running services on the phone (see §10 risks). Keep all code Android-path-independent so it migrates cleanly.

---

## 4. Approved Architecture

- **Modular monolith** — Next.js (App Router) single application: React frontend + server-side API routes + shared services.
- **No microservices** unless a real need emerges.
- **Data flow:** Browser → Cloudflare Tunnel (PoC public access) → Next.js API → PostgreSQL (managed) → Razorpay (test mode).
- App code must be portable to any standard Linux/Node host.

```
[ Browser ] ──HTTPS──▶ [ Cloudflare Tunnel ] ──▶ [ Next.js App (Node 22) ]
                                              │
                                              ├─▶ API Routes (server-side)
                                              │       ├─ Auth (Auth.js / Credentials)
                                              │       ├─ Catalog (products, variants, images)
                                              │       ├─ Cart / Orders
                                              │       └─ Payments (Razorpay, test mode)
                                              │
                                              └─▶ PostgreSQL (managed — Neon)
                                              └─▶ Object storage (local in dev; S3/R2 later)
```

---

## 5. Technology Stack (preferred candidates — to be finalized)

| Layer | Choice | Status |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | ✅ Active & Verified |
| Styling | Tailwind CSS v4 | ✅ Active & Verified |
| ORM | Prisma 7.10 + @prisma/adapter-neon (PrismaNeonHttp) | ✅ Approved & Verified |
| Database | Neon Serverless PostgreSQL 18.6 (Lakebase) | ✅ Active & Verified |
| Auth | Auth.js v5 (Credentials, JWT sessions), bcrypt/argon2 hashing | Candidate (M4) |
| Payments | Razorpay (TEST mode first), UPI Intent/QR, signature+webhook verification | Candidate (M6) |
| Images | Local `public/` for dev; object storage later | Candidate |
| Admin | Route group `/admin` with server-side role guards | Candidate (M7) |
| Testing | Vitest (unit/integration) + Playwright (E2E) | Candidate (M9) |
| CI/CD | Git + GitHub | ✅ Active (SSH) |

---

## 5.1 Prisma + Neon Driver Adapter Architecture (Canonical Pattern)

To resolve both **Android Bionic libc binary incompatibility** (Prisma has no prebuilt C++ engine for native Android ARM64) and **Neon cold-start latency**, the project adopts Prisma 7 with the Neon HTTP driver adapter.

### Architecture Mechanics
1. **Migration & CLI Phase (Windows Workstation):**
   - Schema defined in `prisma/schema.prisma`.
   - Migration connection managed via `prisma.config.ts`.
   - Run `npx prisma migrate dev` or `npx prisma db push` on Windows against the live Neon database.
   - Runs native C++ engines during build/migration time only on Windows.
2. **Runtime Execution Phase (App Router / Android Phone):**
   - `PrismaClient` executes queries through `PrismaNeonHttp` over HTTPS.
   - **Zero Rust/C++ binary engine needed at runtime.** The application runs seamlessly inside Termux on Android without missing binary engine crashes.

### Full Implementation Example

#### 1. `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model SystemStatus {
  id        String   @id @default(cuid())
  service   String
  status    String
  timestamp DateTime @default(now())

  @@map("system_status")
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]

  @@map("categories")
}

model Product {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  description String?
  basePrice   Decimal          @db.Decimal(10, 2)
  categoryId  String
  category    Category         @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  variants    ProductVariant[]

  @@map("products")
}

model ProductVariant {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku       String   @unique
  size      String
  color     String
  price     Decimal  @db.Decimal(10, 2)
  stock     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("product_variants")
}
```

#### 2. `prisma.config.ts` (Prisma 7 Configuration)
```typescript
import { defineConfig, env } from "@prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

#### 3. Client Instantiation (`src/lib/db.ts`)
```typescript
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// PrismaNeonHttp passes queries over Neon's lightweight HTTP pipeline
const adapter = new PrismaNeonHttp(databaseUrl, {});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

#### 4. Type-Safe Query Example
```typescript
import { prisma } from "@/lib/db";

// Fetch category with variants and calculated stock
export async function getProductWithVariants(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        where: { stock: { gt: 0 } },
        orderBy: { size: "asc" },
      },
    },
  });
}
```

---

## 6. Database Design Plan (M2 preview)

Planned entities (design in M2, not yet built):
- `User`, `Role`, `CustomerProfile`, `Address`
- `Category`, `Product`, `ProductImage`, `ProductVariant` (size+colour, SKU), `ProductInventory`
- `Cart`, `CartItem`
- `Order`, `OrderItem` (snapshot price/variant at purchase), `Shipment`
- `Payment`, `PaymentEvent`, `Refund`
- `AuditLog`

Principles: order items preserve price-at-time-of-purchase; inventory changes and order creation in transactions; indexes on FKs and search fields.

---

## 7. Milestone Roadmap

| Milestone | Description | Status |
|---|---|---|
| M0 | Discovery & feasibility | ✅ Approved |
| M1 | Architecture + project foundation (scaffold, git, docs, env, Neon DB) | ✅ Complete |
| M2 | Database design (Prisma schema, 48 variants, seed script) | ✅ Complete |
| M3 | Storefront (home, catalog, product pages, search/filter/sort) | ✅ Complete |
| M4 | Customer accounts (register/login/session/profile/addresses) | 🔲 Next |
| M5 | Cart & checkout (server-side price/stock validation) | 🔲 Planned |
| M6 | Payments (Razorpay test mode, webhooks, refunds) | 🔲 Planned |
| M7 | Admin dashboard (products, categories, variants, inventory, orders, customers) | 🔲 Planned |
| M8 | Order lifecycle (status transitions, tracking, cancellation) | 🔲 Planned |
| M9 | QA (unit/integration/E2E, security, load) | 🔲 Planned |
| M10 | Android PoC deployment (Termux startup, Cloudflare Tunnel, HTTPS) | 🔲 Planned |
| M11 | Pilot & evaluation (sample users, sandbox payments, feedback) | 🔲 Planned |
| M12 | Production migration (managed host, managed PG, object storage, live payments) | 🔲 Planned |

---

## 8. Security & Payment Rules (binding)

- Never expose secrets in frontend code; never commit `.env`/credentials.
- Appropriate password hashing; server-side authorization on every admin action.
- Validate all input; recalculate all prices/totals on the server.
- Database transactions for order + inventory changes; prevent duplicate order/payment processing.
- Verify Razorpay signatures and webhooks; **never trust browser redirects** as payment proof.
- Never store UPI PINs or card credentials. Do not implement deprecated UPI Collect.
- **Payment sandbox (test) mode only** until product owner explicitly approves live processing.
- No destructive DB commands without explicit permission.

---

## 9. External Services & Cost Baselines (initial)

| Service | Purpose | Approx. cost (start) |
|---|---|---|
| Neon | Managed PostgreSQL (free tier) | $0 |
| Cloudflare Tunnel | Public HTTPS access to PoC | $0 |
| Razorpay | Payments (test mode) | $0 |
| GitHub | Private repo + CI | $0 |
| Vercel / VPS | Production hosting (later) | $0–$6/mo |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Android/Termux can't reliably host Postgres or keep long-running Node process alive | Develop on Windows; prefer managed PG; verify Termux before PoC; keep code portable |
| Live payment abuse | Test mode only until explicit owner approval; server-side validation and signature checks |
| Price/variant manipulation | Server-side recalculation; never trust client values |
| Scope creep | Milestone gates; product-owner approval per milestone |
| Migration friction | No Android-specific paths in code; env-driven config |

---

## 11. Decisions Requiring Product-Owner Approval

- [ ] Final dev-hosting strategy (Windows dev confirmed; confirm PoC hosting = Termux phone vs. temporary VPS).
- [ ] Confirm managed PostgreSQL (Neon) for dev vs. local Docker Postgres.
- [ ] The apparel business rules (categories, sizes, shipping, returns) — confirm before finalizing M2 schema.
- [ ] Any budget/paid service activation.

---

## 12. Milestone Status & Next Actions

### Completed in M1 (Verified):
1. ✅ Handover read and synchronized.
2. ✅ Inspected GitHub repo and initialized local Git repository on `main`.
3. ✅ Scaffolded Next.js 16 (App Router) with TypeScript and Tailwind CSS v4 in `C:\Users\DELL\Downloads\ecommerce`.
4. ✅ Core dependencies installed (`prisma`, `@prisma/client`, `@prisma/adapter-neon`, `zod`, `tailwindcss`).
5. ✅ Initial commit created and pushed to GitHub remote (`git@github.com:Sudhirp007/ecommerce.git`).
6. ✅ Environment templates created (`.env.example`, local `.env.local` and `.env` secured by `.gitignore`).
7. ✅ Core project documentation suite created (`README.md`, `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DATABASE_DESIGN.md`, `CHANGELOG.md`, `GEMINI.md`).
8. ✅ Production build (`npm run build`) and live endpoint (`/api/health`) verified with actual output.
9. ✅ Handover updated with complete architecture examples.

### Completed in M2 (Verified):
1. ✅ Complete relational apparel schema pushed to Neon PostgreSQL (12 models).
2. ✅ Seed script (`prisma/seed.ts`) populating 5 categories, 10 products, 48 variants with unique SKUs, stock levels, and audit logs.
3. ✅ Catalog query service (`src/lib/catalog.ts`) and `/api/catalog/products` endpoint verified.

### Completed in M3 (Verified):
1. ✅ Installed `lucide-react` for clean apparel UI icons.
2. ✅ Implemented `CartContext.tsx` with localStorage persistence and free shipping threshold meter.
3. ✅ Implemented slide-out `CartDrawer.tsx` with dynamic quantity updates and item removal.
4. ✅ Implemented global responsive `Header.tsx` with search input and live bag badge.
5. ✅ Created reusable `ProductCard.tsx` with color swatches, size availability, discount badge, and stock alerts.
6. ✅ Built interactive PDP `ProductDetailClient.tsx` with color swatch switcher, stock-aware size selector, interactive Size Guide modal, and Add to Bag.
7. ✅ Built dynamic server routes: `/product/[slug]`, `/category/[slug]` (with filter/sort queries), `/search?q=...`.
8. ✅ Verified `npm run build` compilation (Turbopack, TypeScript checks, zero errors).
9. ✅ Verified production runtime via `curl` against all M3 routes with HTTP 200 responses.

### Next Actions: M4 — Customer Accounts & Authentication (Ready to Begin)
- Configure lightweight authentication (Credentials / Password hashing with bcrypt).
- User registration and login pages (`/login`, `/register`).
- Secure JWT / Session management.
- User profile and address book management (`/account`, `/account/addresses`).
- Server-side route protection & role guard middleware (`CUSTOMER` vs `ADMIN`).

---

## 13. Handover Rules

1. Gemini reads the latest handover before starting a task.
2. CODVIAN reviews using the latest handover + real evidence.
3. Gemini updates the handover after completing a task.
4. Never silently overwrite an approved decision — flag discrepancies.
5. Never put secrets in the handover.
6. Use Git commits to preserve traceable history.
