import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Stock · Inventarios"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="stock-inventarios"
    />
  );
}
