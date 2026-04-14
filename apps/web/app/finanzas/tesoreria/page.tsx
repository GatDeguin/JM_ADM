import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Finanzas · Tesoreria"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="finanzas-tesoreria"
    />
  );
}
