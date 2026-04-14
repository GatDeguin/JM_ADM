import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Operacion · Calidad"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="operacion-calidad"
    />
  );
}
