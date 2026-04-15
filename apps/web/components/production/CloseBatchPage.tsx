"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { TraceTimeline } from "@/components/ui/TraceTimeline";
import { apiRequest, logOriginAudit } from "@/components/workflows/api";

const schema = z.object({
  responsible: z.string().min(1, "Responsable requerido"),
  outputItemId: z.string().min(1, "Output requerido"),
  outputQty: z.coerce.number().positive("Cantidad de output inválida"),
  wasteReason: z.string().optional(),
  wasteQty: z.coerce.number().optional()
});

type Values = z.infer<typeof schema>;

export function CloseBatchPage({ batchId }: { batchId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<Values>({
    defaultValues: { responsible: "", outputItemId: "", outputQty: 1, wasteReason: "", wasteQty: undefined }
  });

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
      await apiRequest(`/production/${batchId}/close-batch`, {
        method: "POST",
        body: JSON.stringify({
          responsible: parsed.data.responsible,
          consumptions: [],
          outputs: [{ itemId: parsed.data.outputItemId, qty: parsed.data.outputQty }],
          wastes:
            parsed.data.wasteReason && parsed.data.wasteQty && parsed.data.wasteQty > 0
              ? [{ reason: parsed.data.wasteReason, qty: parsed.data.wasteQty }]
              : []
        })
      });

      await logOriginAudit({ entity: "batch", entityId: batchId, action: "close", origin: "operacion/lotes/[id]" });
      setSuccess(`Lote ${batchId} cerrado correctamente.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo cerrar el lote");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Layout title="Operación · Cierre de lote" transitionPreset="section-slide">
      <PageHeader title={`Lote ${batchId}`} subtitle="Cierre productivo con validaciones de outputs, mermas y responsable." />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <form className="card-base space-y-3" onSubmit={submit}>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Responsable</span>
            <input className="input-base w-full" {...form.register("responsible")} placeholder="usr-produccion" />
            {form.formState.errors.responsible ? <p className="text-xs text-red-600">{form.formState.errors.responsible.message}</p> : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Output ítem ID</span>
            <input className="input-base w-full" {...form.register("outputItemId")} placeholder="sku-terminado" />
            {form.formState.errors.outputItemId ? <p className="text-xs text-red-600">{form.formState.errors.outputItemId.message}</p> : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Cantidad output</span>
            <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("outputQty")} />
            {form.formState.errors.outputQty ? <p className="text-xs text-red-600">{form.formState.errors.outputQty.message}</p> : null}
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Motivo merma (opcional)</span>
              <input className="input-base w-full" {...form.register("wasteReason")} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Cantidad merma</span>
              <input className="input-base w-full" type="number" min={0} step="0.01" {...form.register("wasteQty")} />
            </label>
          </div>

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Cerrando..." : "Cerrar lote"}
          </button>
        </form>

        <TraceTimeline
          nodes={[
            { id: "n1", step: "Recepción", lot: batchId, at: "2026-04-14 06:30", status: "ok" },
            { id: "n2", step: "Fraccionamiento", lot: batchId, at: "2026-04-14 08:10", status: "warning" },
            { id: "n3", step: "Liberación", lot: batchId, at: "2026-04-14 10:15", status: "ok" }
          ]}
        />
      </div>
    </Layout>
  );
}
