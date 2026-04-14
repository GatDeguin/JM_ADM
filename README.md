# JM ADM Hair Cosmetics Platform

Monorepo full-stack (pnpm workspaces) for an integrated operations platform for a hair cosmetics company.

## Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind, TanStack Query, React Hook Form, Zod
- Backend: NestJS + TypeScript (modular monolith)
- DB: PostgreSQL + Prisma
- Jobs: Redis + BullMQ
- Storage: MinIO (S3 compatible)
- Tests: Vitest + Playwright
- Infra: Docker Compose

## Quick start
```bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Docker
```bash
docker compose up --build
```

## Demo users
- admin@demo.local / demo1234
- direccion@demo.local / demo1234
- produccion@demo.local / demo1234
- comercial@demo.local / demo1234
- finanzas@demo.local / demo1234

## Scripts
- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm db:reset`
- `pnpm import:demo`

## Modules
auth, users, roles_permissions, masters, catalog, formulas, production, packaging, quality, inventory, purchasing, expenses, customers, pricing, sales, receivables, payables_treasury, costing, reporting, imports, audit.
