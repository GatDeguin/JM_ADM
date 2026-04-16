import { PageHeader } from "@/components/ui/PageHeader";
import { UIDemoPlayground } from "@/components/ui/UIDemoPlayground";
import { DomainCrudView } from "@/components/ui/DomainCrudView";

export default function UiDemoPage() {
  return (
    <main className="space-y-6">
      <PageHeader title="UI Demo" subtitle="Validación visual interna de componentes reutilizables" />
      <UIDemoPlayground />
      <DomainCrudView title="Demo · DomainCrudView" subtitle="Componente legado disponible solo para playground interno." domain="internal-demo" />
    </main>
  );
}
