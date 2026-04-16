"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function BuscarPage() {
  return (
    <DomainResourcePage
      layoutTitle="Buscar"
      headerTitle="Buscar"
      subtitle="Búsqueda transversal de catálogo en vivo."
      listPath="/catalog/search"
    />
  );
}
