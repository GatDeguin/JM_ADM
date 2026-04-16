"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function PackagingSpecsPage() {
  return (
    <DomainResourcePage
      layoutTitle="Catálogo · Packaging"
      headerTitle="Packaging"
      subtitle="Especificaciones de packaging reales."
      listPath="/catalog/packaging-specs"
      createPath="/catalog/packaging-specs"
    />
  );
}
