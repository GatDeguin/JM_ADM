# JM ADM — Plataforma Operativa Integral (Cosmética Capilar)

Plataforma full‑stack **mobile‑first** para operación integral de una empresa de cosmética capilar: catálogo, fórmulas, producción por lote, fraccionamiento, stock trazable, compras, ventas, cobranzas/pagos, tesorería, costos, reportes, auditoría e importaciones.

## Cómo ingresar a la app

Si estás viendo esta documentación publicada en GitHub Pages y querés entrar directamente a la aplicación, abrí la ruta:

- **`/inicio`** (ejemplo: `https://<tu-dominio>/inicio`)

Para entorno local:

- Web: `http://localhost:3000/inicio`
- API: `http://localhost:3001`

Usuarios demo disponibles:

- `admin@demo.local` / `demo1234`
- `direccion@demo.local` / `demo1234`
- `produccion@demo.local` / `demo1234`
- `comercial@demo.local` / `demo1234`
- `finanzas@demo.local` / `demo1234`

## Objetivo de producto

Modelar y ejecutar de punta a punta la cadena:

**Insumo → Fórmula → Producto base → Presentación → SKU → Orden de producción → Lote madre → Fraccionamiento → Stock → Venta → Cobranza/Pago → Costo → Reporte**

Incluye soporte nativo de **alias/homologación/merge/pending_homologation** para conservar histórico sin perder el valor original importado.

---

## Stack tecnológico

### Monorepo

- `pnpm` workspaces

### Frontend (apps/web)

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Componentes UI reutilizables internos

### Backend (apps/api)

- NestJS (modular monolith)
- TypeScript
- Arquitectura por capas (presentation/application/domain/infrastructure)
- DTO/validaciones consistentes

### Datos e infraestructura

- PostgreSQL + Prisma
- Redis + BullMQ (colas de importación)
- MinIO (S3 compatible para adjuntos)
- Docker Compose

### Calidad

- Vitest (unit/integration)
- Playwright (E2E web)
- ESLint + Prettier

---

## Arquitectura

### Módulos backend

- `auth`
- `users`
- `roles_permissions`
- `masters`
- `catalog`
- `formulas`
- `production`
- `packaging`
- `quality`
- `inventory`
- `purchasing`
- `expenses`
- `customers`
- `pricing`
- `sales`
- `receivables`
- `payables_treasury`
- `costing`
- `reporting`
- `imports`
- `audit`

### Contrato API consolidado (versionado)

Contrato canónico actual: **`v1`** con prefijo lógico `/api/v1` para todas las rutas operativas nuevas.

Dominios normalizados del contrato objetivo:

- `auth`
- `catalog`
- `production`
- `fractionation`
- `stock`
- `purchasing`
- `commercial`
- `finance`
- `reporting`
- `system`

#### Endpoints v1 incorporados / normalizados

**Finance (`/api/v1/finance`)**

- `POST /adjustments/register`
- `POST /treasury/transfers/register`
- `POST /bank-reconciliation/register`
- `GET /cash-flow?period=YYYY-MM`

**Production (`/api/v1/production`)**

- `POST /:id/register-consumption`
- `POST /:id/reserve-materials`
- `POST /:id/start-batch`
- `POST /:id/close-batch`
- `POST /:id/release-batch`

**Stock (`/api/v1/inventory`)**

- `POST /internal-transfers`
- `POST /transfers/register`

**Quality (`/api/v1/quality`)**

- `POST /qc-records/:id/quality-decision`

**Payables & Treasury (`/api/v1/payables_treasury`)**

- `POST /payments/register`
- `POST /treasury/transfers/register`
- `POST /bank-reconciliations/register`

### Eventos de dominio implementados

- `formula.approved`
- `product.sku.created`
- `purchase.received`
- `production.order.started`
- `production.batch.closed`
- `quality.batch.released`
- `packaging.order.completed`
- `stock.adjusted`
- `sales.order.confirmed`
- `dispatch.completed`
- `receipt.recorded`
- `payment.recorded`
- `month.closed`
- `import.finished`

---

## Estructura del repositorio

