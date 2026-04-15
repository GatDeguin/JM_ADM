# Relevamiento completo del repositorio (2026-04-15)

## Alcance del relevamiento

Se auditó el estado actual del monorepo para contrastar lo implementado contra el alcance objetivo de la plataforma integral (frontend, backend, datos, importaciones, workflows y operación local).

## Evidencia revisada

- Estructura de rutas App Router (`apps/web/app/**/page.tsx`).
- Módulos backend Nest (`apps/api/src/modules/*`).
- Modelo de datos Prisma (`prisma/schema.prisma`).
- Seeds e importadores (`prisma/seed.ts`, `scripts/import-demo.ts`).
- Scripts de ejecución y CI (`package.json`, `docker-compose.yml`).
- Pruebas disponibles (`apps/api/src/modules/**/__tests__`, `apps/web/tests`).

## Resultado general

### Cobertura macro

- **Rutas funcionales obligatorias del prompt**: 100% presentes (50/50).
- **Módulos backend obligatorios**: 21/21 presentes.
- **Modelos Prisma mínimos requeridos**: presentes (incluyendo tablas de seguridad, catálogo, fórmulas, producción, stock, comercial, finanzas y analítica).
- **Seed de dominio**: presente con datos extensos.
- **Importadores**: presentes (servicio central + pruebas por tipo).

### Hallazgos operativos detectados durante verificación

1. `pnpm build` presentaba bloqueo por variable `NEXT_PUBLIC_API_URL` faltante (se aplicó fallback local).
2. `pnpm build` sigue fallando en pre-render de rutas de finanzas por uso de `useSearchParams` sin `Suspense` en páginas server-side.
3. `pnpm db:seed` en entorno virgen necesitaba generar Prisma Client antes del seed (se incorporó en script).
4. `pnpm db:seed` requiere `DATABASE_URL` definida o stack Docker levantado para completar la carga.
5. Falta un documento único de seguimiento para cerrar el 100% con responsables, prioridad y criterio de aceptación transversal (resuelto con este relevamiento).

## Plan de cierre al 100% (tareas faltantes)

> Estado inicial al crear este relevamiento: **pendiente**.

### Bloque A — Bloqueantes de compilación y base de datos

1. **A1. Corregir pre-render en páginas de finanzas (`useSearchParams` + `Suspense`)**
   - Objetivo: que `pnpm build` termine sin errores de pre-render/export.
   - Criterio de aceptación:
     - Build exitoso en entorno local con `pnpm build`.
     - Sin errores en `/finanzas/cuentas-cobrar` y `/finanzas/cuentas-pagar`.

2. **A2. Carga base de datos end-to-end en Docker**
   - Objetivo: garantizar bootstrap completo reproducible.
   - Pasos de cierre:
     - `docker compose --profile bootstrap up --build bootstrap`
     - Validar migraciones + seed + chequeo seed.
   - Criterio de aceptación:
     - Usuarios demo disponibles.
     - Datos canónicos y alias cargados.

### Bloque B — Validación de workflows críticos con persistencia real

1. **B1. Flujo real Fórmula → Aprobación**
   - Crear, versionar, aprobar y asociar fórmula vigente.

2. **B2. Flujo real Producción → Lote → QC → Liberación/Retención**
   - Ejecutar caso feliz y caso retenido.

3. **B3. Flujo real Fraccionamiento con consumo de packaging**
   - Validar bloqueo por packaging insuficiente.

4. **B4. Flujo real Venta → Despacho → CxC/Cobranza**
   - Confirmar impacto en stock, AR y tesorería.

5. **B5. Flujo real Compra/Recepción → CxP/Pago**
   - Confirmar impacto en stock, AP y tesorería.

### Bloque C — Calidad de entrega “producto terminado”

1. **C1. Smoke E2E integral de rutas obligatorias**
   - Navegación sin rutas muertas + estados vacíos controlados.

2. **C2. Auditoría transversal de creación contextual**
   - Verificar registro `origen_flujo`, usuario, before/after en entidades críticas.

3. **C3. Tablero de calidad de dato operativo**
   - Confirmar reportes: alias pendientes, duplicados, SKU sin precio, lotes retenidos.

4. **C4. Cierre técnico release-ready**
   - Ejecutar: lint, tests, build, seed, import demo y checklist de Definition of Done.

## Carga de base de datos (runbook recomendado)

1. `cp .env.example .env`
2. `docker compose up -d postgres redis minio`
3. `pnpm db:migrate`
4. `pnpm db:seed`
5. `pnpm import:demo`
6. Validar login con `admin@demo.local / demo1234`.

## KPI de cierre sugeridos

- Build: ✅
- Lint: ✅
- Test unit/integration: ✅
- Seed reproducible: ✅
- Import demo reproducible: ✅
- Flujos críticos E2E reales: ✅
- Checklist DoD (30/30): ✅
