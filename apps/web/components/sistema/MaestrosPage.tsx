"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function MaestrosPage() {
  return (
    <DomainResourcePage
      layoutTitle="Sistema · Maestros"
      headerTitle="Maestros"
      subtitle="Gestión de unidades maestras."
      listPath="/masters/units"
      createPath="/masters/units"
    />
  );
}
