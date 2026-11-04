# CHANGELOG: MorningVeg Apparel E-Commerce

All notable changes, architectural milestones, and verification events are recorded in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-11-04

### Added
- **Milestone 0: Discovery & Feasibility Completed**
  - Audited development environment: Windows 11 Pro (x64), Node.js v22.23.2, npm 10.9.8, Git 2.55.0.
  - Audited target staging device: Realme Narzo (Android 14, aarch64, 89 GB available storage).
  - Established passwordless SSH bridge to Android Termux on port 8022.
  - Audited domain `morningveg.com` (currently on Hostinger; approved to be replaced via Cloudflare Tunnel).
- **Milestone 2: Apparel Data Modeling & Seed Completed**
  - Expanded `prisma/schema.prisma` with 12 apparel and commerce entities: `Category`, `Product`, `ProductImage`, `ProductVariant`, `InventoryLog`, `User`, `Address`, `Cart`, `CartItem`, `Order`, `OrderItem`, and `Payment`.
  - Added unique SKU constraints, size/color variant combinations, stock thresholds, and purchase price snapshots.
  - Successfully synced schema to Neon PostgreSQL via `npx prisma db push`.
  - Developed and executed realistic seed script (`prisma/seed.ts`): seeded 5 apparel categories, 10 products, 48 size/color variants with individual inventory logs, sample customer, and sample order.
  - Built typed catalog query library `src/lib/catalog.ts` and REST endpoint `/api/catalog/products`.
- **Milestone 4: Customer Accounts & Authentication Completed**
  - Integrated pure JS `bcryptjs` and `jose` for zero-native-addon portability on Windows, Linux, and Android Termux Bionic libc.
  - Implemented stateless session architecture in `src/lib/auth.ts` with HTTP-only 7-day `auth-token` cookies.
  - Developed customer registration endpoint `/api/auth/register` with Zod validation, bcrypt password hashing, and auto-provisioned user cart.
  - Developed login endpoint `/api/auth/login` and session profile endpoint `/api/auth/me`.
  - Implemented delivery address management API: `/api/account/addresses` and `/api/account/addresses/[id]` with default shipping/billing management.
  - Built edge-compatible route guard `src/middleware.ts` safeguarding `/account/*` and `/admin/*`.
  - Built customer UI pages: `/login` (with React Suspense), `/register`, customer overview `/account`, and address manager `/account/addresses`.
  - Integrated `AuthContext.tsx` with responsive `Header.tsx` displaying logged-in member avatar and links.
  - Developed and verified automated test suite `scripts/test-auth-api.js` testing 7 end-to-end authentication scenarios.
- **Milestone 3: Storefront & Catalog Browsing Completed**
  - Installed `lucide-react` for modern e-commerce iconography.
  - Built `CartContext.tsx` providing client-side shopping bag state, localStorage persistence, and ₹999 free delivery threshold meter.
  - Built slide-out `CartDrawer.tsx` allowing instant quantity updates (+/-), item removal, and subtotal calculation.
  - Built responsive `Header.tsx` featuring brand typography, navigation links, instant search input, and dynamic cart badge.
  - Created `ProductCard.tsx` showcasing images, pricing, discount percentage, color swatches, size availability, and low-stock alerts.
  - Created interactive PDP component `ProductDetailClient.tsx` featuring dynamic color selector, stock-dependent size selection, interactive Size Chart modal, quantity counter, and Add to Bag with drawer trigger.
  - Built dynamic product route `src/app/product/[slug]/page.tsx` with server-rendered metadata and structured product data.
  - Built category route `src/app/category/[slug]/page.tsx` with size query filtering (`?size=M`) and price sorting (`?sort=price-low` / `?sort=price-high`).
  - Built search route `src/app/search/page.tsx` with live query matching.
  - Verified `npm run build` compilation (Turbopack, TypeScript checks, zero errors).
  - Verified production server runtime with curl requests returning HTTP 200 across all catalog and PDP endpoints.
- **Milestone 1: Project Foundation & Database Architecture Completed**
  - Initialized Git repository on `main` branch, linked to `git@github.com:Sudhirp007/ecommerce.git`.
  - Installed and configured Next.js 16 (App Router), TypeScript, Tailwind CSS v4.
  - Provisioned Neon Lakebase Serverless PostgreSQL 18.6 project `square-leaf-67144225` on branch `production`.
  - Re-aligned ORM to approved plan: Installed Prisma 7.10 with `@prisma/adapter-neon` (`PrismaNeonHttp`).
  - Configured `prisma.config.ts` and `prisma/schema.prisma` with initial foundational models (`SystemStatus`, `Category`, `Product`, `ProductVariant`).
  - Synced database tables using `npx prisma db push`.
  - Verified live database operations via `scripts/test-prisma.js` (create and count operations).
  - Implemented `/api/health` diagnostic endpoint returning live database telemetry.
  - Created initial responsive storefront homepage with live SSR database sync indicator.
  - Verified production build (`npm run build`) passing with zero errors.
  - Added comprehensive documentation: `README.md`, `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DATABASE_DESIGN.md`, `GEMINI.md`, `PROJECT_HANDOVER.md`.
