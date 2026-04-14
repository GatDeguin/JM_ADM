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

## Deploy a GitHub Pages

### Prerequisites
- In GitHub, go to **Settings → Pages** and set **Source = GitHub Actions**.
- Use a workflow that builds the `apps/web` app and publishes the generated static output.
- Ensure `GITHUB_PAGES=true` is present in the deploy job when publishing a **project page**.

### Target branch
- Recommended target branch for published artifacts: `gh-pages` (created/managed by the GitHub Pages action).
- Keep your source code in your normal development branch (`main`, `master`, etc.) and let the workflow publish only static files to `gh-pages`.

### `basePath` and `assetPrefix` behavior
`apps/web/next.config.js` configures static export (`output: "export"`) and computes routing based on CI env vars:

- **Project page** (`https://<owner>.github.io/<repo>`):
  - Condition: `GITHUB_PAGES=true` and `GITHUB_REPOSITORY=<owner>/<repo>`.
  - `basePath` becomes `/<repo>`.
  - `assetPrefix` becomes `/<repo>/`.
- **User/organization page** (`https://<owner>.github.io`):
  - Without `GITHUB_PAGES=true` (or without repo name), `basePath=""` and `assetPrefix=""`.
  - The app is served from root (`/`).

### Expected final URL
- **Project page**: `https://<owner>.github.io/<repo>/`
- **User page**: `https://<owner>.github.io/`

### Switch between project page and user page
- **To deploy as project page**:
  1. Keep repository name as target path segment.
  2. In CI deploy job, set `GITHUB_PAGES=true`.
  3. Ensure `GITHUB_REPOSITORY` is available (GitHub Actions provides it automatically).
- **To deploy as user/organization page**:
  1. Use the special repository name (`<owner>.github.io`) in your account/org.
  2. Do **not** set `GITHUB_PAGES=true` in deploy job.
  3. Publish from root path with empty prefix/path.

### Troubleshooting
- **404 on routes after deploy**:
  - Usually caused by incorrect `basePath` for the selected mode.
  - Confirm whether you are deploying to `/<repo>` (project page) or `/` (user page), then verify `GITHUB_PAGES` and repository name in CI.
- **Broken CSS/JS/images (assets not loading)**:
  - Usually caused by wrong `assetPrefix`.
  - For project pages, verify generated asset URLs include `/<repo>/...`.
  - For user pages, verify URLs are root-based (`/...`) and not prefixed with repo name.
