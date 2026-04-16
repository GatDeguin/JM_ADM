"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function ProductosBasePage() {
  return (
    <DomainResourcePage
      layoutTitle="Catálogo · Productos base"
      headerTitle="Productos base"
      subtitle="ABM de productos base productivo."
      listPath="/catalog/product-bases"
      createPath="/catalog/product-bases"
    />
  );
}
