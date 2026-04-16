"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function PresentacionesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Catálogo · Presentaciones"
      headerTitle="Presentaciones"
      subtitle="Presentaciones comerciales en catálogo."
      listPath="/catalog/presentations"
      createPath="/catalog/presentations"
    />
  );
}
