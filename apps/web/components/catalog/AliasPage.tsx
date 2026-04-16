"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function AliasPage() {
  return (
    <DomainResourcePage
      layoutTitle="Catálogo · Alias"
      headerTitle="Alias"
      subtitle="Homologación y mantenimiento de alias."
      listPath="/catalog/aliases"
      createPath="/catalog/aliases"
    />
  );
}
