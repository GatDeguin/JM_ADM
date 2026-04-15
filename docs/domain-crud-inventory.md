# Inventario de rutas con DomainCrudView/CriticalDomainCrudView

Generado el 2026-04-15.

## Rutas detectadas en `apps/web/app`

- `/abastecimiento/costos-proveedor`
- `/abastecimiento/gastos`
- `/abastecimiento/ordenes-compra`
- `/abastecimiento/proveedores`
- `/abastecimiento/recepciones`
- `/abastecimiento/solicitudes`
- `/buscar`
- `/catalogo/alias`
- `/catalogo/familias`
- `/catalogo/packaging`
- `/catalogo/presentaciones`
- `/catalogo/productos-base`
- `/catalogo/skus`
- `/comercial/clientes`
- `/comercial/clientes/homologacion`
- `/comercial/combos`
- `/comercial/despachos`
- `/comercial/listas`
- `/comercial/ventas/combos-componentes`
- `/comercial/ventas/despachos-devoluciones`
- `/comercial/ventas/reservas`
- `/finanzas/cobranzas/aging-vencimientos`
- `/finanzas/cobranzas/imputaciones-multiples`
- `/finanzas/cobranzas/recibos-parciales`
- `/finanzas/conciliacion`
- `/finanzas/cuentas-cobrar`
- `/finanzas/cuentas-pagar`
- `/finanzas/pagos-tesoreria/asignacion-cxp`
- `/finanzas/pagos-tesoreria/conciliacion-bancaria`
- `/finanzas/pagos-tesoreria/movimientos-caja-banco`
- `/finanzas/pagos-tesoreria/pagos-parciales`
- `/finanzas/saldos-estados`
- `/finanzas/tesoreria`
- `/inicio`
- `/inicio/alertas`
- `/operacion/calidad`
- `/operacion/historial-lotes`
- `/sistema/maestros`
- `/sistema/usuarios`
- `/tecnica/aprobaciones`
- `/tecnica/formulas`
- `/tecnica/insumos`
- `/tecnica/matrices`

## Prioridad de migración acordada
- Alta: `/operacion/produccion`, `/operacion/fraccionamiento`, `/comercial/pedidos`, `/finanzas/cobranzas`, `/finanzas/pagos`, `/stock/*`.
- Estado: migradas en esta iteración las rutas priorizadas excepto que el resto del inventario permanece como fallback demo.
