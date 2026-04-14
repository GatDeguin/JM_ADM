import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Sistema · Maestros"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="sistema-maestros"
    />
  );
}
