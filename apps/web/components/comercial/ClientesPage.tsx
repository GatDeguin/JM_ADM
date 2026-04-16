"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function ClientesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Comercial · Clientes"
      headerTitle="Clientes"
      subtitle="Maestro de clientes con API productiva."
      listPath="/customers"
      createPath="/customers"
    />
  );
}
