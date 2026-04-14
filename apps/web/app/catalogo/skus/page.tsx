import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Catalogo · Skus"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="catalogo-skus"
    />
  );
}
