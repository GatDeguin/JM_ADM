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
  cashAccountId: z.string().min(1, "Cuenta de cobro requerida"),
  amount: z.coerce.number().positive("Importe inválido"),
  receivableId: z.string().min(1, "Cuenta a cobrar requerida"),
  allocatedAmount: z.coerce.number().positive("Importe de imputación inválido")
});

type Values = z.infer<typeof schema>;

type ReceiptResponse = { id?: string; code: string };

export function ReceiptsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<Values>({
    defaultValues: { code: "", cashAccountId: "", amount: 1, receivableId: "", allocatedAmount: 1 }
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
      if (parsed.data.allocatedAmount > parsed.data.amount) {
        form.setError("allocatedAmount", { message: "La imputación no puede exceder el importe recibido" });
        return;
      }

      const created = await apiRequest<ReceiptResponse>("/receivables/receipts/apply", {
        method: "POST",
        body: JSON.stringify({
          code: parsed.data.code,
          cashAccountId: parsed.data.cashAccountId,
          amount: parsed.data.amount,
          allocations: [{ receivableId: parsed.data.receivableId, amount: parsed.data.allocatedAmount }]
        })
      });

      await logOriginAudit({ entity: "receipt", entityId: created.id ?? parsed.data.code, action: "apply", origin: "finanzas/cobranzas" });
      setSuccess(`Cobranza ${created.code} registrada.`);
      form.reset({ code: "", cashAccountId: "", amount: 1, receivableId: "", allocatedAmount: 1 });
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
          <label className="space-y-1 text-sm">
            <span className="font-medium">Código de recibo</span>
            <input className="input-base w-full" {...form.register("code")} placeholder="RC-2026-001" />
            {form.formState.errors.code ? <p className="text-xs text-red-600">{form.formState.errors.code.message}</p> : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Importe recibido</span>
            <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("amount")} />
            {form.formState.errors.amount ? <p className="text-xs text-red-600">{form.formState.errors.amount.message}</p> : null}
          </label>
          <SmartSelector
            label="Cuenta por cobrar"
            value={form.watch("receivableId")}
            onChange={(value) => form.setValue("receivableId", value, { shouldValidate: true })}
            options={[]}
            contextualConfig={{ entityType: "cuenta_cobrar", originFlow: "finanzas/cobranzas" }}
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
          contextualConfig={{ entityType: "cuenta", originFlow: "finanzas/cobranzas" }}
        />

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Aplicando..." : "Registrar cobranza"}
        </button>
      </form>
    </Layout>
  );
}
