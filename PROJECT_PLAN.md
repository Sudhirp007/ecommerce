# PROJECT PLAN: MorningVeg Apparel E-Commerce

**Owner:** Product Owner  
**Technical PM & Architect:** CODVIAN (ChatGPT)  
**Implementation Engineer:** Gemini Antigravity  

---

## 1. Project Objectives
Deliver a secure, high-conversion, responsive e-commerce platform for MorningVeg Apparel.
- **Stage 1 (PoC & Pilot):** Hosted on staging hardware (Android/Termux via Cloudflare Tunnel) with test payments, proving end-to-end functionality.
- **Stage 2 (Production):** Migrated to managed Linux cloud hosting (VPS / Vercel), live Neon PostgreSQL, Cloudflare R2 object storage, and production Razorpay payments.

---

## 2. Milestone Roadmap

| Milestone | Scope & Deliverables | Quality & Verification Gate | Status |
|---|---|---|---|
| **M0** | **Discovery & Feasibility Audit**<br>Audit local machine, Android phone, Git, DNS, and hosting feasibility. | Handover report reviewed and approved by CODVIAN & PO. | ✅ Complete |
| **M1** | **Architecture & Foundation**<br>Scaffold Next.js 16, TypeScript, Tailwind CSS, Prisma 7, `@prisma/adapter-neon`, GitHub repository, and core documentation. | `npm run build` passes with 0 errors; `/api/health` returns live database status. | ✅ Complete |
| **M2** | **Apparel Data Modeling & Schema**<br>Categories, Products, Images, Color/Size Variants, SKU, Inventory, Price snapshots, Seed data. | Migration scripts run; seed script populates 20+ test apparel items; relations tested. | ✅ Complete |
| **M3** | **Storefront & Catalog Browsing**<br>Homepage hero, category filters, size/color selectors, product details, dynamic search. | Responsive on mobile/desktop; Lighthouse score > 90; WCAG accessibility checks. | ✅ Complete |
| **M4** | **Customer Accounts & Security**<br>Auth.js v5 / JWT Credentials provider, pure JS bcryptjs hashing, stateless session JWT, address book. | Route protection (`/account/*`), Zod input validation, automated auth test suite passing. | ✅ Complete |
| **M5** | **Cart & Checkout Architecture**<br>Client/server sync, server-side price recalculation, stock reservation locks. | Client price manipulation blocked; out-of-stock validation verified. | 🔲 Next |
| **M6** | **Payment Gateway Integration**<br>Razorpay Standard Checkout (UPI Intent, Dynamic QR, NetBanking, Cards) in Test Mode. | Signature verification passes; webhook handles payment confirmation idempotently. | 🔲 Planned |
| **M7** | **Admin Dashboard**<br>Product CRUD, inventory adjustments, order management, customer overview. | Role-based authorization (`ADMIN` only); audited database mutations. | 🔲 Planned |
| **M8** | **Order Lifecycle & Tracking**<br>Order states (`PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`). | State machine guards against invalid transitions; automated tracking updates. | 🔲 Planned |
| **M9** | **Testing & QA Suite**<br>Vitest unit/integration tests, Playwright end-to-end checkout automation, security scan. | 100% critical checkout path coverage; 0 security vulnerabilities. | 🔲 Planned |
| **M10** | **Staging PoC Deployment**<br>Termux Node process, Cloudflare Tunnel ingress to `morningveg.com`, background daemon persistence. | Public HTTPS URL live; zero local port exposure; automated recovery on phone sleep. | 🔲 Planned |
| **M11** | **Pilot Evaluation & User Testing**<br>Controlled user testing, sandbox payment validation, telemetry collection. | User feedback reviewed with CODVIAN; bugfixes merged. | 🔲 Planned |
| **M12** | **Production Migration & Live Launch**<br>Transition to managed cloud host, object storage for media, live Razorpay activation. | Written Owner authorization for live payments; DNS cutover to production host. | 🔲 Planned |

---

## 3. Implementation Rules for Milestones
1. **Never skip milestone gates:** No milestone starts until the preceding milestone's deliverables are verified and approved.
2. **Four-Retry Circuit Breaker:** If any implementation task cannot be completed within 4 retries, the agent stops, logs the blocker with full error traces, and proposes a viable workaround to CODVIAN.
3. **Continuous Handover Updating:** `PROJECT_HANDOVER.md` must be updated at the conclusion of every milestone.
