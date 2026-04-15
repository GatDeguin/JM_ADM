"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartSelector } from "@/components/ui/SmartSelector";
import { apiRequest, logOriginAudit } from "@/components/workflows/api";

const schema = z.object({ code: z.string().min(2), cashAccountId: z.string().min(1), amount: z.coerce.number().positive(), receivableId: z.string().min(1), allocatedAmount: z.coerce.number().positive() });
type Values = z.infer<typeof schema>;
type ReceiptResponse = { id?: string; code: string };
type ReceivableRow = { id: string; code: string; customerId: string; status: string; balance: number };

export function ReceiptsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rows, setRows] = useState<ReceivableRow[]>([]);

  const form = useForm<Values>({ defaultValues: { code: "", cashAccountId: "", amount: 1, receivableId: "", allocatedAmount: 1 } });

  const loadRows = async () => {
    try {
      const payload = await apiRequest<Array<Record<string, unknown>>>("/receivables/accounts-receivable");
      setRows(payload.map((row) => ({ id: String(row.id ?? ""), code: String(row.code ?? "-"), customerId: String(row.customerId ?? "-"), status: String(row.status ?? "open"), balance: Number(row.balance ?? row.amount ?? 0) })));
    } catch {
      // no romper el formulario si falla la tabla
    }
  };

  useEffect(() => { void loadRows(); }, []);

  const submit = form.handleSubmit(async (values) => {
    setError(null);
    setSuccess(null);

    const parsed = schema.safeParse(values);
    if (!parsed.success) return;

    try {
      setLoading(true);
      if (parsed.data.allocatedAmount > parsed.data.amount) {
        form.setError("allocatedAmount", { message: "La imputación no puede exceder el importe recibido" });
        return;
      }

      const created = await apiRequest<ReceiptResponse>("/receivables/receipts/apply", {
        method: "POST",
        body: JSON.stringify({ code: parsed.data.code, cashAccountId: parsed.data.cashAccountId, amount: parsed.data.amount, allocations: [{ receivableId: parsed.data.receivableId, amount: parsed.data.allocatedAmount }] })
      });

      await logOriginAudit({ entity: "receipt", entityId: created.id ?? parsed.data.code, action: "apply", origin: "finanzas/cobranzas" });
      setSuccess(`Cobranza ${created.code} registrada.`);
      form.reset({ code: "", cashAccountId: "", amount: 1, receivableId: "", allocatedAmount: 1 });
      await loadRows();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo registrar la cobranza");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Layout title="Finanzas · Cobranzas" transitionPreset="elevate-in">
      <PageHeader title="Cobranza" subtitle="Aplicación de recibos con validación de imputaciones y cuenta de caja/banco." />
      <form className="card-base space-y-4" onSubmit={submit}>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="input-base w-full" {...form.register("code")} placeholder="Código" />
          <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("amount")} placeholder="Importe" />
          <SmartSelector label="Cuenta por cobrar" value={form.watch("receivableId")} onChange={(value) => form.setValue("receivableId", value, { shouldValidate: true })} options={[]} contextualConfig={{ entityType: "cuenta_cobrar", originFlow: "finanzas/cobranzas" }} />
          <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("allocatedAmount")} placeholder="Importe a imputar" />
        </div>
        <SmartSelector label="Cuenta caja/banco" value={form.watch("cashAccountId")} onChange={(value) => form.setValue("cashAccountId", value, { shouldValidate: true })} options={[]} contextualConfig={{ entityType: "cuenta", originFlow: "finanzas/cobranzas" }} />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Aplicando..." : "Registrar cobranza"}</button>
      </form>
      <div className="mt-4"><DataTable title="Cuentas por cobrar" columns={[{ key: "code", header: "Código" }, { key: "customerId", header: "Cliente" }, { key: "status", header: "Estado" }, { key: "balance", header: "Saldo" }]} rows={rows} rowId={(row) => row.id} /></div>
    </Layout>
  );
}
