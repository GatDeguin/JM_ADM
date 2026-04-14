import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common";

export function assertRequiredText(value: string | null | undefined, fieldLabel: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new BadRequestException(`Debes completar ${fieldLabel}.`);
  }
  return normalized;
}

export function assertPositiveNumber(value: number, fieldLabel: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new BadRequestException(`${fieldLabel} debe ser mayor a 0.`);
  }
}

export function assertNonZeroNumber(value: number, fieldLabel: string): void {
  if (!Number.isFinite(value) || value === 0) {
    throw new BadRequestException(`${fieldLabel} no puede ser 0.`);
  }
}

export function assertFormulaCanBeUsed(status: string | null | undefined): void {
  if (status === "obsolete") {
    throw new ConflictException("La fórmula seleccionada está obsoleta. Elegí una versión vigente.");
  }
}

export function assertBatchCanBeFractionated(status: string | null | undefined): void {
  if (status === "retained") {
    throw new ConflictException("El lote está retenido y no se puede fraccionar.");
  }
}

export function assertOrderHasItems(items: Array<{ skuId: string; qty: number }> | undefined): void {
  if (!items?.length) {
    throw new BadRequestException("Debes agregar al menos un SKU al pedido.");
  }

  const invalidQty = items.find((item) => !Number.isFinite(item.qty) || item.qty <= 0);
  if (invalidQty) {
    throw new BadRequestException("Todas las cantidades del pedido deben ser mayores a 0.");
  }
}

export function assertSalesTotalAllowed(total: number): void {
  if (!Number.isFinite(total) || total <= 0) {
    throw new ForbiddenException("El pedido no se puede confirmar con total menor o igual a 0.");
  }
}

export function assertSupportedImportType(isSupported: boolean, type: string): void {
  if (!isSupported) {
    throw new BadRequestException(`El tipo de importación \"${type}\" no está soportado.`);
  }
}

export function assertImportRowsPresent(rows: Record<string, unknown>[]): void {
  if (!rows.length) {
    throw new BadRequestException("El archivo no tiene filas para procesar.");
  }
}

export function assertMappingHasFields(mapping: Record<string, string>): void {
  if (Object.keys(mapping).length === 0) {
    throw new BadRequestException("Debes mapear al menos una columna antes de validar.");
  }
}

export function assertNoPendingHomologation(pendingHomologation: number): void {
  if (pendingHomologation > 0) {
    throw new ForbiddenException("No se puede confirmar la importación con registros pendientes de homologación.");
  }
}
