"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function GastosPage() {
  return (
    <DomainResourcePage
      layoutTitle="Abastecimiento · Gastos"
      headerTitle="Gastos"
      subtitle="Registro de gastos vinculados a abastecimiento."
      listPath="/expenses"
      createPath="/expenses"
    />
  );
}
