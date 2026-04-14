import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Stock · Movimientos"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="stock-movimientos"
    />
  );
}
