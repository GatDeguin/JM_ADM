import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { AuditTimeline } from "@/components/ui/AuditTimeline";
import { fetchGlobalAuditFeed } from "@/lib/audit";

export default async function Page() {
  const events = await fetchGlobalAuditFeed().catch(() => []);
  return (
    <Layout title="Sistema · Auditoría">
      <PageHeader title="Sistema · Auditoría" subtitle="Feed global de eventos de auditoría del sistema" />
      <AuditTimeline events={events} />
    </Layout>
  );
}
