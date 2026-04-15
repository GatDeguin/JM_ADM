import { PageHeader } from "@/components/ui/PageHeader";
import { UIDemoPlayground } from "@/components/ui/UIDemoPlayground";

export default function UiDemoPage() {
  return (
    <main className="space-y-6">
      <PageHeader title="UI Demo" subtitle="Validación visual interna de componentes reutilizables" />
      <UIDemoPlayground />
    </main>
  );
}
