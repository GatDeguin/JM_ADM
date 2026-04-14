import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { AuditTimeline } from "@/components/ui/AuditTimeline";

export default async function FormulaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Layout title="Ficha fórmula">
      <PageHeader title={`Fórmula ${id}`} subtitle="Versiones, componentes, aprobación y homologación" />
      <AuditTimeline
        events={[
          { id: "1", action: "create", user: "qa@empresa.com", at: "2026-04-14 09:00", detail: "Creación de fórmula base" },
          { id: "2", action: "update", user: "i+d@empresa.com", at: "2026-04-14 11:30", detail: "Ajuste de concentración" }
        ]}
      />
    </Layout>
  );
}
