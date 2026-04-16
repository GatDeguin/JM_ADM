"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function ProveedoresPage() {
  return (
    <DomainResourcePage
      layoutTitle="Abastecimiento · Proveedores"
      headerTitle="Proveedores"
      subtitle="Maestro contextual de proveedores."
      listPath="/masters/contextual/entities/supplier/options"
      createPath="/masters/contextual/entities/supplier"
    />
  );
}
