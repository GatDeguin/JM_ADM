"use client";

import { useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiRequest, logOriginAudit } from "@/components/workflows/api";

type ImportType =
  | "customers"
  | "suppliers"
  | "formulas"
  | "production_journals"
  | "price_lists"
  | "historical_sales"
  | "expenses"
  | "opening_stock";

type ImportedRecord = {
  key: string;
  canonicalValue: Record<string, unknown>;
  warnings: string[];
  suggestions: string[];
  duplicate: boolean;
  valid: boolean;
  pendingHomologation: boolean;
};

type PrevalidationResponse = {
  warnings: string[];
  summary: Record<string, unknown>;
  rows: ImportedRecord[];
};

type UploadResponse = {
  id: string;
  detectedColumns?: string[];
  rowFeedback?: Array<{ rowNumber: number; level: "warning" | "error"; message: string }>;
};

type AuditEntry = {
  id: string;
  action: string;
  origin: string;
  createdAt: string;
  after?: unknown;
};

const importTypeFields: Record<ImportType, string[]> = {
  customers: ["code", "name", "pending_homologation"],
  suppliers: ["code", "name", "pending_homologation"],
  formulas: ["code", "name"],
  production_journals: ["date", "batch", "product"],
  price_lists: ["code", "sku", "price"],
  historical_sales: ["date", "customer", "sku", "qty"],
  expenses: ["date", "category", "amount", "supplier"],
  opening_stock: ["item", "warehouse", "qty", "pending_homologation"],
};

const wizardSteps = ["Subida", "Mapeo", "Preview", "Confirmación", "Bitácora"];

