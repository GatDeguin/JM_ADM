import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Sistema · Usuarios"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="sistema-usuarios"
    />
  );
}
