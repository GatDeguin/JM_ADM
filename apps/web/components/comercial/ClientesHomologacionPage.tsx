"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function ClientesHomologacionPage() {
  return (
    <DomainResourcePage
      layoutTitle="Comercial · Homologación de clientes"
      headerTitle="Homologación de clientes"
      subtitle="Homologación apoyada en alias de catálogo."
      listPath="/catalog/aliases"
      createPath="/catalog/aliases/homologate"
    />
  );
}
