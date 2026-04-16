"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function UsuariosPage() {
  return (
    <DomainResourcePage
      layoutTitle="Sistema · Usuarios"
      headerTitle="Usuarios"
      subtitle="Administración de usuarios con endpoint productivo."
      listPath="/users"
      createPath="/users"
    />
  );
}
