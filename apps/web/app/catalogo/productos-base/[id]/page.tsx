import { Suspense } from "react";
import { CatalogDetailPage } from "@/components/catalog/CatalogDetailPage";
import { fetchEntityTimeline } from "@/lib/audit";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "PB-001" }, { id: "PB-002" }, { id: "PB-003" }];
}

export default async function ProductoBaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await fetchEntityTimeline("ProductBase", id).catch(() => []);
  return (
    <Suspense fallback={null}>
      <CatalogDetailPage id={id} kind="producto-base" auditEvents={events} />
    </Suspense>
  );
}
