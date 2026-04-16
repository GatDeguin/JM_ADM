"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiRequest } from "@/components/workflows/api";

type Column = { key: string; header: string };

type DomainResourcePageProps = {
  layoutTitle: string;
  headerTitle: string;
  subtitle: string;
  listPath: string;
  createPath?: string;
  formFields?: Array<{ key: string; label: string; placeholder?: string }>;
  columns?: Column[];
};

const defaultSchema = z.object({
  name: z.string().min(2, "Ingresá al menos 2 caracteres"),
  code: z.string().optional(),
  notes: z.string().optional(),
});

type DefaultFormValues = z.infer<typeof defaultSchema>;

export function DomainResourcePage({
  layoutTitle,
  headerTitle,
  subtitle,
  listPath,
  createPath,
  formFields,
  columns,
}: DomainResourcePageProps) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const visibleColumns = useMemo<Column[]>(
    () => columns ?? [
      { key: "id", header: "ID" },
      { key: "name", header: "Nombre" },
      { key: "status", header: "Estado" },
      { key: "updatedAt", header: "Actualizado" },
    ],
    [columns],
  );

  const form = useForm<DefaultFormValues>({ defaultValues: { name: "", code: "", notes: "" } });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<Array<Record<string, unknown>>>(listPath);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar datos");
    } finally {
      setLoading(false);
    }
  }, [listPath]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = form.handleSubmit(async (values) => {
    if (!createPath) return;
    setSuccess(null);
    setError(null);
    const parsed = defaultSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    try {
      await apiRequest(createPath, { method: "POST", body: JSON.stringify(parsed.data) });
      setSuccess("Registro creado correctamente.");
      form.reset();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el registro");
    }
  });

  return (
    <Layout title={layoutTitle} transitionPreset="elevate-in">
      <PageHeader title={headerTitle} subtitle={subtitle} />
      {createPath ? (
        <form className="card-base mb-4 grid gap-3 md:grid-cols-3" onSubmit={submit}>
          {(formFields ?? [
            { key: "name", label: "Nombre", placeholder: "Nombre" },
            { key: "code", label: "Código", placeholder: "Código" },
            { key: "notes", label: "Notas", placeholder: "Notas" },
          ]).map((field) => (
            <label key={field.key} className="text-sm font-medium text-slate-700">
              {field.label}
              <input className="input-base mt-1" placeholder={field.placeholder} {...form.register(field.key as keyof DefaultFormValues)} />
            </label>
          ))}
          {error ? <p className="text-sm text-red-700 md:col-span-3">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700 md:col-span-3">{success}</p> : null}
          <button className="btn-primary md:col-span-3" type="submit" disabled={loading}>{loading ? "Guardando..." : "Crear registro"}</button>
        </form>
      ) : null}
      <DataTable
        title="Registros"
        loading={loading}
        error={error}
        columns={visibleColumns}
        rows={rows}
        rowId={(row) => String(row.id ?? row.code ?? row.name ?? "row")}
      />
    </Layout>
  );
}
