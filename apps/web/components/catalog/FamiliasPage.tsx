"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function FamiliasPage() {
  return (
    <DomainResourcePage
      layoutTitle="Catálogo · Familias"
      headerTitle="Familias"
      subtitle="Familias de productos del catálogo."
      listPath="/catalog/families"
      createPath="/catalog/families"
    />
  );
}
