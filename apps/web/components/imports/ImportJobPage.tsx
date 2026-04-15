"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiRequest, logOriginAudit } from "@/components/workflows/api";

const schema = z.object({
  type: z.string().min(2, "Tipo de importación requerido"),
  sourceName: z.string().min(2, "Nombre de origen requerido"),
  rowsJson: z.string().min(2, "Rows JSON requerido"),
  mappingJson: z.string().min(2, "Mapping JSON requerido")
});

type Values = z.infer<typeof schema>;
type ImportJob = { id: string; status: string; warnings?: string[] };

export function ImportJobPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const form = useForm<Values>({
    defaultValues: {
      type: "customers",
      sourceName: "archivo-operativo",
      rowsJson: JSON.stringify([{ code: "C-001", name: "Cliente demo" }], null, 2),
      mappingJson: JSON.stringify({ code: "code", name: "name" }, null, 2)
    }
  });

  const submit = form.handleSubmit(async (values) => {
    setError(null);
    setSuccess(null);
    setWarnings([]);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof Values;
        form.setError(field, { message: issue.message });
      });
      return;
    }

    let rows: Array<Record<string, unknown>> = [];
    let mapping: Record<string, string> = {};

    try {
      rows = z.array(z.record(z.unknown())).parse(JSON.parse(parsed.data.rowsJson));
      mapping = z.record(z.string()).parse(JSON.parse(parsed.data.mappingJson));
    } catch {
      setError("Rows o mapping no tienen formato JSON válido.");
      return;
    }

    try {
      setLoading(true);
      const job = await apiRequest<ImportJob>("/system/imports/jobs", {
        method: "POST",
        body: JSON.stringify({ type: parsed.data.type, sourceName: parsed.data.sourceName })
      });

      await apiRequest(`/system/imports/jobs/${job.id}/file`, {
        method: "POST",
        body: JSON.stringify({ sourceName: parsed.data.sourceName, rows })
      });

      await apiRequest(`/system/imports/jobs/${job.id}/mapping`, {
        method: "POST",
        body: JSON.stringify({ mapping })
      });

      const prevalidation = await apiRequest<ImportJob>(`/system/imports/jobs/${job.id}/prevalidate`, { method: "POST" });
      const prevalidationWarnings = prevalidation?.warnings ?? [];
      setWarnings(prevalidationWarnings);

      await apiRequest(`/system/imports/jobs/${job.id}/confirm`, { method: "POST" });

      await logOriginAudit({ entity: "import-job", entityId: job.id, action: "confirm", origin: "sistema/importaciones" });
      setSuccess(`Importación ${job.id} confirmada${prevalidationWarnings.length ? " con advertencias" : ""}.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo completar la importación");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Layout title="Sistema · Importación" transitionPreset="elevate-in">
      <PageHeader title="Importación" subtitle="Carga, mapeo, prevalidación y confirmación en flujo único." />
      <form className="card-base space-y-4" onSubmit={submit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Tipo de importación</span>
            <input className="input-base w-full" {...form.register("type")} placeholder="customers" />
            {form.formState.errors.type ? <p className="text-xs text-red-600">{form.formState.errors.type.message}</p> : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Origen</span>
            <input className="input-base w-full" {...form.register("sourceName")} placeholder="archivo.csv" />
            {form.formState.errors.sourceName ? <p className="text-xs text-red-600">{form.formState.errors.sourceName.message}</p> : null}
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Rows JSON</span>
          <textarea className="input-base min-h-32 w-full font-mono text-xs" {...form.register("rowsJson")} />
          {form.formState.errors.rowsJson ? <p className="text-xs text-red-600">{form.formState.errors.rowsJson.message}</p> : null}
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Mapping JSON</span>
          <textarea className="input-base min-h-24 w-full font-mono text-xs" {...form.register("mappingJson")} />
          {form.formState.errors.mappingJson ? <p className="text-xs text-red-600">{form.formState.errors.mappingJson.message}</p> : null}
        </label>

        {warnings.length > 0 ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            <p className="font-semibold">Advertencias de prevalidación</p>
            <ul className="ml-4 list-disc">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Importando..." : "Ejecutar importación"}
        </button>
      </form>
    </Layout>
  );
}
