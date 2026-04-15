"use client";

import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiRequest } from "@/components/workflows/api";

type Row = { id: string; code: string; status: string; productBaseId: string; plannedQty: number };

export function LotesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const payload = await apiRequest<Array<Record<string, unknown>>>("/production/production-orders");
        setRows(payload.map((r) => ({ id: String(r.id ?? ""), code: String(r.code ?? "-"), status: String(r.status ?? "planned"), productBaseId: String(r.productBaseId ?? "-"), plannedQty: Number(r.plannedQty ?? 0) })));
      } catch (e) { setError(e instanceof Error ? e.message : "No se pudo cargar lotes"); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  return <Layout title="Stock · Lotes" transitionPreset="elevate-in"><PageHeader title="Lotes" subtitle="Seguimiento de lotes desde órdenes de producción reales." />
    <DataTable title="Lotes / OP" loading={loading} error={error} columns={[{ key: "code", header: "Lote/OP" }, { key: "status", header: "Estado" }, { key: "productBaseId", header: "Producto base" }, { key: "plannedQty", header: "Cant. planificada" }]} rows={rows} rowId={(r) => r.id} />
  </Layout>;
}
