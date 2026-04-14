import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Abastecimiento · Proveedores"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="abastecimiento-proveedores"
    />
  );
}
