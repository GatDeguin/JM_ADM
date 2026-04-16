# Inventario de rutas con DomainCrudView/CriticalDomainCrudView

Actualizado el 2026-04-16.

## Rutas productivas en `apps/web/app` que montan `DomainCrudView`

- Ninguna.

## Rutas productivas en `apps/web/app` que montan `CriticalDomainCrudView`

- Ninguna.

## Rutas internas/demo que mantienen `DomainCrudView`

- `/sistema/ui-demo` (playground visual interno).

## Notas de migración

- Todas las rutas listadas en la versión anterior de este inventario fueron migradas a componentes de dominio reales bajo `apps/web/components/<dominio>/`.
- Las nuevas pantallas siguen el patrón UX común (`Layout`, `PageHeader`, `DataTable`) y formularios con validación de esquema.
- Cada pantalla quedó conectada a endpoints v1 existentes en `apps/api/src/config/api-routes.ts`.
