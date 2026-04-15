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
  customerId: z.string().min(1, "Cliente requerido"),
  priceListId: z.string().min(1, "Lista de precio requerida"),
  skuId: z.string().min(1, "SKU requerido"),
  qty: z.coerce.number().positive("Cantidad inválida"),
  total: z.coerce.number().positive("Total inválido"),
});

type Values = z.infer<typeof schema>;

type SalesOrderRow = { id: string; code: string; status: string; customerId: string; total: number; updatedAt: string };

export function PedidosPage() {
  const [rows, setRows] = useState<SalesOrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<Values>({
    defaultValues: { code: "", customerId: "", priceListId: "", skuId: "", qty: 1, total: 1 },
  });

  const loadRows = async () => {
    setLoading(true);
    try {
      const payload = await apiRequest<Array<Record<string, unknown>>>("/commercial/sales/sales-orders");
      setRows(
        payload.map((row) => ({
          id: String(row.id ?? ""),
          code: String(row.code ?? "-"),
          status: String(row.status ?? "draft"),
          customerId: String(row.customerId ?? "-"),
          total: Number(row.total ?? 0),
          updatedAt: String(row.updatedAt ?? row.createdAt ?? "-"),
        })),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar pedidos");
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
      const created = await apiRequest<{ id: string; code: string }>("/commercial/sales/sales-orders", {
        method: "POST",
        body: JSON.stringify({
          code: parsed.data.code,
          customerId: parsed.data.customerId,
          priceListId: parsed.data.priceListId,
          total: parsed.data.total,
          items: [{ skuId: parsed.data.skuId, qty: parsed.data.qty }],
        }),
      });

      await logOriginAudit({ entity: "sales-order", entityId: created.id, action: "create", origin: "comercial/pedidos" });
      setSuccess(`Pedido ${created.code} registrado.`);
      form.reset({ code: "", customerId: "", priceListId: "", skuId: "", qty: 1, total: 1 });
      await loadRows();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear el pedido");
    }
  });

  return (
    <Layout title="Comercial · Pedidos" transitionPreset="elevate-in">
      <PageHeader title="Pedidos" subtitle="Alta transaccional real con cliente/lista/SKU y tabla de pedidos existentes." />
      <form className="card-base mb-4 space-y-4" onSubmit={submit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Código</span>
            <input className="input-base w-full" {...form.register("code")} placeholder="PV-2026-001" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Total</span>
            <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("total")} />
          </label>
          <SmartSelector
            label="Cliente"
            value={form.watch("customerId")}
            onChange={(value) => form.setValue("customerId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "cliente", originFlow: "comercial/pedidos" }}
          />
          <SmartSelector
            label="Lista de precios"
            value={form.watch("priceListId")}
            onChange={(value) => form.setValue("priceListId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "lista", originFlow: "comercial/pedidos" }}
          />
          <SmartSelector
            label="SKU"
            value={form.watch("skuId")}
            onChange={(value) => form.setValue("skuId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "sku", originFlow: "comercial/pedidos", context: { source: "line-item" } }}
          />
          <label className="space-y-1 text-sm">
            <span className="font-medium">Cantidad</span>
            <input className="input-base w-full" type="number" min={1} step="0.01" {...form.register("qty")} />
          </label>
        </div>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Crear pedido"}
        </button>
      </form>

      <DataTable
        title="Pedidos de venta"
        loading={loading}
        error={error}
        columns={[
          { key: "code", header: "Código" },
          { key: "status", header: "Estado" },
          { key: "customerId", header: "Cliente" },
          { key: "total", header: "Total" },
          { key: "updatedAt", header: "Actualizado" },
        ]}
        rows={rows}
        rowId={(row) => row.id}
      />
    </Layout>
  );
}
