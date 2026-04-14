"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Layout } from "@/components/layout";
import { DataTable } from "@/components/ui/DataTable";
import { KPIStatCard } from "@/components/ui/KPIStatCard";
import { MergeComparePanel } from "@/components/ui/MergeComparePanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartSelector, type ContextualEntityType, type SmartSelectorOption } from "@/components/ui/SmartSelector";
import { z } from "zod";

type CriticalDomain = "producto-base" | "sku" | "formula" | "lote" | "pedido" | "cliente";

type DomainRecord = {
  id: string;
  name: string;
  code: string;
  status: string;
  updatedAt: string;
  raw: Record<string, unknown>;
};

type DomainConfig = {
  title: string;
  subtitle: string;
  listPath: string;
  createPath?: string;
  editPath?: (id: string) => string;
  actionPath?: (id: string) => string;
  toRecord: (row: Record<string, unknown>) => DomainRecord;
  createPayload: (input: FormValues) => Record<string, unknown>;
  editPayload: (input: FormValues) => Record<string, unknown>;
  businessFilters: Array<{ key: string; label: string; value: string }>;
  statusOptions: string[];
};

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  code: z.string().min(2, "Código requerido"),
  status: z.string().min(2, "Estado requerido")
});

type FormValues = z.infer<typeof formSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const criticalConfig: Record<CriticalDomain, DomainConfig> = {
  "producto-base": {
    title: "Catálogo · Producto Base",
    subtitle: "Ficha crítica con query real a API, filtros y acciones contextuales",
    listPath: "/catalog/product-bases",
    createPath: "/catalog/product-bases",
    toRecord: (row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? "-"),
      code: String(row.code ?? "-"),
      status: String(row.status ?? "draft"),
      updatedAt: String(row.updatedAt ?? row.createdAt ?? "-"),
      raw: row
    }),
    createPayload: (input) => ({ code: input.code, name: input.name }),
    editPayload: (input) => ({ name: input.name, status: input.status }),
    businessFilters: [
      { key: "status", label: "Activos", value: "active" },
      { key: "status", label: "Borradores", value: "draft" }
    ],
    statusOptions: ["draft", "active", "inactive", "pending_homologation", "archived"]
  },
  sku: {
    title: "Catálogo · SKU",
    subtitle: "Ficha crítica de SKU con filtros comerciales y homologación/merge",
    listPath: "/catalog/skus",
    toRecord: (row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? row.code ?? "-"),
      code: String(row.code ?? "-"),
      status: String(row.status ?? "active"),
      updatedAt: String(row.updatedAt ?? row.createdAt ?? "-"),
      raw: row
    }),
    createPayload: (input) => ({ code: input.code, name: input.name }),
    editPayload: (input) => ({ name: input.name, status: input.status }),
    businessFilters: [
      { key: "status", label: "Publicados", value: "active" },
      { key: "status", label: "Pendientes", value: "draft" }
    ],
    statusOptions: ["draft", "active", "inactive", "pending_homologation", "archived"]
  },
  formula: {
    title: "Técnica · Fórmula",
    subtitle: "Ficha crítica con aprobación/homologación y control por estado",
    listPath: "/formulas",
    createPath: "/formulas",
    actionPath: (id) => `/formulas/${id}/approve`,
    toRecord: (row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? "-"),
      code: String(row.code ?? "-"),
      status: String(row.status ?? "draft"),
      updatedAt: String(row.updatedAt ?? row.createdAt ?? "-"),
      raw: row
    }),
    createPayload: (input) => ({ code: input.code, name: input.name }),
    editPayload: (input) => ({ name: input.name, status: input.status }),
    businessFilters: [
      { key: "status", label: "Aprobadas", value: "approved" },
      { key: "status", label: "Borrador", value: "draft" }
    ],
    statusOptions: ["draft", "approved", "obsolete"]
  },
  lote: {
    title: "Stock · Lote",
    subtitle: "Ficha crítica de lote operativa con query a producción",
    listPath: "/production/production-orders",
    createPath: "/production/production-orders",
    toRecord: (row) => ({
      id: String(row.id ?? ""),
      name: String(row.code ?? row.id ?? "-"),
      code: String(row.code ?? "-"),
      status: String(row.status ?? "planned"),
      updatedAt: String(row.updatedAt ?? row.createdAt ?? "-"),
      raw: row
    }),
    createPayload: (input) => ({ code: input.code, productBaseId: input.name, formulaVersionId: input.status, plannedQty: 1 }),
    editPayload: (input) => ({ name: input.name, status: input.status }),
    businessFilters: [
      { key: "status", label: "Planificados", value: "planned" },
      { key: "status", label: "Liberados", value: "released" }
    ],
    statusOptions: ["planned", "in_process", "closed", "released"]
  },
  pedido: {
    title: "Comercial · Pedido",
    subtitle: "Ficha crítica con filtros comerciales y acciones de homologación/merge",
    listPath: "/sales/sales-orders",
    createPath: "/sales/sales-orders",
    toRecord: (row) => ({
      id: String(row.id ?? ""),
      name: String(row.code ?? row.id ?? "-"),
      code: String(row.code ?? "-"),
      status: String(row.status ?? "confirmed"),
      updatedAt: String(row.updatedAt ?? row.createdAt ?? "-"),
      raw: row
    }),
    createPayload: (input) => ({
      code: input.code,
      customerId: input.name,
      priceListId: "PL-001",
      total: 1,
      items: [{ skuId: input.status, qty: 1 }]
    }),
    editPayload: (input) => ({ name: input.name, status: input.status }),
    businessFilters: [
      { key: "status", label: "Confirmados", value: "confirmed" },
      { key: "status", label: "Borrador", value: "draft" }
    ],
    statusOptions: ["draft", "confirmed", "cancelled"]
  },
  cliente: {
    title: "Comercial · Cliente",
    subtitle: "Ficha crítica de cliente con RHF+Zod y acciones de homologación",
    listPath: "/customers/customers",
    createPath: "/customers/customers",
    editPath: (id) => `/customers/customers/${id}`,
    actionPath: (id) => `/customers/customers/${id}/action`,
    toRecord: (row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? "-"),
      code: String(row.code ?? "-"),
      status: String(row.status ?? "draft"),
      updatedAt: String(row.updatedAt ?? row.createdAt ?? "-"),
      raw: row
    }),
    createPayload: (input) => ({ code: input.code, name: input.name }),
    editPayload: (input) => ({ name: input.name, status: input.status }),
    businessFilters: [
      { key: "status", label: "Homologación", value: "pending_homologation" },
      { key: "status", label: "Activos", value: "active" }
    ],
    statusOptions: ["draft", "active", "inactive", "pending_homologation", "archived"]
  }
};

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function CriticalDomainCrudView({ domain }: { domain: CriticalDomain }) {
  const config = criticalConfig[domain];
  const [records, setRecords] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const form = useForm<FormValues>({ defaultValues: { name: "", code: "", status: config.statusOptions[0] ?? "draft" } });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = (await request(config.listPath)) as Array<Record<string, unknown>>;
      const mapped = rows.map(config.toRecord);
      setRecords(mapped);
      const first = mapped[0]?.id ?? "";
      setSelected((prev) => prev || first);
      setLeftId((prev) => prev || first);
      setRightId((prev) => prev || mapped[1]?.id || first);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [domain]);

  const filteredRecords = useMemo(() => {
    if (activeFilter === "all") return records;
    const [key, value] = activeFilter.split(":");
    return records.filter((record) => String(record.raw[key] ?? record[key as keyof DomainRecord] ?? "") === value);
  }, [activeFilter, records]);

  const options: SmartSelectorOption[] = useMemo(
    () => records.map((r) => ({ id: r.id, label: r.name, meta: `${r.code} · ${r.status}` })),
    [records]
  );
  const contextualEntityType: ContextualEntityType | undefined = domain === "sku" ? "sku" : domain === "cliente" ? "cliente" : undefined;

  const submit = form.handleSubmit(async (input) => {
    const parsed = formSchema.safeParse(input);
    if (!parsed.success) {
      form.setError("name", { message: parsed.error.issues[0]?.message ?? "Validación inválida" });
      return;
    }

    try {
      if (config.createPath) {
        await request(config.createPath, { method: "POST", body: JSON.stringify(config.createPayload(parsed.data)) });
      }
      setSheetOpen(false);
      form.reset({ name: "", code: "", status: config.statusOptions[0] ?? "draft" });
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar");
    }
  });

  const selectedRecord = records.find((r) => r.id === selected) ?? null;

  return (
    <Layout title={config.title}>
      <PageHeader title={config.title} subtitle={config.subtitle} />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <KPIStatCard label="Registros" value={records.length} />
        <KPIStatCard label="Activos" value={records.filter((r) => r.status.includes("active") || r.status.includes("approved") || r.status.includes("confirmed")).length} />
        <KPIStatCard label="Dominio" value={domain} />
      </div>

      <section className="mb-4 rounded-xl border bg-white p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <button className={`rounded border px-3 py-1 text-sm ${activeFilter === "all" ? "bg-zinc-900 text-white" : ""}`} onClick={() => setActiveFilter("all")}>Todos</button>
          {config.businessFilters.map((filter) => {
            const key = `${filter.key}:${filter.value}`;
            return (
              <button key={key} className={`rounded border px-3 py-1 text-sm ${activeFilter === key ? "bg-zinc-900 text-white" : ""}`} onClick={() => setActiveFilter(key)}>
                {filter.label}
              </button>
            );
          })}
          <button className="ml-auto rounded bg-zinc-900 px-3 py-1 text-sm text-white" onClick={() => setSheetOpen(true)}>
            Crear / Editar
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <SmartSelector
            label={`Selector ${config.title}`}
            options={options}
            value={selected}
            loading={loading}
            error={error}
            onChange={setSelected}
            contextualConfig={contextualEntityType ? { entityType: contextualEntityType, originFlow: `${domain}-nested-flow` } : undefined}
          />
          <DataTable
            title={`Tabla ${config.title}`}
            loading={loading}
            error={error}
            columns={[
              { key: "name", header: "Nombre" },
              { key: "code", header: "Código" },
              { key: "status", header: "Estado" },
              { key: "updatedAt", header: "Actualizado" }
            ]}
            rows={filteredRecords}
            rowId={(r) => r.id}
            onEdit={(row) => {
              form.reset({ name: row.name, code: row.code, status: row.status });
              setSelected(row.id);
              setSheetOpen(true);
            }}
            onCreate={() => setSheetOpen(true)}
          />
        </div>
      </section>

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

      <section className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="mb-3 font-semibold">Acciones contextuales</h3>
        <div className="flex flex-wrap gap-2">
          <button className="rounded border px-3 py-1 text-sm" onClick={() => setSheetOpen(true)}>Crear</button>
          <button className="rounded border px-3 py-1 text-sm" onClick={() => selectedRecord && form.reset({ name: selectedRecord.name, code: selectedRecord.code, status: selectedRecord.status })}>Editar</button>
          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={async () => {
              if (!selectedRecord || !config.actionPath) return;
              try {
                await request(config.actionPath(selectedRecord.id), { method: "POST", body: "{}" });
                await load();
              } catch (actionError) {
                setError(actionError instanceof Error ? actionError.message : "No se pudo homologar");
              }
            }}
          >
            Homologar
          </button>
          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={async () => {
              if (!selectedRecord || !config.editPath) return;
              try {
                await request(config.editPath(selectedRecord.id), { method: "PATCH", body: JSON.stringify(config.editPayload(form.getValues())) });
                await load();
              } catch (actionError) {
                setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar");
              }
            }}
          >
            Guardar edición
          </button>
        </div>
      </section>

      {sheetOpen ? (
        <div className="fixed inset-0 z-50 bg-black/35">
          <div className="absolute inset-0 md:inset-auto md:right-0 md:top-0 md:h-full md:w-[560px]">
            <form className="h-full overflow-y-auto bg-white p-4" onSubmit={submit}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Formulario validado (RHF + Zod)</h3>
                <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => setSheetOpen(false)}>
                  Cerrar
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="mb-1 block text-sm">Nombre / Referencia</span>
                  <input className="w-full rounded border px-3 py-2" {...form.register("name")} />
                </label>
                <label>
                  <span className="mb-1 block text-sm">Código</span>
                  <input className="w-full rounded border px-3 py-2" {...form.register("code")} />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm">Estado / Campo negocio</span>
                  <select className="w-full rounded border px-3 py-2" {...form.register("status")}>
                    {config.statusOptions.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {form.formState.errors.name ? <p className="mt-2 text-sm text-red-600">{form.formState.errors.name.message}</p> : null}
              {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
              <button className="mt-4 w-full rounded bg-zinc-900 px-3 py-2 text-sm text-white" type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
