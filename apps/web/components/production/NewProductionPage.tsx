"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartSelector } from "@/components/ui/SmartSelector";
import { logOriginAudit, apiRequest } from "@/components/workflows/api";

const schema = z.object({
  code: z.string().min(2, "Código requerido"),
  productBaseId: z.string().min(1, "Producto base requerido"),
  formulaVersionId: z.string().min(1, "Versión de fórmula requerida"),
  plannedQty: z.coerce.number().positive("La cantidad planificada debe ser mayor a 0")
});

type Values = z.infer<typeof schema>;

type ProductionOrderResponse = { id: string; code?: string };

export function NewProductionPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<Values>({
    defaultValues: { code: "", productBaseId: "", formulaVersionId: "", plannedQty: 1 }
  });

  const preWarnings = [
    !form.watch("productBaseId") ? "Seleccioná producto base para crear la OP." : null,
    !form.watch("formulaVersionId") ? "Seleccioná versión de fórmula aprobada." : null,
    Number(form.watch("plannedQty") ?? 0) <= 0 ? "La cantidad planificada debe ser mayor a 0." : null,
  ].filter((warning): warning is string => Boolean(warning));
  const canSubmit = preWarnings.length === 0 && !loading;

  const onSubmit = form.handleSubmit(async (values) => {
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
      const created = await apiRequest<ProductionOrderResponse>("/production/production-orders", {
        method: "POST",
        body: JSON.stringify(parsed.data)
      });

      await logOriginAudit({
        entity: "production-order",
        entityId: created?.id ?? parsed.data.code,
        action: "create",
        origin: "operacion/produccion/nueva"
      });

      setSuccess(`Orden ${created?.code ?? parsed.data.code} creada correctamente.`);
      form.reset({ code: "", productBaseId: "", formulaVersionId: "", plannedQty: 1 });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear la orden");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Layout title="Operación · Producción nueva" transitionPreset="elevate-in">
      <PageHeader title="Producción nueva" subtitle="Alta de orden con validaciones de fórmula, producto y cantidad." />
      <form className="card-base space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Código de orden</span>
            <input className="input-base w-full" {...form.register("code")} placeholder="OP-2026-001" />
            {form.formState.errors.code ? <p className="text-xs text-red-600">{form.formState.errors.code.message}</p> : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Cantidad planificada</span>
            <input className="input-base w-full" type="number" min={1} step="0.01" {...form.register("plannedQty")} />
            {form.formState.errors.plannedQty ? <p className="text-xs text-red-600">{form.formState.errors.plannedQty.message}</p> : null}
          </label>
          <SmartSelector
            label="Producto base"
            value={form.watch("productBaseId")}
            onChange={(value) => form.setValue("productBaseId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "producto", originFlow: "operacion/produccion/nueva" }}
          />
          <SmartSelector
            label="Versión de fórmula"
            value={form.watch("formulaVersionId")}
            onChange={(value) => form.setValue("formulaVersionId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "formula_version", originFlow: "operacion/produccion/nueva" }}
          />
        </div>

        {preWarnings.length ? <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{preWarnings.map((warning) => <p key={warning}>⚠ {warning}</p>)}</div> : null}
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <button className="btn-primary" type="submit" disabled={!canSubmit}>
          {loading ? "Creando..." : "Crear orden"}
        </button>
      </form>
    </Layout>
  );
}
