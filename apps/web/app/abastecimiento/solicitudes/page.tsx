import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Abastecimiento · Solicitudes"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="abastecimiento-solicitudes"
    />
  );
}
