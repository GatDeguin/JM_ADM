import { Suspense } from "react";
import { CatalogDetailPage } from "@/components/catalog/CatalogDetailPage";
import { fetchEntityTimeline } from "@/lib/audit";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "SKU-001" }, { id: "SKU-002" }, { id: "SKU-003" }];
}

export default async function SkuDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await fetchEntityTimeline("Sku", id).catch(() => []);
  return (
    <Suspense fallback={null}>
      <CatalogDetailPage id={id} kind="sku" auditEvents={events} />
    </Suspense>
  );
}
