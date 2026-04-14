import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Catalogo · Productos Base"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="catalogo-productos-base"
    />
  );
}
