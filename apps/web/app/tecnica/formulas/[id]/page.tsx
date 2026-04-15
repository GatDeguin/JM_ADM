import { Suspense } from "react";
import { FormulaDetailPage } from "@/components/technical/FormulaDetailPage";
import { fetchEntityTimeline } from "@/lib/audit";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "FOR-001" }, { id: "FOR-002" }, { id: "FOR-003" }];
}

export default async function FormulaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await fetchEntityTimeline("FormulaTemplate", id).catch(() => []);

  return (
    <Suspense fallback={null}>
      <FormulaDetailPage id={id} events={events} />
    </Suspense>
  );
}
