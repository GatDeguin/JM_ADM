"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/env";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { AuditTimeline, type AuditEvent } from "@/components/ui/AuditTimeline";
import { TraceTimeline } from "@/components/ui/TraceTimeline";
import { SmartSelector } from "@/components/ui/SmartSelector";
import { InlineCollectionEditor } from "@/components/ui/InlineCollectionEditor";

const tabs = ["resumen", "composicion", "versiones", "precios", "stock", "auditoria", "adjuntos"] as const;
type FormulaTab = (typeof tabs)[number];

type FormulaVersionRow = {
  id: string;
  version: number;
  status: string;
  FormulaApproval?: Array<{ approvedAt: string }>;
};

type FormulaDetailResponse = {
  FormulaVersion: FormulaVersionRow[];
};

type CompareResponse = {
  diff: {
    components: Array<{ itemId: string; status: string; left: { qty: number; unitId: string } | null; right: { qty: number; unitId: string } | null }>;
    steps: Array<{ stepNo: number; status: string; left: string | null; right: string | null }>;
  };
};

function statusBadge(status: string) {
  const palette: Record<string, string> = {
    added: "bg-emerald-100 text-emerald-700",
    removed: "bg-rose-100 text-rose-700",
    changed: "bg-amber-100 text-amber-700",
    same: "bg-zinc-100 text-zinc-700",
    approved: "bg-emerald-100 text-emerald-700",
    obsolete: "bg-zinc-200 text-zinc-700",
    draft: "bg-amber-100 text-amber-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${palette[status] ?? palette.same}`}>{status}</span>;
}

export function FormulaDetailPage({ id, events }: { id: string; events: AuditEvent[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("tab") as FormulaTab | null) ?? "resumen";
  const [versions, setVersions] = useState<FormulaVersionRow[]>([]);
  const [left, setLeft] = useState<string>("");
  const [right, setRight] = useState<string>("");
  const [compare, setCompare] = useState<CompareResponse | null>(null);

  const setTab = (tab: FormulaTab) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tab);
    router.replace(`${pathname}?${next.toString()}`);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const response = await fetch(`${API_BASE_URL}/formulas/${id}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as FormulaDetailResponse;
      if (!alive) return;
      const list = [...(data.FormulaVersion ?? [])].sort((a, b) => b.version - a.version);
      setVersions(list);
      setLeft(list[0]?.id ?? "");
      setRight(list[1]?.id ?? list[0]?.id ?? "");
    })().catch(() => undefined);

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!left || !right) return;
    let alive = true;
    (async () => {
      const response = await fetch(`${API_BASE_URL}/formulas/compare?left=${encodeURIComponent(left)}&right=${encodeURIComponent(right)}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as CompareResponse;
      if (alive) {
        setCompare(data);
      }
    })().catch(() => undefined);

    return () => {
      alive = false;
    };
  }, [left, right]);

  const versionesContent = (
    <div className="space-y-4">
      <div className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-zinc-800">Timeline de versiones</h3>
        <ul className="space-y-2 text-sm">
          {versions.map((version) => (
            <li key={version.id} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2">
              <div>
                <p className="font-medium text-zinc-800">v{version.version}</p>
                <p className="text-xs text-zinc-500">{version.FormulaApproval?.[0]?.approvedAt ? new Date(version.FormulaApproval[0].approvedAt).toLocaleString() : "Sin aprobación"}</p>
              </div>
              {statusBadge(version.status)}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-zinc-800">Diff visual entre versiones</h3>
        <div className="grid gap-2 md:grid-cols-2">
          <select className="input-base w-full" value={left} onChange={(event) => setLeft(event.target.value)}>
            {versions.map((version) => (
              <option key={`left-${version.id}`} value={version.id}>{`Izquierda · v${version.version}`}</option>
            ))}
          </select>
          <select className="input-base w-full" value={right} onChange={(event) => setRight(event.target.value)}>
            {versions.map((version) => (
              <option key={`right-${version.id}`} value={version.id}>{`Derecha · v${version.version}`}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Componentes</h4>
          {(compare?.diff.components ?? []).map((row) => (
            <div key={row.itemId} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 text-sm">
              <span className="font-medium text-zinc-700">{row.itemId}</span>
              <span className="text-zinc-500">
                {row.left ? `${row.left.qty} ${row.left.unitId}` : "-"} → {row.right ? `${row.right.qty} ${row.right.unitId}` : "-"}
              </span>
              {statusBadge(row.status)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const detailTabs = useMemo(
    () => [
      { id: "resumen", label: "Resumen", content: <p className="text-sm text-zinc-600">Versión vigente, aprobación y metadatos técnicos de la fórmula {id}.</p> },
      { id: "composicion", label: "Composición/Packaging", content: <InlineCollectionEditor /> },
      { id: "versiones", label: "Versiones", content: versionesContent },
      {
        id: "precios",
        label: "Precios",
        content: (
          <SmartSelector
            label="Cuenta técnica"
            value={undefined}
            onChange={() => undefined}
            options={[]}
            contextualConfig={{ entityType: "cuenta", originFlow: `tecnica/formulas/${id}` }}
          />
        ),
      },
      {
        id: "stock",
        label: "Stock",
        content: <TraceTimeline nodes={[{ id: "f-1", step: "Preparación", lot: "FOR-LT-01", at: "2026-04-14 10:30", status: "ok" }]} />,
      },
      { id: "auditoria", label: "Auditoría", content: <AuditTimeline events={events} /> },
      { id: "adjuntos", label: "Adjuntos", content: <InlineCollectionEditor /> },
    ],
    [compare?.diff.components, events, id, left, right, versions],
  );

  return (
    <Layout title="Ficha fórmula" transitionPreset="section-slide">
      <PageHeader title={`Fórmula ${id}`} subtitle="Detalle técnico con deep-linking por tabs y trazabilidad." />
      <DetailTabs tabs={detailTabs} defaultTabId={tabs.includes(current) ? current : "resumen"} onChange={(tabId) => setTab(tabId as FormulaTab)} />
    </Layout>
  );
}
