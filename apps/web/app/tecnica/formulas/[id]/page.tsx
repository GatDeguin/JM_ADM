import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { AuditTimeline } from "@/components/ui/AuditTimeline";

export default async function FormulaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Layout title="Ficha fórmula">
      <PageHeader title={`Fórmula ${id}`} subtitle="Versiones, componentes, aprobación y anomalías" />
      <AuditTimeline />
    </Layout>
  );
}
