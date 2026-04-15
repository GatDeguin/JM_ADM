"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { DataTable } from "@/components/ui/DataTable";
import { KPIStatCard } from "@/components/ui/KPIStatCard";
import { PageHeader } from "@/components/ui/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Filters = {
  startDate: string;
  endDate: string;
  channel: string;
  line: string;
  customerId: string;
};

type Props = {
  title: string;
  subtitle: string;
  mode: "reportes" | "margenes" | "calidad" | "costos";
};

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
}

function toQuery(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.startDate) params.set("startDate", `${filters.startDate}T00:00:00.000Z`);
  if (filters.endDate) params.set("endDate", `${filters.endDate}T23:59:59.999Z`);
  if (filters.channel) params.set("channel", filters.channel);
  if (filters.line) params.set("line", filters.line);
  if (filters.customerId) params.set("customerId", filters.customerId);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportingWorkspace({ title, subtitle, mode }: Props) {
  const [filters, setFilters] = useState<Filters>({ startDate: "", endDate: "", channel: "", line: "", customerId: "" });
  const [dashboard, setDashboard] = useState<Record<string, any> | null>(null);
  const [dataQualityLists, setDataQualityLists] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [snapshotMessage, setSnapshotMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = toQuery(filters);
      const [dash, lists] = await Promise.all([
        request(`/reporting/dashboard${query}`),
        request("/reporting/data-quality/lists"),
      ]);
      setDashboard(dash);
      setDataQualityLists(lists);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar reporting");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const marginRows = useMemo(
    () =>
      dashboard
        ? [
            {
              ventas: Number(dashboard?.margins?.sales ?? 0),
              costos: Number(dashboard?.margins?.costs ?? 0),
              margen_valor: Number(dashboard?.margins?.grossMarginValue ?? 0),
              margen_pct: Number(dashboard?.margins?.grossMarginPct ?? 0),
            },
          ]
        : [],
    [dashboard],
  );

  return (
    <Layout title={title} transitionPreset="soft-fade">
      <PageHeader title={title} subtitle={subtitle} />

      <section className="card-base">
        <div className="grid gap-2 md:grid-cols-5">
          <input className="input-base" type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
          <input className="input-base" type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
          <input className="input-base" placeholder="Canal" value={filters.channel} onChange={(e) => setFilters((prev) => ({ ...prev, channel: e.target.value }))} />
          <input className="input-base" placeholder="Línea" value={filters.line} onChange={(e) => setFilters((prev) => ({ ...prev, line: e.target.value }))} />
          <input className="input-base" placeholder="Cliente (id)" value={filters.customerId} onChange={(e) => setFilters((prev) => ({ ...prev, customerId: e.target.value }))} />
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn-primary" onClick={() => void load()} disabled={loading}>Aplicar filtros</button>
          <button
            className="btn-secondary"
            onClick={async () => {
              const period = new Date().toISOString().slice(0, 7);
              await request("/reporting/snapshots/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ period }),
              });
              setSnapshotMessage(`Snapshots generados para ${period}`);
            }}
          >
            Generar snapshots
          </button>
        </div>
        {snapshotMessage ? <p className="mt-2 text-sm text-emerald-700">{snapshotMessage}</p> : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </section>

      <div className="grid gap-3 md:grid-cols-4">
        <KPIStatCard label="Ventas" value={dashboard?.sales?.billed ?? 0} />
        <KPIStatCard label="Margen %" value={`${dashboard?.margins?.grossMarginPct ?? 0}%`} />
        <KPIStatCard label="Lotes abiertos" value={dashboard?.production?.open ?? 0} />
        <KPIStatCard label="Stock disponible" value={dashboard?.stock?.availableQty ?? 0} />
      </div>

      {(mode === "reportes" || mode === "costos") && dashboard ? (
        <section className="card-base space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Reportes operativos</h3>
            <button className="btn-secondary" onClick={() => downloadCsv("reportes.csv", [dashboard.production, dashboard.stock, dashboard.sales, dashboard.finance])}>
              Exportar CSV
            </button>
          </div>
          <pre className="overflow-x-auto rounded bg-zinc-50 p-3 text-xs">{JSON.stringify({ production: dashboard.production, stock: dashboard.stock, sales: dashboard.sales, finance: dashboard.finance }, null, 2)}</pre>
        </section>
      ) : null}

      {(mode === "margenes" || mode === "reportes") ? (
        <DataTable
          title="Reporte de márgenes"
          columns={[
            { key: "ventas", header: "Ventas" },
            { key: "costos", header: "Costos" },
            { key: "margen_valor", header: "Margen valor" },
            { key: "margen_pct", header: "Margen %" },
          ]}
          rows={marginRows}
          rowId={() => "margin-row"}
          loading={loading}
          onCreate={() => downloadCsv("margenes.csv", marginRows)}
        />
      ) : null}

      {(mode === "calidad" || mode === "reportes") && dataQualityLists ? (
        <section className="card-base space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Calidad de datos (listas accionables)</h3>
            <button
              className="btn-secondary"
              onClick={() =>
                downloadCsv("calidad-dato.csv", [
                  { lista: "alias_pendientes", cantidad: dataQualityLists.pendingAliases.length },
                  { lista: "duplicados", cantidad: dataQualityLists.duplicateAliases.length },
                  { lista: "skus_sin_precio", cantidad: dataQualityLists.skusWithoutPrice.length },
                  { lista: "formulas_warning", cantidad: dataQualityLists.formulasWithWarning.length },
                  { lista: "items_sin_costo", cantidad: dataQualityLists.itemsWithoutCost.length },
                  { lista: "lotes_retenidos", cantidad: dataQualityLists.retainedLots.length },
                ])
              }
            >
              Exportar CSV
            </button>
          </div>
          <ul className="grid gap-1 text-sm">
            <li>Alias pendientes: {dataQualityLists.pendingAliases.length}</li>
            <li>Duplicados: {dataQualityLists.duplicateAliases.length}</li>
            <li>SKUs sin precio: {dataQualityLists.skusWithoutPrice.length}</li>
            <li>Fórmulas con warning: {dataQualityLists.formulasWithWarning.length}</li>
            <li>Ítems sin costo: {dataQualityLists.itemsWithoutCost.length}</li>
            <li>Lotes retenidos: {dataQualityLists.retainedLots.length}</li>
          </ul>
        </section>
      ) : null}
    </Layout>
  );
}
