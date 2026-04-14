import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function Page() {
  return (
    <DomainCrudView
      title="Stock · Balance"
      subtitle="Vista por dominio con filtros, CRUD contextual y homologación"
      domain="stock-balance"
    />
  );
}
