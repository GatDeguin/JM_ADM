import { CatalogDetailPage } from "@/components/catalog/CatalogDetailPage";
import { fetchEntityTimeline } from "@/lib/audit";

export default async function SkuDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await fetchEntityTimeline("Sku", id).catch(() => []);
  return <CatalogDetailPage id={id} kind="sku" auditEvents={events} />;
}
