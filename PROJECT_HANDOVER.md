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
| Current phase | **M1 — Architecture, Scaffolding & Neon Database: COMPLETE & VERIFIED** |
| Primary goal | PoC + controlled pilot, then migrate to managed production hosting |

---

## 2. Current Status Summary

- **M0 (Discovery & feasibility): COMPLETE / APPROVED.**
- **M1 (Architecture & Foundation): COMPLETE / VERIFIED:**
  - Next.js App Router, TypeScript, Tailwind CSS scaffolded.
  - Neon Lakebase PostgreSQL integration completed and verified live with server-side queries.
  - Production build (`npm run build`) passed cleanly with zero errors.
  - Production server started and tested end-to-end (`/api/health` and `/` storefront verified).
  - Android Device (Realme Narzo / Termux) successfully bridged via SSH (`u0_a317@192.168.1.14:8022`) with passwordless key authentication.
  - Git initialized with `main` branch and linked to remote `https://github.com/Sudhirp007/ecommerce.git`.
  - Sensitive files (`.env`, `.env.local`, `.neon`) safely excluded via `.gitignore`.
- **Next milestone: M2 — Database Design & Schema Modeling** (Prisma / relational schema for categories, products, apparel variants, inventory).

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
| Framework | Next.js 15 (App Router) + TypeScript | Candidate |
| Styling | Tailwind CSS | Candidate |
| ORM | Prisma | Candidate |
| Database | PostgreSQL (managed, e.g. Neon) | Candidate — prefer managed over Android-local |
| Auth | Auth.js v5 (Credentials, JWT sessions), bcrypt/argon2 hashing | Candidate |
| Payments | Razorpay (TEST mode first), UPI Intent/QR, signature+webhook verification | Candidate |
| Images | Local `public/` for dev; object storage later | Candidate |
| Admin | Route group `/admin` with server-side role guards | Candidate |
| Testing | Vitest (unit/integration) + Playwright (E2E) | Candidate |
| CI/CD | Git + GitHub | Candidate |

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
| M2 | Database design (Prisma schema, migrations) | 🔲 Planned |
| M3 | Storefront (home, catalog, product pages, search/filter/sort) | 🔲 Planned |
| M4 | Customer accounts (register/login/session/profile/addresses) | 🔲 Planned |
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

## 12. A Next Actions

### For CODVIAN (PM/Architect)
- Prepare detailed **M1 — Project Initialization** instructions for Gemini: scaffold Next.js (TypeScript, Tailwind, App Router, ESLint), Prisma init, git init, `.env`/`.env.example`, `.gitignore`, core docs, README.
- Draft the M1 acceptance criteria and evidence requirements.

### For implementation agent (Gemini Antigravity) — M1 (pending M1 approval)
1. Read this handover first.
2. Inspect the actual GitHub repo state (`git status`, `ls`) before making any recommendation — do not assume it is empty.
3. Scaffold the Next.js app in `C:\Users\DELL\Downloads\ecommerce`.
4. Install core dependencies (prisma, @prisma/client, auth.js, zod, tailwind).
5. Initialize git, create initial commit, push to the GitHub remote.
6. Create `.env` (secrets only here, git-ignored) + `.env.example`.
7. Create `README.md`, `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DATABASE_DESIGN.md` (skeleton), `CHANGELOG.md`.
8. Report: files created/modified, commands run, output, commits, limitations.
9. Update this handover after finishing.

### Pending owner decision before M1
- Approval to start **M1 — Project initialization** (the gate the previous M0 approval does not yet open).

---

## 13. Handover Rules

1. Gemini reads the latest handover before starting a task.
2. CODVIAN reviews using the latest handover + real evidence.
3. Gemini updates the handover after completing a task.
4. Never silently overwrite an approved decision — flag discrepancies.
5. Never put secrets in the handover.
6. Use Git commits to preserve traceable history.
