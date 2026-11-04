# MorningVeg Apparel E-Commerce

MorningVeg Apparel is a modern, high-performance online clothing and apparel store delivering sustainable, tailored everyday clothing across India.

- **Production Domain:** [https://morningveg.com/](https://morningveg.com/)
- **Repository:** [https://github.com/Sudhirp007/ecommerce.git](https://github.com/Sudhirp007/ecommerce.git)
- **Status:** Milestone 1 (Foundation & Database) Completed. Moving into Milestone 2 (Data Modeling).

---

## Technical Stack

| Component | Technology | Description |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server-rendered React storefront, Server Actions, API routes |
| **Language** | TypeScript (Strict) | End-to-end type safety for catalog, cart, and payment flows |
| **Styling** | Tailwind CSS v4 | Lightweight styling with zero runtime CSS overhead |
| **ORM** | Prisma 7.10 | Schema-driven migrations and type generation |
| **Database Adapter** | `@prisma/adapter-neon` | `PrismaNeonHttp` adapter (serverless cold-start elimination) |
| **Database** | Neon PostgreSQL 18.6 | Managed serverless Lakebase Postgres with connection pooling |
| **Validation** | Zod | Server-side and client-side input validation |
| **Public Ingress** | Cloudflare Tunnel | Secure HTTPS edge routing without opening router ports |

---

## Project Structure

```text
ecommerce/
├── .agents/skills/        # Neon and Antigravity workflow skills
├── prisma/
│   └── schema.prisma      # Declarative database schema
├── prisma.config.ts       # Prisma 7 CLI & migration configuration
├── scripts/
│   ├── test-db.js         # Direct Neon connection tester
│   └── test-prisma.js     # Prisma ORM CRUD verification script
├── src/
│   ├── app/
│   │   ├── api/health/    # Live database & system status health check
│   │   ├── globals.css    # Tailwind CSS imports and global styles
│   │   ├── layout.tsx     # Root storefront layout and navigation
│   │   └── page.tsx       # Apparel catalog storefront homepage
│   └── lib/
│       └── db.ts          # Canonical PrismaClient singleton
├── ARCHITECTURE.md        # Detailed system architecture document
├── DATABASE_DESIGN.md     # Relational database entity schema plan
├── GEMINI.md              # Persistent Antigravity coding & architectural rules
├── PROJECT_HANDOVER.md    # Shared project ledger between PO, PM, and Agent
├── PROJECT_PLAN.md        # Comprehensive milestone roadmap and acceptance criteria
└── CHANGELOG.md           # Versioned milestone change history
```

---

## Getting Started

### Prerequisites
- Node.js `v22.x` or higher
- npm `v10.x` or higher
- Git

### Installation
1. Clone the repository:
   ```bash
   git clone git@github.com:Sudhirp007/ecommerce.git
   cd ecommerce
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and add your database URL:
   ```bash
   cp .env.example .env.local
   ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the storefront.

6. Build for production:
   ```bash
   npm run build
   npm run start
   ```

---

## Quality & Verification
- Test database connectivity:
  ```bash
  npm run test:db
  ```
- Verify health check endpoint:
  ```bash
  curl http://localhost:3000/api/health
  ```
