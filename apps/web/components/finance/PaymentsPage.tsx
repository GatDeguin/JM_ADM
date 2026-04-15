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
  cashAccountId: z.string().min(1, "Cuenta de pago requerida"),
  amount: z.coerce.number().positive("Importe inválido"),
  payableId: z.string().min(1, "Cuenta a pagar requerida"),
  allocatedAmount: z.coerce.number().positive("Importe de imputación inválido")
});

type Values = z.infer<typeof schema>;

type PaymentResponse = { id?: string; code: string };

export function PaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<Values>({
    defaultValues: { code: "", cashAccountId: "", amount: 1, payableId: "", allocatedAmount: 1 }
  });

  const amount = Number(form.watch("amount") ?? 0);
  const allocatedAmount = Number(form.watch("allocatedAmount") ?? 0);
  const preWarnings = [
    !form.watch("payableId") ? "Seleccioná al menos una cuenta a pagar." : null,
    allocatedAmount > amount ? "La imputación no puede superar el importe pagado." : null,
    !form.watch("cashAccountId") ? "Debés seleccionar cuenta de caja/banco." : null,
  ].filter((warning): warning is string => Boolean(warning));
  const canSubmit = preWarnings.length === 0 && !loading;

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
      if (parsed.data.allocatedAmount > parsed.data.amount) {
        form.setError("allocatedAmount", { message: "La imputación no puede exceder el pago" });
        return;
      }

      const created = await apiRequest<PaymentResponse>("/payables_treasury/payments/apply", {
        method: "POST",
        body: JSON.stringify({
          code: parsed.data.code,
          cashAccountId: parsed.data.cashAccountId,
          amount: parsed.data.amount,
          allocations: [{ payableId: parsed.data.payableId, amount: parsed.data.allocatedAmount }]
        })
      });

      await logOriginAudit({ entity: "payment", entityId: created.id ?? parsed.data.code, action: "apply", origin: "finanzas/pagos" });
      setSuccess(`Pago ${created.code} registrado.`);
      form.reset({ code: "", cashAccountId: "", amount: 1, payableId: "", allocatedAmount: 1 });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo registrar el pago");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Layout title="Finanzas · Pagos" transitionPreset="elevate-in">
      <PageHeader title="Pago" subtitle="Aplicación de pagos con control de imputaciones por CxP." />
      <form className="card-base space-y-4" onSubmit={submit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Código de pago</span>
            <input className="input-base w-full" {...form.register("code")} placeholder="PG-2026-001" />
            {form.formState.errors.code ? <p className="text-xs text-red-600">{form.formState.errors.code.message}</p> : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Importe pagado</span>
            <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("amount")} />
            {form.formState.errors.amount ? <p className="text-xs text-red-600">{form.formState.errors.amount.message}</p> : null}
          </label>
          <SmartSelector
            label="Cuenta por pagar"
            value={form.watch("payableId")}
            onChange={(value) => form.setValue("payableId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "cuenta_pagar", originFlow: "finanzas/pagos" }}
          />
          <label className="space-y-1 text-sm">
            <span className="font-medium">Importe a imputar</span>
            <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("allocatedAmount")} />
            {form.formState.errors.allocatedAmount ? <p className="text-xs text-red-600">{form.formState.errors.allocatedAmount.message}</p> : null}
          </label>
        </div>

        <SmartSelector
          label="Cuenta caja/banco"
          value={form.watch("cashAccountId")}
          onChange={(value) => form.setValue("cashAccountId", value, { shouldValidate: true })}
          options={[]}
          contextualConfig={{ entityType: "cuenta", originFlow: "finanzas/pagos" }}
        />

        {preWarnings.length ? <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{preWarnings.map((warning) => <p key={warning}>⚠ {warning}</p>)}</div> : null}
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <button className="btn-primary" type="submit" disabled={!canSubmit}>
          {loading ? "Aplicando..." : "Registrar pago"}
        </button>
      </form>
    </Layout>
  );
}
