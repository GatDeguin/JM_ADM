# Política de migración y retiro de rutas legacy

## Objetivo
Reducir progresivamente el tráfico sobre rutas legacy y completar su retiro antes del **sunset: 31 de diciembre de 2026 (UTC)**.

## Telemetría auditable
- Cada acceso a ruta legacy se registra con:
  - `originalPath`
  - `successorPath`
  - `timestamp`
  - `legacyPrefix`
  - métrica `legacy_path_access_total`
- Canal auditable primario: archivo NDJSON `apps/api/var/audit/legacy-path-access.ndjson`.
- Canal secundario: log estructurado de aplicación (`LegacyPathTelemetry`) para observabilidad operativa.

## Reporte semanal obligatorio
- Comando: `pnpm report:legacy:weekly`
- Salida: `docs/reports/legacy-path-usage-weekly.md`
- Frecuencia recomendada: semanal (lunes 08:00 UTC).

Ejemplo de cron:
```cron
0 8 * * 1 cd /workspace/JM_ADM && pnpm report:legacy:weekly
```

## Umbrales de retiro por dominio
Se mide por prefijo legacy (`legacyPrefix`) en ventana móvil semanal.

| Dominio | Prefijos legacy | Umbral verde | Umbral ámbar | Umbral rojo |
|---|---|---:|---:|---:|
| System | `/users`, `/roles_permissions`, `/attachments`, `/imports`, `/audit`, `/masters` | 0-10 accesos/semana | 11-50 | >50 |
| Comercial | `/sales`, `/customers` | 0-20 | 21-80 | >80 |
| Finanzas | `/payables_treasury`, `/receivables`, `/costing`, `/expenses` | 0-20 | 21-80 | >80 |
| Catálogo | `/formulas`, `/pricing`, `/packaging` | 0-15 | 16-60 | >60 |
| Inventario/Producción | `/inventory`, `/production` | 0-25 | 26-100 | >100 |

## Cronograma de retiro por dominio

| Fecha límite | Acción |
|---|---|
| 2026-06-30 | Congelamiento de nuevas integraciones sobre rutas legacy y comunicación formal a clientes internos/externos. |
| 2026-08-31 | Todo dominio en estado ámbar o mejor durante 4 semanas consecutivas. |
| 2026-10-31 | Todo dominio en estado verde durante 4 semanas consecutivas; inicio de bloqueos selectivos en QA/UAT. |
| 2026-11-30 | Cutover productivo por dominio con fallback controlado (48h). |
| 2026-12-31 | Sunset definitivo: respuesta 410 para prefijos legacy remanentes. |

## Guía para clientes internos/externos
1. Migrar URLs usando la tabla de sucesión definida por API (`/legacy` -> `/domain/...`).
2. Consumir encabezados HTTP de deprecación (`Deprecation`, `Sunset`, `Link`).
3. Validar suites de contrato y smoke tests sobre rutas sucesoras antes de cada release.
4. Registrar excepciones de migración con fecha de cierre y responsable técnico.
5. Revisar semanalmente el reporte residual y priorizar dominios en rojo.
