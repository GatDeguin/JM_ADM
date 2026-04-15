"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartSelector } from "@/components/ui/SmartSelector";
import { apiRequest, logOriginAudit } from "@/components/workflows/api";

const schema = z.object({
  code: z.string().min(2, "Código requerido"),
  customerId: z.string().min(1, "Cliente requerido"),
  priceListId: z.string().min(1, "Lista de precios requerida"),
  skuId: z.string().min(1, "SKU requerido"),
  qty: z.coerce.number().positive("Cantidad inválida"),
  unitPrice: z.coerce.number().positive("Precio unitario inválido")
});

type Values = z.infer<typeof schema>;
type SalesResponse = { id: string; code: string };

export function NewSalePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<Values>({
    defaultValues: { code: "", customerId: "", priceListId: "", skuId: "", qty: 1, unitPrice: 1 }
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
      const total = parsed.data.qty * parsed.data.unitPrice;

      const created = await apiRequest<SalesResponse>("/sales/sales-orders", {
        method: "POST",
        body: JSON.stringify({
          code: parsed.data.code,
          customerId: parsed.data.customerId,
          priceListId: parsed.data.priceListId,
          total,
          items: [{ skuId: parsed.data.skuId, qty: parsed.data.qty }]
        })
      });

      await logOriginAudit({ entity: "sales-order", entityId: created.id, action: "create", origin: "comercial/ventas/pedidos" });
      setSuccess(`Venta ${created.code} creada por ${total.toFixed(2)}.`);
      form.reset({ code: "", customerId: "", priceListId: "", skuId: "", qty: 1, unitPrice: 1 });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear la venta");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Layout title="Comercial · Nueva venta" transitionPreset="elevate-in">
      <PageHeader title="Nueva venta" subtitle="Pedido comercial con alta contextual de cliente/lista/SKU desde el mismo flujo." />
      <form className="card-base space-y-4" onSubmit={submit}>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm md:col-span-1">
            <span className="font-medium">Código</span>
            <input className="input-base w-full" {...form.register("code")} placeholder="SO-2026-001" />
            {form.formState.errors.code ? <p className="text-xs text-red-600">{form.formState.errors.code.message}</p> : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Cantidad</span>
            <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("qty")} />
            {form.formState.errors.qty ? <p className="text-xs text-red-600">{form.formState.errors.qty.message}</p> : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Precio unitario</span>
            <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("unitPrice")} />
            {form.formState.errors.unitPrice ? <p className="text-xs text-red-600">{form.formState.errors.unitPrice.message}</p> : null}
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SmartSelector
            label="Cliente"
            value={form.watch("customerId")}
            onChange={(value) => form.setValue("customerId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "cliente", originFlow: "comercial/ventas/pedidos" }}
          />
          <SmartSelector
            label="Lista de precios"
            value={form.watch("priceListId")}
            onChange={(value) => form.setValue("priceListId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "lista", originFlow: "comercial/ventas/pedidos" }}
          />
          <SmartSelector
            label="SKU"
            value={form.watch("skuId")}
            onChange={(value) => form.setValue("skuId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "sku", originFlow: "comercial/ventas/pedidos" }}
          />
        </div>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Crear venta"}
        </button>
      </form>
    </Layout>
  );
}
