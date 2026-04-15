# Matriz DoD (Definition of Done) trazable

Esta matriz define criterios DoD con IDs trazables y el mapeo obligatorio hacia evidencias automatizadas:

- **Integración API (Nest + Prisma)**
- **E2E real (Playwright contra API/DB reales de test)**
- **Chequeos de datos seed**

> Convención de IDs: `DOD-XXX`.

## Matriz de criterios

| ID      | Criterio DoD                                              | Crítico para merge | Integración API (Nest + Prisma) | E2E real (Playwright + API/DB real)                                            | Seed check                                              |
| ------- | --------------------------------------------------------- | ------------------ | ------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| DOD-001 | Autenticación operativa (login + acceso API protegido)    | ✅ Sí              | `pnpm --filter api test`        | `real/critical/login`                                                          | Usuario admin y roles demo existentes                   |
| DOD-002 | OP / lote (alta y trazabilidad mínima)                    | ✅ Sí              | `pnpm --filter api test`        | Flujo crítico E2E incluye OP + lote                                            | Seed contiene `OP-2026-0001` y lote `LOT-BAL-OR-260401` |
| DOD-003 | Fraccionamiento y movimiento asociado                     | ✅ Sí              | `pnpm --filter api test`        | Flujo crítico E2E incluye fraccionamiento                                      | Seed contiene `OFR-2026-0001` y `SMOV-001`              |
| DOD-004 | Venta y despacho mínimo trazable                          | ✅ Sí              | `pnpm --filter api test`        | Flujo crítico E2E incluye pedido + despacho                                    | Seed contiene `OV-2026-0001`                            |
| DOD-005 | Cobranza (CxC + recibo)                                   | ✅ Sí              | `pnpm --filter api test`        | Flujo crítico E2E incluye cobranzas                                            | Seed contiene `AR-001` y `REC-2026-0001`                |
| DOD-006 | Pago (CxP + pago)                                         | ✅ Sí              | `pnpm --filter api test`        | Flujo crítico E2E incluye pagos                                                | Seed contiene `AP-001` y `PAG-2026-0001`                |
| DOD-007 | Auditoría verificable de operación/importación            | ✅ Sí              | `pnpm --filter api test`        | Caso `real/critical/importación demo con persistencia y auditoría verificable` | Seed preserva datos de referencia para auditoría        |
| DOD-008 | Costos y márgenes con snapshot disponible                 | ⛔ No              | `pnpm --filter api test`        | `pnpm --filter web test:e2e:real`                                              | Seed contiene snapshots de costo y margen               |
| DOD-009 | Calidad de catálogo base (alias y homologación pendiente) | ⛔ No              | `pnpm --filter api test`        | `pnpm --filter web test:e2e:real`                                              | Seed valida alias obligatorios + pendientes             |
| DOD-010 | Integridad de bootstrap integral                          | ⛔ No              | `pnpm --filter api test`        | `pnpm --filter web test:e2e:real`                                              | `pnpm db:seed:check` en verde                           |

## Ejecución agregada

El comando agregador es:

```bash
pnpm test:dod
```

Este comando:

1. Ejecuta los tres bloques de verificación (API integration, E2E real, seed check).
2. Evalúa cada criterio `DOD-XXX` en base al resultado de esos bloques.
3. Exporta artefactos en `artifacts/`:
   - `dod-compliance.json`
   - `dod-compliance.md`
4. Retorna código de error si falla al menos un criterio crítico.

## Política de bloqueo de merge

Falla de cualquiera de estos criterios críticos bloquea merge:

- `DOD-001` (auth)
- `DOD-002` (OP/lote)
- `DOD-003` (fraccionamiento)
- `DOD-004` (venta)
- `DOD-005` (cobranza)
- `DOD-006` (pago)
- `DOD-007` (auditoría)
