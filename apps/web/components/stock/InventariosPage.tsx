"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiRequest, logOriginAudit } from "@/components/workflows/api";

const schema = z.object({ type: z.enum(["cycle", "physical"]), itemId: z.string().min(1), warehouseId: z.string().min(1), locationId: z.string().min(1), countedQty: z.coerce.number().nonnegative(), note: z.string().optional() });

type Values = z.infer<typeof schema>;
type Row = { id: string; type: string; itemId: string; countedQty: number; warehouseId: string; locationId: string };

export function InventariosPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const form = useForm<Values>({ defaultValues: { type: "cycle", itemId: "", warehouseId: "", locationId: "", countedQty: 0, note: "" } });

  const load = async () => {
    setLoading(true);
    try {
      const [cycle, physical] = await Promise.all([
        apiRequest<Array<Record<string, unknown>>>("/stock/cycle-counts"),
        apiRequest<Array<Record<string, unknown>>>("/stock/physical-inventories"),
      ]);
      const mapped = [...cycle, ...physical].map((r, index) => ({ id: String(r.id ?? `count-${index}`), type: String(r.type ?? "-"), itemId: String(r.itemId ?? "-"), countedQty: Number(r.countedQty ?? 0), warehouseId: String(r.warehouseId ?? "-"), locationId: String(r.locationId ?? "-") }));
      setRows(mapped);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo cargar inventarios"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const submit = form.handleSubmit(async (values) => {
    setError(null); setSuccess(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;
    try {
      const created = await apiRequest<{ id: string }>("/stock/counts", { method: "POST", body: JSON.stringify(parsed.data) });
      await logOriginAudit({ entity: "inventory-count", entityId: created.id, action: "create", origin: "stock/inventarios" });
      setSuccess("Conteo registrado.");
      form.reset({ type: "cycle", itemId: "", warehouseId: "", locationId: "", countedQty: 0, note: "" });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo registrar conteo"); }
  });

  return <Layout title="Stock · Inventarios" transitionPreset="elevate-in"><PageHeader title="Inventarios" subtitle="Conteos cíclicos/físicos con carga real y auditoría." />
    <form className="card-base mb-4 grid gap-3 md:grid-cols-2" onSubmit={submit}>
      <select className="input-base" {...form.register("type")}><option value="cycle">Cíclico</option><option value="physical">Físico</option></select>
      <input className="input-base" placeholder="itemId" {...form.register("itemId")} />
      <input className="input-base" placeholder="warehouseId" {...form.register("warehouseId")} />
      <input className="input-base" placeholder="locationId" {...form.register("locationId")} />
      <input className="input-base" type="number" min={0} step="0.01" {...form.register("countedQty")} />
      <input className="input-base" placeholder="Nota" {...form.register("note")} />
      {error ? <p className="text-sm text-red-700 md:col-span-2">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700 md:col-span-2">{success}</p> : null}
      <button className="btn-primary md:col-span-2" type="submit" disabled={loading}>{loading ? "Guardando..." : "Registrar conteo"}</button>
    </form>
    <DataTable title="Conteos" loading={loading} error={error} columns={[{ key: "type", header: "Tipo" }, { key: "itemId", header: "Ítem" }, { key: "countedQty", header: "Cantidad" }, { key: "warehouseId", header: "Depósito" }, { key: "locationId", header: "Ubicación" }]} rows={rows} rowId={(r) => r.id} />
  </Layout>;
}
