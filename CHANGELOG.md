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
