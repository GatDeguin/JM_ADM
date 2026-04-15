import { CatalogDetailPage } from "@/components/catalog/CatalogDetailPage";
import { fetchEntityTimeline } from "@/lib/audit";

export default async function ProductoBaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await fetchEntityTimeline("ProductBase", id).catch(() => []);
  return <CatalogDetailPage id={id} kind="producto-base" auditEvents={events} />;
}