```text
.
├─ apps/
│  ├─ api/                  # NestJS API
│  └─ web/                  # Next.js App Router (PWA-ready)
├─ packages/
│  └─ shared/               # tipos y utilidades compartidas
├─ prisma/
│  ├─ schema.prisma         # modelo de datos
│  └─ seed.ts               # datos semilla completos
├─ scripts/
│  └─ import-demo.ts        # importador demo
├─ docker-compose.yml
├─ package.json
└─ README.md
```

---

## Despliegue completo en GitHub

El repo ya incluye dos pipelines para publicar desde GitHub Actions:

1. **Web en GitHub Pages** (`.github/workflows/deploy-pages.yml`)
2. **Bundle full app (API + Web + Prisma + scripts) en Releases** (`.github/workflows/deploy-full-app.yml`)

### 1) Publicar frontend en GitHub Pages

1. Subí el código a la rama `main`, `master` o `work`.
2. En tu repo de GitHub: **Settings → Pages → Source = GitHub Actions**.
3. El workflow `Deploy Pages` compila `apps/web` y publica `apps/web/out`.

### 2) Publicar bundle completo de la app en GitHub Releases

Cada push a `main`/`master`/`work` (o ejecución manual) genera:

- build completo de workspaces (`pnpm build`)
- artefacto `.tar.gz` con API, web, prisma, scripts y archivos raíz
- release automática con tag `deploy-<run_number>`

### 3) Desplegar en servidor desde el release

```bash
tar -xzf jm-adm-full-app-<sha>.tar.gz
cp .env.example .env
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm db:seed
pnpm start
```

> Recomendación: usar `docker compose up --build -d` en producción si querés levantar servicios dependientes (PostgreSQL/Redis/MinIO) en el mismo host.

---

## Variables de entorno

Crear `.env` desde `.env.example`:

```bash
cp .env.example .env
```

Variables típicas:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`
- `STORAGE_ENDPOINT`
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`
- `STORAGE_REGION`
- `STORAGE_FORCE_PATH_STYLE`
- `STORAGE_PUBLIC_BASE_URL`

> Para local con Docker Compose, los defaults de `.env.example` apuntan a `localhost` (host). Dentro de los contenedores, `docker-compose.yml` sobreescribe hosts a `postgres`, `redis` y `minio`.

---

## Levantar entorno local

### Opción 1 — Docker Compose (recomendada)

```bash
cp .env.example .env
docker compose --profile bootstrap up --build bootstrap
docker compose up --build api worker web
```

Flujo recomendado para demo:

1. `bootstrap` espera PostgreSQL/Redis/MinIO y ejecuta el flujo reproducible `pnpm bootstrap:full` (`db:migrate:deploy` + `db:seed` + `import:demo` + `bootstrap-check`).
2. `api` levanta NestJS sin worker BullMQ embebido.
3. `worker` levanta NestJS en modo worker (`APP_ROLE=worker`) para procesar la cola de importaciones.
4. `web` se inicia cuando la API está healthy.

### Opción 2 — Desarrollo local

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

---

## Scripts disponibles

Desde raíz del monorepo:

