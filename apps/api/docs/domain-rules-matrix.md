# Matriz formal de reglas críticas (20)

| ID | Regla de negocio | Endpoint(s) | Servicio / capa de validación |
|---|---|---|---|
| R-PR-001 | La lista de precios requiere código obligatorio. | `POST /pricing/price-lists` | `PricingService.create` |
| R-PR-002 | La lista de precios requiere nombre obligatorio. | `POST /pricing/price-lists` | `PricingService.create` |
| R-PR-003 | La lista debe incluir fecha de vigencia (`startsAt`). | `POST /pricing/price-lists` | `PricingService.create` |
| R-PR-004 | Una lista archivada no se puede modificar. | `PATCH /pricing/price-lists/:id` | `PricingService.update` |
| R-IV-001 | Un ajuste de inventario exige `qty != 0`. | `POST /inventory/inventory-adjustments` | `InventoryService.create` |
| R-IV-002 | Un ajuste/reversa exige motivo. | `POST /inventory/inventory-adjustments`, `POST /inventory/inventory-adjustments/:id/action` | `InventoryService.create`, `InventoryService.runAction` |
| R-IV-003 | Transferencia interna requiere origen/destino distintos. | `POST /inventory/internal-transfers` | `InventoryService.createInternalTransfer` |
| R-IV-004 | No se transfiere más de stock disponible. | `POST /inventory/internal-transfers` | `InventoryRepository.createInternalTransfer` |
| R-RV-001 | Recibo requiere al menos una imputación. | `POST /receivables/receipts/apply` | `ReceivablesService.runAction` |
| R-RV-002 | Imputaciones no pueden exceder importe del recibo. | `POST /receivables/receipts/apply` | `ReceivablesRepository.runAction` |
| R-RV-003 | Imputaciones de un recibo deben ser del mismo cliente. | `POST /receivables/receipts/apply` | `ReceivablesRepository.runAction` |
| R-RV-004 | Imputación no puede exceder saldo del documento. | `POST /receivables/receipts/apply` | `ReceivablesRepository.runAction` |
| R-PT-001 | Pago requiere al menos una imputación. | `POST /payables_treasury/payments/apply` | `PayablesTreasuryService.runAction` |
| R-PT-002 | Imputaciones no pueden exceder el importe pagado. | `POST /payables_treasury/payments/apply` | `PayablesTreasuryRepository.runAction` |
| R-PT-003 | Imputaciones de un pago deben ser del mismo proveedor. | `POST /payables_treasury/payments/apply` | `PayablesTreasuryRepository.runAction` |
| R-PT-004 | Imputación no puede exceder saldo de CxP. | `POST /payables_treasury/payments/apply` | `PayablesTreasuryRepository.runAction` |
| R-PT-005 | Transferencia de tesorería exige cuentas distintas. | `POST /payables_treasury/treasury/transfers` | `PayablesTreasuryService.transferFunds` |
| R-SA-001 | Pedido de venta exige al menos un ítem con cantidad positiva. | `POST /sales/sales-orders` | `SalesService.create` |
| R-SA-002 | Pedido de venta no se confirma con total <= 0. | `POST /sales/sales-orders` | `SalesService.create` |
| R-PD-001/002/003 | Transiciones de estado válidas en producción (`planned->reserved`, `reserved->in_process`, `in_process->qc_pending`). | `POST /production/:id/reserve-materials`, `POST /production/:id/start-batch`, `POST /production/:id/close-batch` | `ProductionService.reserveMaterials/start/close` |

## Estandarización de errores de dominio

Las reglas bloqueantes devuelven payload homogéneo:

```json
{
  "type": "DOMAIN_RULE_ERROR",
  "code": "RULE_...",
  "message": "Mensaje legible para usuario",
  "ruleId": "R-..."
}
```

Esto permite al frontend mostrar feedback consistente (ej.: `[RULE_PAYABLES_ALLOCATION_TOTAL] Las imputaciones...`).
