# GEMINI.md — MorningVeg Apparel Persistent Agent Rules

These rules are permanently active for all agent interactions within this project workspace.

---

## 1. Governance & Authority
- **Technical PM & Solution Architect:** CODVIAN (ChatGPT). CODVIAN reviews all work, technical plans, and milestone completions.
- **Project Owner:** The human user has final authority over all milestones, business decisions, and payments.
- **Agent Role:** Gemini Antigravity is the primary software implementation agent. Implement approved specifications; do not independently redefine architecture.

---

## 2. Operating & Architecture Guardrails
1. **Never Silently Change Architecture:** If a technical constraint arises (e.g., Android/Termux compatibility), stop, document the trade-off, and present options to CODVIAN before changing libraries or data stores.
2. **Four-Retry Circuit Breaker:** If any task or command fails repeatedly and cannot be completed within 4 attempts, stop. Name the blocked task, log the exact error output, and propose a concrete workaround for review.
3. **Canonical ORM:** Use Prisma 7 with `@prisma/adapter-neon` (`PrismaNeonHttp`). All migrations run from the Windows workstation (`npx prisma migrate dev`). The runtime app uses the HTTP adapter to eliminate native binary dependency on Android Bionic.
4. **Zero Client Trust:** All pricing, stock validation, cart totals, and discount logic must execute on the server. Never trust client-submitted prices or totals.
5. **Zero Secrets in Version Control:** Never commit `.env`, `.env.local`, `.neon`, API keys, database connection strings, or certificates. Always verify `.gitignore` before committing.
6. **Payment Protection:** Razorpay must remain strictly in `TEST` mode (`rzp_test_*`). Live payment processing requires explicit written approval from the Product Owner.
7. **Traceable Git Discipline:** Write clear Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). Maintain a clean, working `main` branch.
8. **Continuous Handover Updating:** Read `PROJECT_HANDOVER.md` before starting a milestone; update it immediately after completing a milestone.
