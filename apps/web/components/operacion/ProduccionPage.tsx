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
  code: z.string().min(2, "Código requerido"),
  productBaseId: z.string().min(1, "Producto base requerido"),
  formulaVersionId: z.string().min(1, "Versión de fórmula requerida"),
  plannedQty: z.coerce.number().positive("La cantidad planificada debe ser mayor a 0"),
});

type Values = z.infer<typeof schema>;

type ProductionOrder = {
  id: string;
  code: string;
  status: string;
  productBaseId: string;
  formulaVersionId: string;
  plannedQty: number;
  createdAt?: string;
  updatedAt?: string;
};

export function ProduccionPage() {
  const [rows, setRows] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<Values>({
    defaultValues: { code: "", productBaseId: "", formulaVersionId: "", plannedQty: 1 },
  });

  const loadRows = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Array<Record<string, unknown>>>("/production/production-orders");
      setRows(
        data.map((row) => ({
          id: String(row.id ?? ""),
          code: String(row.code ?? "-"),
          status: String(row.status ?? "planned"),
          productBaseId: String(row.productBaseId ?? "-"),
          formulaVersionId: String(row.formulaVersionId ?? "-"),
          plannedQty: Number(row.plannedQty ?? 0),
          createdAt: String(row.createdAt ?? ""),
          updatedAt: String(row.updatedAt ?? ""),
        })),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar producción");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
  }, []);

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
      const created = await apiRequest<{ id: string; code?: string }>("/production/production-orders", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });

      await logOriginAudit({
        entity: "production-order",
        entityId: created.id,
        action: "create",
        origin: "operacion/produccion",
      });

      setSuccess(`Orden ${created.code ?? parsed.data.code} creada correctamente.`);
      form.reset({ code: "", productBaseId: "", formulaVersionId: "", plannedQty: 1 });
      await loadRows();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear la orden");
    }
  });

  return (
    <Layout title="Operación · Producción" transitionPreset="elevate-in">
      <PageHeader title="Producción" subtitle="Órdenes reales de producción con alta contextual y trazabilidad de origen." />
      <form className="card-base mb-4 space-y-4" onSubmit={submit}>
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
            contextualConfig={{ entityType: "producto", originFlow: "operacion/produccion" }}
          />
          <SmartSelector
            label="Versión de fórmula"
            value={form.watch("formulaVersionId")}
            onChange={(value) => form.setValue("formulaVersionId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "formula_version", originFlow: "operacion/produccion" }}
          />
        </div>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Crear orden"}
        </button>
      </form>

      <DataTable
        title="Órdenes de producción"
        loading={loading}
        error={error}
        successMessage={success}
        columns={[
          { key: "code", header: "Código" },
          { key: "status", header: "Estado" },
          { key: "productBaseId", header: "Producto base" },
          { key: "formulaVersionId", header: "Fórmula" },
          { key: "plannedQty", header: "Planificado" },
        ]}
        rows={rows}
        rowId={(row) => row.id}
      />
    </Layout>
  );
}
