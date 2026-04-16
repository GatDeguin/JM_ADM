"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function SkusPage() {
  return (
    <DomainResourcePage
      layoutTitle="Catálogo · SKUs"
      headerTitle="SKUs"
      subtitle="Gestión de SKUs conectada al endpoint v1."
      listPath="/catalog/skus"
      createPath="/catalog/skus"
    />
  );
}
