"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

type Step = { id: "cabecera" | "seleccion" | "confirmacion"; title: string; description: string };

const STEPS: Step[] = [
  { id: "cabecera", title: "Cabecera", description: "Código y datos económicos" },
  { id: "seleccion", title: "Selección", description: "Cliente, lista y SKU contextual" },
  { id: "confirmacion", title: "Confirmación", description: "Revisá y generá la venta" }
];

export function NewSaleWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedStep = searchParams.get("step");
  const initialStep: Step["id"] = STEPS.some((step) => step.id === requestedStep) ? (requestedStep as Step["id"]) : "cabecera";

  const [currentStep, setCurrentStep] = useState<Step["id"]>(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<Values>({
    defaultValues: { code: "", customerId: "", priceListId: "", skuId: "", qty: 1, unitPrice: 1 }
  });

  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);

  const goToStep = (stepId: Step["id"]) => {
    setCurrentStep(stepId);
    const next = new URLSearchParams(searchParams.toString());
    next.set("step", stepId);
    router.replace(`/comercial/pedidos/nuevo?${next.toString()}`);
  };

  const validateCurrentStep = async () => {
    if (currentStep === "cabecera") return form.trigger(["code", "qty", "unitPrice"]);
    if (currentStep === "seleccion") return form.trigger(["customerId", "priceListId", "skuId"]);
    return true;
  };

  const nextStep = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;
    const target = STEPS[currentIndex + 1];
    if (target) goToStep(target.id);
  };

  const prevStep = () => {
    const target = STEPS[currentIndex - 1];
    if (target) goToStep(target.id);
  };

  const qty = form.watch("qty");
  const unitPrice = form.watch("unitPrice");
  const total = useMemo(() => {
    const safeQty = Number(qty || 0);
    const safePrice = Number(unitPrice || 0);
    return safeQty * safePrice;
  }, [qty, unitPrice]);

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

      await logOriginAudit({ entity: "sales-order", entityId: created.id, action: "create", origin: "comercial/pedidos/nuevo" });
      setSuccess(`Venta ${created.code} creada por ${total.toFixed(2)}.`);
      form.reset({ code: "", customerId: "", priceListId: "", skuId: "", qty: 1, unitPrice: 1 });
      goToStep("cabecera");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear la venta");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Layout title="Comercial · Alta de venta" transitionPreset="section-slide">
      <PageHeader title="Alta transaccional de venta" subtitle="Wizard con deep-linking por paso y alta contextual de entidades comerciales." />

      <div className="card-base mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">Ruta: <code className="rounded bg-zinc-100 px-1 py-0.5">/comercial/pedidos/nuevo?step=...</code></p>
        <Link href="/comercial/pedidos" className="text-sm font-medium text-indigo-700">Volver a pedidos</Link>
      </div>

      <form className="space-y-4" onSubmit={submit}>
        <section className="card-base">
          <nav className="grid gap-2 md:grid-cols-3" aria-label="Pasos del wizard">
            {STEPS.map((step, index) => {
              const active = step.id === currentStep;
              const done = index < currentIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={`rounded-lg border px-3 py-2 text-left ${active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white"}`}
                >
                  <p className="text-xs uppercase tracking-wide opacity-80">Paso {index + 1}</p>
                  <p className="font-semibold">{step.title} {done ? "✓" : ""}</p>
                  <p className={`text-xs ${active ? "text-zinc-200" : "text-zinc-500"}`}>{step.description}</p>
                </button>
              );
            })}
          </nav>
        </section>

        {currentStep === "cabecera" ? (
          <section className="card-base grid gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Código</span>
              <input className="input-base w-full" {...form.register("code")} placeholder="SO-2026-001" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Cantidad</span>
              <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("qty")} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Precio unitario</span>
              <input className="input-base w-full" type="number" min={0.01} step="0.01" {...form.register("unitPrice")} />
            </label>
          </section>
        ) : null}

        {currentStep === "seleccion" ? (
          <section className="grid gap-4 lg:grid-cols-3">
            <SmartSelector
              label="Cliente"
              value={form.watch("customerId")}
              onChange={(value) => form.setValue("customerId", value, { shouldValidate: true })}
              options={[]}
              contextualConfig={{ entityType: "cliente", originFlow: "comercial/pedidos/nuevo" }}
            />
            <SmartSelector
              label="Lista de precios"
              value={form.watch("priceListId")}
              onChange={(value) => form.setValue("priceListId", value, { shouldValidate: true })}
              options={[]}
              contextualConfig={{ entityType: "lista", originFlow: "comercial/pedidos/nuevo" }}
            />
            <SmartSelector
              label="SKU"
              value={form.watch("skuId")}
              onChange={(value) => form.setValue("skuId", value, { shouldValidate: true })}
              options={[]}
              contextualConfig={{ entityType: "sku", originFlow: "comercial/pedidos/nuevo" }}
            />
          </section>
        ) : null}

        {currentStep === "confirmacion" ? (
          <section className="card-base space-y-3 text-sm">
            <p><strong>Código:</strong> {form.watch("code") || "-"}</p>
            <p><strong>Cliente:</strong> {form.watch("customerId") || "-"}</p>
            <p><strong>Lista:</strong> {form.watch("priceListId") || "-"}</p>
            <p><strong>SKU:</strong> {form.watch("skuId") || "-"}</p>
            <p><strong>Total:</strong> {total.toFixed(2)}</p>
          </section>
        ) : null}

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <div className="card-base flex flex-wrap items-center justify-between gap-2">
          <button type="button" className="btn-secondary" onClick={prevStep} disabled={currentIndex === 0 || loading}>Anterior</button>
          <div className="flex gap-2">
            {currentIndex < STEPS.length - 1 ? (
              <button type="button" className="btn-primary" onClick={nextStep}>Siguiente</button>
            ) : (
              <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Guardando..." : "Crear venta"}</button>
            )}
          </div>
        </div>
      </form>
    </Layout>
  );
}
