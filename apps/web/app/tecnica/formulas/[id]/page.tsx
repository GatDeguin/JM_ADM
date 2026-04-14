import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { AuditTimeline } from "@/components/ui/AuditTimeline";
import { fetchEntityTimeline } from "@/lib/audit";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "FOR-001" }, { id: "FOR-002" }, { id: "FOR-003" }];
}

export default async function FormulaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await fetchEntityTimeline("FormulaTemplate", id).catch(() => []);
  return (
    <Layout title="Ficha fórmula">
      <PageHeader title={`Fórmula ${id}`} subtitle="Versiones, componentes, aprobación y homologación" />
      <AuditTimeline events={events} />
    </Layout>
  );
}
