"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function InsumosPage() {
  return (
    <DomainResourcePage
      layoutTitle="Técnica · Insumos"
      headerTitle="Insumos"
      subtitle="Entidades contextuales de insumos."
      listPath="/masters/contextual/entities/input/options"
      createPath="/masters/contextual/entities/input"
    />
  );
}