- `pnpm dev`
- `pnpm dev:web`
- `pnpm dev:api`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm db:migrate`
- `pnpm db:migrate:deploy`
- `pnpm db:seed`
- `pnpm db:reset`
- `pnpm import:demo`
- `pnpm bootstrap:check`
- `pnpm bootstrap:full`

### Bootstrap reproducible (full)

Para reconstruir el dataset de onboarding/demo de punta a punta:

```bash
pnpm bootstrap:full
```

Este comando corre secuencialmente:

1. `pnpm db:migrate:deploy`
2. `pnpm db:seed`
3. `pnpm import:demo`
4. `pnpm bootstrap:check`

`bootstrap:check` valida:

- usuarios demo requeridos,
- catálogo mínimo (familias, variantes, presentaciones),
- alias obligatorios preservando `originalValue`,
- transacciones demo críticas (`OP-2026-0001`, `LOT-BAL-OR-260401`, `OV-2026-0001`, `REC-2026-0001`, `PAG-2026-0001`).

---

## Base de datos y seeds

### Prisma

- Esquema relacional completo con entidades de seguridad, maestros, catálogo, fórmulas, producción, calidad, inventario, compras, comercial, finanzas, analítica e importaciones.

### Seed inteligente

Incluye:

- usuarios demo por rol
- familias, líneas, variantes, unidades y presentaciones
- productos base, SKUs y packaging
- alias/homologaciones (canónico + valor original)
- fórmulas y matrices
- proveedores/clientes/listas
- ventas/compras/lotes/movimientos
- casos `pending_homologation`

### Dataset semilla y trazabilidad (catálogo + operación)

- **Matrices fuente mínimas obligatorias** en `prisma/seed.ts` para:
  - familias técnicas/comerciales mínimas,
  - líneas/variantes mínimas,
  - catálogo base obligatorio (`PB-BCR-OR`, `PB-PTL-OR`, `PB-AMP-RJ`, `PB-SHA-OR`, `PB-TRC-OR`),
  - presentaciones mínimas (`granel`, `1L`, `500ML`, `250ML`, `120ml`, `30ML`),
  - alias/homologaciones mínimas exactas con `originalValue` preservado.
- **Validadores de seed (`runSourceMatrixChecks` + `runSeedChecks`)** que detienen la ejecución si falta un valor obligatorio o si un alias ambiguo pierde el valor importado original.
- **Ambigüedad controlada con `pending_homologation`**: incluye casos reales de normalización incompleta (tildes, espacios dobles, espacios al inicio/fin) para validar trazabilidad sin mutar el dato fuente.
- **Cadena transaccional demo completa**:
  1. producción (`OP-2026-0001`) y lote (`LOT-BAL-OR-260401`),
  2. fraccionamiento (`OFR-2026-0001`, `CHILD-001`, `CHILD-002`),
  3. stock (`SMOV-001`, `SBAL-001`),
  4. venta (`OV-2026-0001`) + cuenta a cobrar (`AR-001`) + cobranza (`REC-2026-0001`, `RA-001`),
  5. compra (`OC-2026-0001`) + cuenta a pagar (`AP-001`) + pago (`PAG-2026-0001`, `PA-001`),
  6. tesorería (`TM-001`, `TM-002`) y snapshots (`demo_e2e_costs_2026_04`, `demo_e2e_margins_2026_04`).

---

## Usuarios demo

- `admin@demo.local` / `demo1234`
- `direccion@demo.local` / `demo1234`
- `produccion@demo.local` / `demo1234`
- `comercial@demo.local` / `demo1234`
- `finanzas@demo.local` / `demo1234`

---

## UX/UI implementada

Principios:

- estética premium, limpia, Apple-like
- mobile-first
- sidebar desktop + bottom tabs mobile
- componentes reutilizables para flujos transaccionales

### Biblioteca UI interna

Incluye, entre otros:

- `AppShell`, `Sidebar`, `Topbar`, `BottomTabs`
- `PageHeader`, `KPIStatCard`, `StatusBadge`, `EntityChip`
- `SmartSelector` (búsqueda por canónico/alias/código + alta contextual)
- `QuickCreateSheet`, `InlineCollectionEditor`, `WizardLayout`
- `DataTable`, `DataCards`, `KanbanBoard`
- `MergeComparePanel`, `ImportStudio`
- `AuditTimeline`, `TraceTimeline`
- `AttachmentUploader`, `ConfirmDialog`, `Toasts`, `Skeletons`

---

## Rutas funcionales

Se encuentran implementadas en `apps/web/app`:

- Inicio: `/inicio`, `/inicio/alertas`, `/buscar`
- Catálogo: familias, productos base, presentaciones, SKUs, alias, packaging
- Técnica: matrices, fórmulas, fórmula detalle, insumos, aprobaciones
- Operación: producción, wizard OP, lotes, fraccionamiento, calidad, historial
- Stock: balance, movimientos, lotes, inventarios
- Abastecimiento: proveedores, solicitudes, OCs, recepciones, costos proveedor, gastos
- Comercial: clientes, homologación, listas, pedidos, combos, despachos
- Finanzas: CxC, cobranzas, CxP, pagos, tesorería, conciliación
- Analítica: costos, márgenes, reportes, calidad de dato
- Sistema: usuarios, maestros, importaciones, auditoría

---

## API (resumen)

Controladores por módulo para:

- Auth (`login`, `refresh`, `logout`, `me`)
- Catálogo (`families`, `product-bases`, `presentations`, `skus`, `aliases`, `packaging`)
- Fórmulas (`list`, `detail`, `create`, `version`, `approve`, `obsolete`, `compare`)
- Producción / Fraccionamiento / Stock
- Compras / Gastos
- Comercial / Precios / Ventas / Despachos / Combos
- Cobranzas / Pagos / Tesorería / Conciliación
- Reporting
- Sistema (`users`, `roles`, `masters`, `imports`, `audit`)

---

## Importaciones

Flujo completo:

1. upload/source
2. mapping editable
3. validación
4. preview
5. importación
6. warnings + log detallado

Importadores incluidos:

- fórmulas
- diarios de producción
- clientes
- proveedores
- listas de precios
- ventas históricas
- gastos
- stock inicial

---

## Testing

### Unit + integración

```bash
pnpm test
```

### E2E web

```bash
pnpm test:e2e
```

Suite crítica obligatoria (API + DB real):

```bash
pnpm test:e2e:critical
```

> La pipeline de CI bloquea `lint`, `test`, `test:e2e:critical` y `build` si la suite crítica no pasa.

### Build/Lint

```bash
pnpm lint
pnpm build
```

---

## Matriz de cobertura por módulo

| Módulo                       | Unit/Integración API                                                           | E2E smoke mockeado             | E2E real crítica (`real-api-db`)              |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------------ | --------------------------------------------- |
| Auth                         | ✅ `apps/api/src/modules/auth/__tests__`                                       | ✅ login mockeado              | ✅ login real                                 |
| Catálogo                     | ✅ `apps/api/src/modules/catalog/__tests__`                                    | ✅ altas contextuales          | ✅ creación catálogo contextual               |
| Fórmulas                     | ✅ `apps/api/src/modules/formulas/__tests__`                                   | ✅ alta crítica draft          | ✅ fórmula versionada/aprobada                |
| Producción                   | ✅ `apps/api/src/modules/production/__tests__`                                 | ✅ OP + lote + fraccionamiento | ✅ OP + cierre lote + fraccionamiento         |
| Comercial (ventas/despachos) | ✅ `apps/api/src/modules/sales/__tests__`                                      | ✅ venta                       | ✅ venta + despacho                           |
| Finanzas (cobranzas/pagos)   | ✅ `apps/api/src/modules/receivables/__tests__`, `payables_treasury/__tests__` | ✅ cobranza + pago             | ✅ cobranza + pago                            |
| Importaciones                | ✅ `apps/api/src/modules/imports/__tests__`                                    | ✅ import mockeado             | ✅ import demo con persistencia + auditoría   |
| Auditoría                    | ✅ `apps/api/src/modules/audit/__tests__`                                      | ➖                             | ✅ validación visible en `/sistema/auditoria` |

## Pantallas y demo

La app entrega navegación real en todas las rutas de operación clave, con estados, tablas, formularios, acciones y auditoría visible. Para documentación visual:

- correr `pnpm dev`
- navegar rutas críticas (dashboard, catálogo, fórmulas, producción, stock, comercial, finanzas)
- opcionalmente capturar screenshots del flujo en entorno local/CI.

---

## Decisiones de diseño importantes

1. **Modular monolith** para acelerar entrega sin complejidad de microservicios.
2. **Alias + homologación first-class** para absorber históricos inconsistentes.
3. **Creación contextual embebida** (alta en flujo + retorno al origen + auditoría).
4. **Eventos de dominio** para desacoplar acciones críticas (producción, ventas, import).
5. **Prisma** como capa de datos única para trazabilidad y consistencia.

---

## Roadmap sugerido

1. endurecer permisos granulares por acción/campo
2. tablero avanzado de planificación MRP
3. forecasting comercial y reposición
4. reglas promocionales por motor declarativo
5. observabilidad (traces/métricas) y alertas productivas

---

## GitHub Pages (frontend estático)

`apps/web/next.config.js` soporta static export y ajuste automático de `basePath/assetPrefix` para:

- project pages (`/<repo>`)
- user/org pages (`/`)

Si desplegás en project page, exportá con `GITHUB_PAGES=true`.
