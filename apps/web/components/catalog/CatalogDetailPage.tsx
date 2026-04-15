"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { SmartSelector } from "@/components/ui/SmartSelector";
import { InlineCollectionEditor } from "@/components/ui/InlineCollectionEditor";
import { AuditTimeline, type AuditEvent } from "@/components/ui/AuditTimeline";
import { TraceTimeline, type TraceNode } from "@/components/ui/TraceTimeline";

type DetailKind = "producto-base" | "sku";

type Props = {
  id: string;
  kind: DetailKind;
  auditEvents: AuditEvent[];
};

const traceNodes: TraceNode[] = [
  { id: "tr-1", step: "Recepción", lot: "LT-1021", at: "2026-04-10 09:10", status: "ok" },
  { id: "tr-2", step: "Fraccionamiento", lot: "LT-1021", at: "2026-04-10 12:05", status: "ok" },
  { id: "tr-3", step: "Despacho", lot: "LT-1021", at: "2026-04-11 08:45", status: "warning" }
];

const TAB_IDS = ["resumen", "composicion", "precios", "stock", "auditoria", "adjuntos"] as const;
type TabId = (typeof TAB_IDS)[number];

export function CatalogDetailPage({ id, kind, auditEvents }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as TabId | null;
  const tab = requestedTab && TAB_IDS.includes(requestedTab) ? requestedTab : "resumen";

  const setTab = (tabId: TabId) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tabId);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const title = kind === "producto-base" ? `Producto base ${id}` : `SKU ${id}`;
  const subtitle = kind === "producto-base" ? "Ficha maestra de formulación, pricing y control" : "Ficha comercial-operativa con trazabilidad completa";
  const backHref = kind === "producto-base" ? "/catalogo/productos-base" : "/catalogo/skus";

  const tabs = useMemo(
    () => [
      {
        id: "resumen",
        label: "Resumen",
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-lg border p-3 text-sm">
              <h3 className="font-semibold">Datos principales</h3>
              <p className="text-zinc-600">ID: {id}</p>
              <p className="text-zinc-600">Estado: activo</p>
              <p className="text-zinc-600">Unidad principal: KG</p>
            </article>
            <SmartSelector
              label="Referencias relacionadas"
              value={undefined}
              onChange={() => undefined}
              options={[]}
              contextualConfig={{ entityType: kind === "producto-base" ? "presentacion" : "alias", originFlow: `catalogo/${kind}/${id}` }}
            />
          </div>
        )
      },
      {
        id: "composicion",
        label: "Composición/Packaging",
        content: (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">Edición rápida de componentes, materiales y presentaciones.</p>
            <InlineCollectionEditor />
          </div>
        )
      },
      {
        id: "precios",
        label: "Precios",
        content: (
          <div className="space-y-3">
            <SmartSelector
              label="Lista comercial"
              value={undefined}
              onChange={() => undefined}
              options={[]}
              contextualConfig={{ entityType: "lista", originFlow: `catalogo/${kind}/${id}` }}
            />
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">Última actualización de precio: 2026-04-12 · Moneda ARS.</p>
          </div>
        )
      },
      {
        id: "stock",
        label: "Stock",
        content: <TraceTimeline nodes={traceNodes} />
      },
      {
        id: "auditoria",
        label: "Auditoría",
        content: <AuditTimeline events={auditEvents} />
      },
      {
        id: "adjuntos",
        label: "Adjuntos",
        content: (
          <div className="space-y-3 text-sm">
            <p className="rounded-lg border border-dashed border-zinc-300 p-3">Arrastrá o vinculá documentación técnica/comercial.</p>
            <InlineCollectionEditor />
          </div>
        )
      }
    ],
    [auditEvents, id, kind]
  );

  return (
    <Layout title={`Catálogo · ${title}`} transitionPreset="section-slide">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="card-base mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">Deep-link activo: <code className="rounded bg-zinc-100 px-1 py-0.5">?tab={tab}</code></p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="font-medium text-indigo-700" href={backHref}>Volver al listado</Link>
          <Link className="font-medium text-indigo-700" href="/comercial/pedidos/nuevo?step=cabecera">Crear venta</Link>
        </div>
      </div>
      <div className="mb-3 md:hidden">
        <label className="text-xs font-semibold uppercase text-zinc-500" htmlFor="mobile-tab">Sección</label>
        <select id="mobile-tab" className="input-base mt-1 w-full" value={tab} onChange={(event) => setTab(event.target.value as TabId)}>
          {tabs.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>
      <DetailTabs tabs={tabs} defaultTabId={tab} onChange={(tabId) => setTab(tabId as TabId)} className="hidden md:block" />
      <div className="md:hidden">{tabs.find((item) => item.id === tab)?.content}</div>
    </Layout>
  );
}
