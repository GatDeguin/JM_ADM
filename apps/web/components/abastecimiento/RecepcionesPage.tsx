"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function RecepcionesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Abastecimiento · Recepciones"
      headerTitle="Recepciones"
      subtitle="Recepciones de mercadería registradas en purchasing."
      listPath="/purchasing/goods-receipts"
      createPath="/purchasing/goods-receipts"
    />
  );
}
