"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartSelector } from "@/components/ui/SmartSelector";
import { apiRequest, logOriginAudit } from "@/components/workflows/api";

const schema = z.object({
  batchId: z.string().min(1, "Lote padre requerido"),
  skuId: z.string().min(1, "SKU requerido"),
  qty: z.coerce.number().positive("Cantidad a fraccionar inválida"),
  childLotCode: z.string().min(2, "Código de sublote requerido"),
  childQty: z.coerce.number().positive("Cantidad de sublote inválida")
});

type Values = z.infer<typeof schema>;
type Row = { id: string; code: string; status: string; plannedQty: number };

export function FractionationPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const form = useForm<Values>({ defaultValues: { batchId: "", skuId: "", qty: 1, childLotCode: "", childQty: 1 } });

  const loadRows = async () => {
    try {
      const payload = await apiRequest<Array<Record<string, unknown>>>("/production/production-orders");
      setRows(payload.map((row) => ({ id: String(row.id ?? ""), code: String(row.code ?? "-"), status: String(row.status ?? "planned"), plannedQty: Number(row.plannedQty ?? 0) })));
    } catch {
      // mantener formulario operativo aunque falle la tabla
    }
  };

  useEffect(() => { void loadRows(); }, []);

  const submit = form.handleSubmit(async (values) => {
    setError(null);
    setSuccess(null);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof Values;
        form.setError(field, { message: issue.message });
      });
      return;
    }

    try {
      setLoading(true);
      await apiRequest(`/fractionation/${parsed.data.batchId}/fractionate`, {
        method: "POST",
        body: JSON.stringify({ skuId: parsed.data.skuId, qty: parsed.data.qty, childLots: [{ lotCode: parsed.data.childLotCode, qty: parsed.data.childQty }] })
      });

      await logOriginAudit({ entity: "batch", entityId: parsed.data.batchId, action: "fractionate", origin: "operacion/fraccionamiento" });
      setSuccess(`Fraccionamiento aplicado sobre lote ${parsed.data.batchId}.`);
      form.reset({ batchId: "", skuId: "", qty: 1, childLotCode: "", childQty: 1 });
      await loadRows();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo fraccionar");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Layout title="Operación · Fraccionamiento" transitionPreset="elevate-in">
      <PageHeader title="Fraccionamiento" subtitle="Creación de sublotes con control de cantidades y trazabilidad." />
      <form className="card-base space-y-4" onSubmit={submit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Lote padre (ID)</span>
            <input className="input-base w-full" {...form.register("batchId")} placeholder="LOT-001" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Cantidad a fraccionar</span>
            <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("qty")} />
          </label>
        </div>

        <SmartSelector label="SKU destino" value={form.watch("skuId")} onChange={(value) => form.setValue("skuId", value, { shouldValidate: true })} options={[]} contextualConfig={{ entityType: "sku", originFlow: "operacion/fraccionamiento" }} />

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Código sublote</span>
            <input className="input-base w-full" {...form.register("childLotCode")} placeholder="LOT-001-A" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Cantidad sublote</span>
            <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("childQty")} />
          </label>
        </div>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Procesando..." : "Ejecutar fraccionamiento"}</button>
      </form>
      <div className="mt-4">
        <DataTable title="Lotes/OP disponibles" columns={[{ key: "code", header: "Código" }, { key: "status", header: "Estado" }, { key: "plannedQty", header: "Cant. planificada" }]} rows={rows} rowId={(row) => row.id} />
      </div>
    </Layout>
  );
}
