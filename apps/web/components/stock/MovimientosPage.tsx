"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiRequest, logOriginAudit } from "@/components/workflows/api";

const schema = z.object({
  itemId: z.string().min(1, "Ítem requerido"),
  warehouseId: z.string().min(1, "Depósito requerido"),
  locationId: z.string().min(1, "Ubicación requerida"),
  qty: z.coerce.number().positive("Cantidad inválida"),
  reason: z.string().min(3, "Motivo requerido"),
});

type Values = z.infer<typeof schema>;
type Row = { id: string; itemId: string; warehouseId: string; locationId: string; qty: number; reason: string };

export function MovimientosPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const form = useForm<Values>({ defaultValues: { itemId: "", warehouseId: "", locationId: "", qty: 1, reason: "" } });

  const loadRows = async () => {
    setLoading(true);
    try {
      const payload = await apiRequest<Array<Record<string, unknown>>>("/inventory/inventory-adjustments");
      setRows(payload.map((r) => ({ id: String(r.id ?? ""), itemId: String(r.itemId ?? "-"), warehouseId: String(r.warehouseId ?? "-"), locationId: String(r.locationId ?? "-"), qty: Number(r.qty ?? 0), reason: String(r.reason ?? "-") })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar movimientos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadRows(); }, []);

  const submit = form.handleSubmit(async (values) => {
    setError(null); setSuccess(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) { parsed.error.issues.forEach((i) => form.setError(i.path[0] as keyof Values, { message: i.message })); return; }
    try {
      const created = await apiRequest<{ id: string }>("/inventory/inventory-adjustments", { method: "POST", body: JSON.stringify(parsed.data) });
      await logOriginAudit({ entity: "inventory-adjustment", entityId: created.id, action: "create", origin: "stock/movimientos" });
      setSuccess("Movimiento registrado.");
      form.reset({ itemId: "", warehouseId: "", locationId: "", qty: 1, reason: "" });
      await loadRows();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo registrar"); }
  });

  return <Layout title="Stock · Movimientos" transitionPreset="elevate-in"><PageHeader title="Movimientos" subtitle="Ajustes de inventario con endpoint real y tabla operativa." />
    <form className="card-base mb-4 grid gap-3 md:grid-cols-2" onSubmit={submit}>
      <input className="input-base" placeholder="itemId" {...form.register("itemId")} />
      <input className="input-base" placeholder="warehouseId" {...form.register("warehouseId")} />
      <input className="input-base" placeholder="locationId" {...form.register("locationId")} />
      <input className="input-base" type="number" min={0.01} step="0.01" {...form.register("qty")} />
      <input className="input-base md:col-span-2" placeholder="Motivo" {...form.register("reason")} />
      {error ? <p className="text-sm text-red-700 md:col-span-2">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700 md:col-span-2">{success}</p> : null}
      <button className="btn-primary md:col-span-2" type="submit" disabled={loading}>{loading ? "Guardando..." : "Registrar"}</button>
    </form>
    <DataTable title="Ajustes de inventario" loading={loading} error={error} columns={[{ key: "itemId", header: "Ítem" }, { key: "warehouseId", header: "Depósito" }, { key: "locationId", header: "Ubicación" }, { key: "qty", header: "Cantidad" }, { key: "reason", header: "Motivo" }]} rows={rows} rowId={(r) => r.id} />
  </Layout>;
}