export function ImportJobPage() {
  const [type, setType] = useState<ImportType>("customers");
  const [sourceName, setSourceName] = useState("importacion-operativa");
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [prevalidation, setPrevalidation] = useState<PrevalidationResponse | null>(null);
  const [page, setPage] = useState(1);
  const [step, setStep] = useState(0);
  const [forcePendingHomologation, setForcePendingHomologation] = useState(false);
  const [timeline, setTimeline] = useState<AuditEntry[]>([]);
  const [feedback, setFeedback] = useState<Array<{ rowNumber: number; level: "warning" | "error"; message: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const targetFields = importTypeFields[type];

  const previewRows = prevalidation?.rows ?? [];
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(previewRows.length / pageSize));
  const paginatedRows = useMemo(
    () => previewRows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
    [page, previewRows],
  );

  async function toBase64(selectedFile: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsDataURL(selectedFile);
    });
  }

  async function handleUpload() {
    if (!file) {
      setError("Seleccioná un archivo CSV/XLSX/DOCX para continuar.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const job = await apiRequest<{ id: string }>("/system/imports/jobs", {
        method: "POST",
        body: JSON.stringify({ type, sourceName }),
      });

      const contentBase64 = await toBase64(file);
      const upload = await apiRequest<UploadResponse>(`/system/imports/jobs/${job.id}/file`, {
        method: "POST",
        body: JSON.stringify({
          sourceName,
          fileName: file.name,
          mimeType: file.type,
          contentBase64,
          forcePendingHomologation,
        }),
      });

      const parsedColumns = upload.detectedColumns ?? [];
      const defaultMapping = Object.fromEntries(
        parsedColumns.map((column) => [column, targetFields.find((field) => field === column.toLowerCase()) ?? ""]),
      );

      setJobId(job.id);
      setDetectedColumns(parsedColumns);
      setMapping(defaultMapping);
      setFeedback(upload.rowFeedback ?? []);
      setStep(1);
      setSuccess(`Archivo cargado en job ${job.id}. Columnas detectadas: ${parsedColumns.join(", ") || "sin columnas"}.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo cargar el archivo.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePrevalidate() {
    if (!jobId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const filteredMapping = Object.fromEntries(Object.entries(mapping).filter(([, target]) => target));
      await apiRequest(`/system/imports/jobs/${jobId}/mapping`, {
        method: "POST",
        body: JSON.stringify({ mapping: filteredMapping }),
      });

      const result = await apiRequest<PrevalidationResponse>(`/system/imports/jobs/${jobId}/prevalidate`, {
        method: "POST",
      });

      setPrevalidation(result);
      setPage(1);
      setStep(2);
      setSuccess("Prevalidación completada con feedback por fila.");
    } catch (prevalidateError) {
      setError(prevalidateError instanceof Error ? prevalidateError.message : "No se pudo prevalidar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!jobId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest(`/system/imports/jobs/${jobId}/confirm`, { method: "POST" });
      await logOriginAudit({ entity: "import-job", entityId: jobId, action: "confirm", origin: "sistema/importaciones" });
      await loadTimeline(jobId);
      setStep(4);
      setSuccess(`Importación ${jobId} confirmada y bitácora actualizada.`);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "No se pudo confirmar la importación.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTimeline(currentJobId: string) {
    const entries = await apiRequest<AuditEntry[]>(`/system/audit/audit-logs/timeline/ImportBatch/${currentJobId}?limit=50`);
    setTimeline(entries);
  }

  return (
    <Layout title="Sistema · Importación" transitionPreset="elevate-in">
      <PageHeader title="Importación asistida" subtitle="Wizard con detección de columnas, mapeo editable, preview paginado y bitácora." />

      <div className="card-base mb-4">
        <ol className="grid gap-2 text-sm md:grid-cols-5">
          {wizardSteps.map((stepName, index) => (
            <li key={stepName} className={`rounded-lg border px-3 py-2 ${index <= step ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"}`}>
              <span className="font-semibold">{index + 1}. </span>
              {stepName}
            </li>
          ))}
        </ol>
      </div>

      {step === 0 ? (
        <section className="card-base space-y-4">
          <h2 className="text-lg font-semibold">1) Subida de archivo y detección de columnas</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Tipo de importación</span>
              <select className="input-base w-full" value={type} onChange={(event) => setType(event.target.value as ImportType)}>
                {Object.keys(importTypeFields).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Origen</span>
              <input className="input-base w-full" value={sourceName} onChange={(event) => setSourceName(event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Archivo</span>
              <input
                className="input-base w-full"
                type="file"
                accept=".csv,.xlsx,.docx,.txt"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={forcePendingHomologation}
              onChange={(event) => setForcePendingHomologation(event.target.checked)}
            />
            Marcar explícitamente todas las filas como <code>pending_homologation</code>
          </label>

          <button className="btn-primary" type="button" onClick={handleUpload} disabled={loading}>
            {loading ? "Procesando..." : "Subir y detectar columnas"}
          </button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="card-base space-y-4">
          <h2 className="text-lg font-semibold">2) Mapeo editable</h2>
          <p className="text-sm text-slate-600">Ajustá el campo destino por cada columna detectada.</p>
          <div className="space-y-2">
            {detectedColumns.map((column) => (
              <div key={column} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-[2fr,1fr]">
                <div className="font-mono text-sm">{column}</div>
                <select
                  className="input-base"
                  value={mapping[column] ?? ""}
                  onChange={(event) => setMapping((current) => ({ ...current, [column]: event.target.value }))}
                >
                  <option value="">(ignorar)</option>
                  {targetFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {feedback.length > 0 ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="mb-1 font-semibold">Feedback de parsing</p>
              <ul className="ml-4 list-disc">
                {feedback.map((item, index) => (
                  <li key={`${item.rowNumber}-${index}`}>Fila {item.rowNumber}: {item.message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex gap-2">
            <button className="btn-secondary" type="button" onClick={() => setStep(0)}>
              Volver
            </button>
            <button className="btn-primary" type="button" onClick={handlePrevalidate} disabled={loading}>
              {loading ? "Prevalidando..." : "Ejecutar prevalidación"}
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="card-base space-y-4">
          <h2 className="text-lg font-semibold">3) Preview paginado con sugerencias</h2>
          <div className="overflow-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2">Llave</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Warnings</th>
                  <th className="px-3 py-2">Sugerencias alias/merge</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr key={row.key} className="border-t border-slate-200">
                    <td className="px-3 py-2 font-mono text-xs">{row.key}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-2 py-1 text-xs ${row.valid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {row.valid ? "válida" : "inválida"}
                      </span>
                      {row.pendingHomologation ? <span className="ml-2 rounded bg-amber-100 px-2 py-1 text-xs text-amber-700">pending_homologation</span> : null}
                    </td>
                    <td className="px-3 py-2 text-xs">{row.warnings.join(" · ") || "-"}</td>
                    <td className="px-3 py-2 text-xs">{row.suggestions.join(" · ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <button className="btn-secondary" type="button" onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button className="btn-secondary" type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              Siguiente
            </button>
          </div>

          <button className="btn-primary" type="button" onClick={() => setStep(3)}>
            Continuar a confirmación
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="card-base space-y-4">
          <h2 className="text-lg font-semibold">4) Confirmación</h2>
          <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(prevalidation?.summary ?? {}, null, 2)}</pre>
          {(prevalidation?.warnings?.length ?? 0) > 0 ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="mb-1 font-semibold">Warnings globales</p>
              <ul className="ml-4 list-disc">
                {prevalidation?.warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            </div>
          ) : null}

          <button className="btn-primary" type="button" onClick={handleConfirm} disabled={loading}>
            {loading ? "Confirmando..." : "Confirmar importación"}
          </button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="card-base space-y-4">
          <h2 className="text-lg font-semibold">5) Bitácora de importación</h2>
          <p className="text-sm text-slate-600">Eventos persistidos con acciones tomadas, warnings y errores asociados al job.</p>
          <div className="space-y-2">
            {timeline.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold">{entry.action}</p>
                <p className="text-xs text-slate-500">{entry.origin} · {new Date(entry.createdAt).toLocaleString()}</p>
                <pre className="mt-2 overflow-auto rounded bg-slate-100 p-2 text-xs">{JSON.stringify(entry.after ?? {}, null, 2)}</pre>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
    </Layout>
  );
}
