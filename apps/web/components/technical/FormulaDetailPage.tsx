"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { AuditTimeline, type AuditEvent } from "@/components/ui/AuditTimeline";
import { TraceTimeline } from "@/components/ui/TraceTimeline";
import { SmartSelector } from "@/components/ui/SmartSelector";
import { InlineCollectionEditor } from "@/components/ui/InlineCollectionEditor";

const tabs = ["resumen", "composicion", "precios", "stock", "auditoria", "adjuntos"] as const;
type FormulaTab = (typeof tabs)[number];

export function FormulaDetailPage({ id, events }: { id: string; events: AuditEvent[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("tab") as FormulaTab | null) ?? "resumen";

  const setTab = (tab: FormulaTab) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tab);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const detailTabs = useMemo(
    () => [
      { id: "resumen", label: "Resumen", content: <p className="text-sm text-zinc-600">Versión vigente, aprobación y metadatos técnicos de la fórmula {id}.</p> },
      { id: "composicion", label: "Composición/Packaging", content: <InlineCollectionEditor /> },
      {
        id: "precios",
        label: "Precios",
        content: <SmartSelector label="Cuenta técnica" value={undefined} onChange={() => undefined} options={[]} contextualConfig={{ entityType: "cuenta", originFlow: `tecnica/formulas/${id}` }} />
      },
      {
        id: "stock",
        label: "Stock",
        content: <TraceTimeline nodes={[{ id: "f-1", step: "Preparación", lot: "FOR-LT-01", at: "2026-04-14 10:30", status: "ok" }]} />
      },
      { id: "auditoria", label: "Auditoría", content: <AuditTimeline events={events} /> },
      { id: "adjuntos", label: "Adjuntos", content: <InlineCollectionEditor /> }
    ],
    [events, id]
  );

  return (
    <Layout title="Ficha fórmula" transitionPreset="section-slide">
      <PageHeader title={`Fórmula ${id}`} subtitle="Detalle técnico con deep-linking por tabs y trazabilidad." />
      <DetailTabs tabs={detailTabs} defaultTabId={tabs.includes(current) ? current : "resumen"} onChange={(tabId) => setTab(tabId as FormulaTab)} />
    </Layout>
  );
}
