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

type DomainRuleConfig = {
  disabledStatuses: DomainRecord["status"][];
  warnings: string[];
  blockReason?: string;
};

const domainRuleMap: Record<string, DomainRuleConfig> = {
  "operacion-produccion": {
    disabledStatuses: ["blocked"],
    warnings: ["Solo podés crear órdenes con fórmulas vigentes y cantidad planificada > 0."]
  },
  "operacion-produccion-nueva": {
    disabledStatuses: ["blocked"],
    warnings: ["Antes de guardar, verificá fórmula aprobada y stock de insumos suficiente."]
  },
  "operacion-fraccionamiento": {
    disabledStatuses: ["blocked"],
    warnings: ["No se permite fraccionar lotes retenidos ni cantidades menores o iguales a 0."]
  },
  "stock-movimientos": {
    disabledStatuses: [],
    warnings: ["Los ajustes de stock requieren motivo y no aceptan cantidad 0."]
  },
  "stock-balance": {
    disabledStatuses: [],
    warnings: ["No se permiten saldos de stock inicial negativos."]
  },
  "stock-inventarios": {
    disabledStatuses: [],
    warnings: ["Cada conteo debe tener justificación cuando exista diferencia de inventario."]
  },
  "comercial-pedidos": {
    disabledStatuses: ["blocked"],
    warnings: ["Un pedido de venta requiere cliente, lista de precios y total mayor a 0."]
  },
  "finanzas-cobranzas": {
    disabledStatuses: ["blocked"],
    warnings: ["Las cobranzas no se confirman sin documento de respaldo ni importe válido."]
  },
  "finanzas-pagos": {
    disabledStatuses: ["blocked"],
    warnings: ["Los pagos se bloquean cuando faltan aprobaciones o el importe es inválido."]
  },
  "comercial-listas": {
    disabledStatuses: ["blocked"],
    warnings: ["Las listas de precio activas deben tener código único y precio positivo."]
  },
  "comercial-clientes-homologacion": {
    disabledStatuses: ["blocked"],
    warnings: ["No se puede homologar un cliente en estado bloqueado."]
  },
  "sistema-importaciones": {
    disabledStatuses: ["blocked"],
    warnings: ["La importación se bloquea si hay pendientes de homologación o mapping vacío."]
  }
};

const defaultRuleConfig: DomainRuleConfig = {
  disabledStatuses: [],
  warnings: []
};

export function DomainCrudView({ title, subtitle, domain }: DomainCrudViewProps) {
  const [records, setRecords] = useState<DomainRecord[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const form = useForm<FormValues>({
    defaultValues: { name: "", code: "", status: "draft" }
  });

  const options: SmartSelectorOption[] = useMemo(
    () => records.map((r) => ({ id: r.id, label: r.name, meta: `${r.code} · ${r.status}` })),
    [records]
  );

  const currentRules = domainRuleMap[domain] ?? defaultRuleConfig;
  const selectedStatus = form.watch("status");
  const currentWarning = currentRules.disabledStatuses.includes(selectedStatus)
    ? `Estado bloqueado para ${domain}: corregí el registro para poder guardar.`
    : currentRules.blockReason;
  const saveBlocked = Boolean(currentWarning);

  const onSubmit = form.handleSubmit((values) => {
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      form.setError("name", { message: parsed.error.issues[0]?.message ?? "Validación" });
      return;
    }

    if (currentRules.disabledStatuses.includes(parsed.data.status)) {
      form.setError("status", { message: `El estado ${parsed.data.status} está bloqueado para este dominio.` });
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
          {currentRules.warnings.length ? (
            <div className="mb-3 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
              {currentRules.warnings.map((warning) => (
                <p key={warning}>⚠ {warning}</p>
              ))}
            </div>
          ) : null}
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
          {form.formState.errors.status ? <p className="mt-2 text-sm text-red-600">{form.formState.errors.status.message}</p> : null}
          {currentWarning ? <p className="mt-2 text-sm text-amber-700">⛔ {currentWarning}</p> : null}
          <button className="mt-3 rounded bg-zinc-900 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-zinc-400" type="submit" disabled={saveBlocked}>
            Guardar
          </button>
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
