# Soft-delete / inactivación

## Política general

1. **No borrar físicamente** entidades sensibles en repositorios de dominio.
2. Para entidades con estado de negocio, usar transición de estado (`inactive`/`cancelled`).
3. Para entidades sensibles de identidad/maestros, además registrar `deletedAt`.
4. Las consultas de listado deben filtrar por `deletedAt = null` cuando aplique.

## Entidades sensibles cubiertas

- `User`: `status`, `deletedAt`
- `Role`: `status`, `deletedAt`
- `Item`: `status`, `deletedAt`
- `SKU`: `status`, `deletedAt`
- `Supplier`: `status`, `deletedAt`
- `Customer`: `status`, `deletedAt`
- `CashAccount`: `status`, `deletedAt`

## Convenciones en repositorios Nest

- `remove()` muta estado en lugar de `delete()`.
- Operaciones de baja funcional en órdenes/cuentas: `status = "cancelled"`.
- Operaciones de baja en catálogos/seguridad: `status = "inactive"` y `deletedAt = now()`.
