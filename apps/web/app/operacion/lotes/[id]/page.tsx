import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { TraceTimeline } from "@/components/ui/TraceTimeline";

export default async function BatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Layout title="Lote">
      <PageHeader title={`Lote ${id}`} subtitle="Trazabilidad end-to-end" />
      <TraceTimeline />
    </Layout>
  );
}
