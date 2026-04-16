# Inventario de rutas con DomainCrudView/CriticalDomainCrudView

Actualizado el **2026-04-16 (UTC)**.

## Verificación ejecutada (estado real)

- Búsqueda de referencias activas en `apps/web`:
  - `rg -n "DomainCrudView|CriticalDomainCrudView" apps/web --glob '!apps/web/components/ui/DomainCrudView.tsx' --glob '!apps/web/components/ui/CriticalDomainCrudView.tsx'`
- Resultado:
  - No hay usos productivos de `DomainCrudView`.
  - No hay usos productivos de `CriticalDomainCrudView`.
  - Único uso activo de `DomainCrudView`: ruta interna `/sistema/ui-demo`.

## Rutas productivas en `apps/web/app` que montan `DomainCrudView`

- Ninguna (estado confirmado al 2026-04-16).

## Rutas productivas en `apps/web/app` que montan `CriticalDomainCrudView`

- Ninguna (estado confirmado al 2026-04-16).

## Rutas internas/demo que mantienen `DomainCrudView`

- `/sistema/ui-demo` (playground visual interno).

## Estado final de migración

- **Completo para producción**: todas las rutas productivas previamente migradas a componentes de dominio específicos bajo `apps/web/components/<dominio>/`.
- **Excepción permitida**: `DomainCrudView` se conserva únicamente para demo interna de UI.
