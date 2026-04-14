"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { KPIStatCard } from "@/components/ui/KPIStatCard";
import { DataTable } from "@/components/ui/DataTable";
import { SmartSelector, type SmartSelectorOption } from "@/components/ui/SmartSelector";
import { MergeComparePanel } from "@/components/ui/MergeComparePanel";

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  code: z.string().min(2, "Código requerido"),
  status: z.enum(["active", "draft", "blocked"])
});

type FormValues = z.infer<typeof formSchema>;

type DomainCrudViewProps = {
  title: string;
  subtitle: string;
  domain: string;
};

type DomainRecord = {
  id: string;
  name: string;
  code: string;
  status: "active" | "draft" | "blocked";
  updatedAt: string;
};

export function DomainCrudView({ title, subtitle, domain }: DomainCrudViewProps) {
  const [records, setRecords] = useState<DomainRecord[]>([
    { id: `${domain}-1`, name: `${domain} principal`, code: "A-001", status: "active", updatedAt: "2026-04-14" },
    { id: `${domain}-2`, name: `${domain} alterno`, code: "B-002", status: "draft", updatedAt: "2026-04-13" }
  ]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(records[0]?.id ?? "");
  const [leftId, setLeftId] = useState<string>(records[0]?.id ?? "");
  const [rightId, setRightId] = useState<string>(records[1]?.id ?? "");

  const form = useForm<FormValues>({
    defaultValues: { name: "", code: "", status: "draft" }
  });

  const options: SmartSelectorOption[] = useMemo(
    () => records.map((r) => ({ id: r.id, label: r.name, meta: `${r.code} · ${r.status}` })),
    [records]
  );

  const onSubmit = form.handleSubmit((values) => {
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      form.setError("name", { message: parsed.error.issues[0]?.message ?? "Validación" });
      return;
    }
    const newRecord: DomainRecord = {
      id: `${domain}-${Date.now()}`,
      name: parsed.data.name,
      code: parsed.data.code,
      status: parsed.data.status,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setRecords((prev) => [newRecord, ...prev]);
    setSelected(newRecord.id);
    form.reset({ name: "", code: "", status: "draft" });
  });

  const selectedRecord = records.find((r) => r.id === selected) ?? null;

  return (
    <Layout title={title}>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <KPIStatCard label="Registros" value={records.length} />
        <KPIStatCard label="Activos" value={records.filter((r) => r.status === "active").length} />
        <KPIStatCard label="Dominio" value={domain} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.1fr_2fr]">
        <SmartSelector
          label={`Selector de ${domain}`}
          options={options}
          value={selected}
          loading={loading}
          error={error}
          onChange={setSelected}
          onCreateOption={async (input) => {
            const created: DomainRecord = {
              id: `${domain}-${Date.now()}`,
              name: input.label,
              code: `AUTO-${records.length + 1}`,
              status: "draft",
              updatedAt: new Date().toISOString().slice(0, 10)
            };
            setRecords((prev) => [created, ...prev]);
            return { id: created.id, label: created.name, meta: created.code };
          }}
        />

        <form className="rounded-xl border bg-white p-4" onSubmit={onSubmit}>
          <h3 className="mb-3 font-semibold">Crear / Editar</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm">Nombre</span>
              <input className="w-full rounded border px-3 py-2" {...form.register("name")} />
            </label>
            <label>
              <span className="mb-1 block text-sm">Código</span>
              <input className="w-full rounded border px-3 py-2" {...form.register("code")} />
            </label>
            <label>
              <span className="mb-1 block text-sm">Estado</span>
              <select className="w-full rounded border px-3 py-2" {...form.register("status")}>
                <option value="draft">Borrador</option>
                <option value="active">Activo</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </label>
          </div>
          {form.formState.errors.name ? <p className="mt-2 text-sm text-red-600">{form.formState.errors.name.message}</p> : null}
          <button className="mt-3 rounded bg-zinc-900 px-3 py-2 text-sm text-white" type="submit">Guardar</button>
        </form>
      </div>

      <DataTable
        title={`Tabla ${domain}`}
        loading={loading}
        error={error}
        columns={[
          { key: "name", header: "Nombre" },
          { key: "code", header: "Código" },
          { key: "status", header: "Estado" },
          { key: "updatedAt", header: "Actualizado" }
        ]}
        rows={records}
        rowId={(r) => r.id}
        onCreate={() => form.setFocus("name")}
        onEdit={(row) => {
          form.reset({ name: row.name, code: row.code, status: row.status });
          setSelected(row.id);
        }}
        onDelete={(row) => setRecords((prev) => prev.filter((r) => r.id !== row.id))}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SmartSelector label="Registro A" options={options} value={leftId} onChange={setLeftId} />
        <SmartSelector label="Registro B" options={options} value={rightId} onChange={setRightId} />
      </div>
      <div className="mt-4">
        <MergeComparePanel
          leftLabel="Origen A"
          rightLabel="Origen B"
          left={records.find((r) => r.id === leftId) ?? selectedRecord}
          right={records.find((r) => r.id === rightId) ?? null}
          onMerge={(winner) => {
            const keep = winner === "left" ? leftId : rightId;
            const remove = winner === "left" ? rightId : leftId;
            if (!remove) return;
            setRecords((prev) => prev.filter((r) => r.id !== remove));
            setSelected(keep);
          }}
        />
      </div>
    </Layout>
  );
}
