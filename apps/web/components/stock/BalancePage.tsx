"use client";

import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiRequest } from "@/components/workflows/api";

type Row = { id: string; itemId: string; warehouseId: string; locationId: string; availableQty: number };

export function BalancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const payload = await apiRequest<Array<Record<string, unknown>>>("/inventory/balances");
        setRows(payload.map((r, index) => ({ id: String(r.id ?? `${r.itemId ?? "item"}-${index}`), itemId: String(r.itemId ?? "-"), warehouseId: String(r.warehouseId ?? "-"), locationId: String(r.locationId ?? "-"), availableQty: Number(r.availableQty ?? r.qty ?? 0) })));
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar balances");
      } finally { setLoading(false); }
    };
    void load();
  }, []);

  return (
    <Layout title="Stock · Balance" transitionPreset="elevate-in">
      <PageHeader title="Balance de stock" subtitle="Consulta real de saldos por ítem/depósito/ubicación." />
      <DataTable
        title="Saldos"
        loading={loading}
        error={error}
        columns={[{ key: "itemId", header: "Ítem" }, { key: "warehouseId", header: "Depósito" }, { key: "locationId", header: "Ubicación" }, { key: "availableQty", header: "Disponible" }]}
        rows={rows}
        rowId={(row) => row.id}
      />
    </Layout>
  );
}
