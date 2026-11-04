# ARCHITECTURE SPECIFICATION: MorningVeg Apparel E-Commerce

## 1. System Philosophy: Modular Monolith
The application is designed as a **Modular Monolith** using the Next.js 16 App Router. This avoids the operational complexity, network latency, and infrastructure overhead of microservices while providing clean separation of concerns.

```text
[ Web & Mobile Browsers ]
          │
      HTTPS (TLS 1.3)
          ▼
[ Cloudflare Edge / Tunnel ]
          │
    Encrypted Ingress
          ▼
┌─────────────────────────────────────────────────────────────┐
│ Next.js 16 Application Runtime (Node.js 22 LTS)             │
│                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │ Storefront Pages (RSC)   │  │ Admin Dashboard (/admin) │  │
│  │ - Catalog Browsing      │  │ - Product Management     │  │
│  │ - Cart & Checkout       │  │ - Inventory & Orders     │  │
│  └───────────┬─────────────┘  └────────────┬─────────────┘  │
│              │                             │                │
│              ▼                             ▼                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Server Actions & API Routes                           │  │
│  │ - Zod Validation Layer                                │  │
│  │ - Auth Guards (Auth.js v5 Session Verification)       │  │
│  │ - Payment Handlers (Razorpay Signature + Webhooks)    │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Domain Service Layer                                  │  │
│  │ - Pricing & Cart Calculation Engine                   │  │
│  │ - Stock Reservation & Inventory Transactions          │  │
│  │ - Order State Machine                                 │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Data Access Layer (Prisma 7.10)                       │  │
│  │ - PrismaClient Singleton                              │  │
│  │ - @prisma/adapter-neon (PrismaNeonHttp)               │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │
                       HTTPS / SQL Queries
                               ▼
     ┌───────────────────────────────────────────────────┐
     │ Neon Serverless PostgreSQL 18.6 (Lakebase)        │
     │ - Connection Pooler                               │
     │ - Automated Snapshots & Branching                 │
     │ - Multi-Zone Replication (ap-southeast-1)         │
     └───────────────────────────────────────────────────┘
```

---

## 2. Key Architectural Decisions

### Decision 1: Next.js 16 App Router as Fullstack Framework
- **Reasoning:** Single codebase for React frontend, Server Actions, and REST API endpoints. Eliminates cross-origin CORS issues and keeps deployments atomic.
- **Server-Side Rendering (SSR):** Product catalog pages are rendered server-side with cached database queries, delivering sub-second First Contentful Paint (FCP) and optimal SEO.

### Decision 2: Prisma 7 with `@prisma/adapter-neon` (`PrismaNeonHttp`)
- **Reasoning:** Standard Prisma query engines require platform-specific C++ Rust binaries that are unavailable on Android Bionic libc. By using `PrismaNeonHttp`, queries execute over HTTPS to Neon’s HTTP pipeline.
- **Benefits:** 
  - Zero native binary requirement at app runtime (runs identically on Windows, Linux, and Android).
  - Eliminates TCP socket connection pool latency when Neon serverless compute wakes from idle.
  - Preserves declarative `schema.prisma` modeling and automated migrations.

### Decision 3: Managed Serverless Database (Neon Lakebase Postgres)
- **Reasoning:** Hosting local Postgres on an Android phone introduces severe data corruption risks if the battery dies or Android OS terminates background services. Neon provides enterprise-grade durability, SSL by default, zero hardware maintenance on the host device, and instant cloud branching.

### Decision 4: Cloudflare Tunnel for Ingress
- **Reasoning:** Exposing a development machine or Android phone directly requires public static IPs, port forwarding, and dynamic DNS, creating significant security vulnerabilities. Cloudflare Tunnel creates an outbound encrypted tunnel to Cloudflare Edge with automatic SSL certificate management and DDoS protection.

---

## 5. Security Architecture
1. **Zero Client Trust:** All cart totals, discounts, variant stock, and shipping rates are calculated strictly on the server. The client sends only `variantId` and `quantity`.
2. **Payment Integrity:** Orders are only updated to `PAID` status via verified Razorpay HMAC SHA256 signatures or validated webhook events. Browser redirects are never accepted as payment proof.
3. **Environment Security:** Secrets (`DATABASE_URL`, `RAZORPAY_KEY_SECRET`, `AUTH_SECRET`) exist only in `.env.local` and `.env` (gitignored).
4. **Data Sanitization:** All incoming requests pass through strict Zod schemas before hitting business logic or database layers.
