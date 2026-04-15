import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { TraceTimeline } from "@/components/ui/TraceTimeline";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "LOT-001" }, { id: "LOT-002" }, { id: "LOT-003" }];
}

export default async function BatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Layout title="Lote" transitionPreset="section-slide">
      <PageHeader title={`Lote ${id}`} subtitle="Trazabilidad end-to-end" />
      <TraceTimeline
        nodes={[
          { id: "n1", step: "Recepción", lot: id, at: "2026-04-14 06:30", status: "ok" },
          { id: "n2", step: "Fraccionamiento", lot: id, at: "2026-04-14 08:10", status: "warning" },
          { id: "n3", step: "Liberación", lot: id, at: "2026-04-14 10:15", status: "ok" }
        ]}
      />
    </Layout>
  );
}
