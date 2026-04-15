"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { KPIStatCard } from "@/components/ui/KPIStatCard";
import { DataTable } from "@/components/ui/DataTable";
import { SmartSelector, type ContextualEntityType, type SmartSelectorOption } from "@/components/ui/SmartSelector";
import { MergeComparePanel } from "@/components/ui/MergeComparePanel";
import { Skeletons } from "@/components/ui/Skeletons";
import { ToastAnchor, useToasts } from "@/components/ui/Toasts";
import { useWarmupState } from "@/components/ui/useWarmupState";

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

type SaveState = "idle" | "saving" | "success";

type HighlightKind = "new" | "updated";

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

const contextualEntityByDomain: Partial<Record<string, ContextualEntityType>> = {
  "catalogo-presentaciones": "presentacion",
  "catalogo-unidades": "unidad",
  "catalogo-alias": "alias",
  "abastecimiento-proveedores": "proveedor",
  "comercial-listas": "lista",
  "finanzas-tesoreria": "cuenta"
};

export function DomainCrudView({ title, subtitle, domain }: DomainCrudViewProps) {
  const contextualToastAnchor = `${domain}-contextual-toast`;
  const [records, setRecords] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");
  const { pushToast } = useToasts();
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [highlights, setHighlights] = useState<Record<string, HighlightKind>>({});
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingPhase = useWarmupState(loading, { warmupMs: 170 });
  const showLoadingSkeleton = loadingPhase === "loading";
  const isBusy = loadingPhase !== "idle";

  const form = useForm<FormValues>({
    defaultValues: { name: "", code: "", status: "draft" }
  });

  useEffect(
    () => () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 520);
    return () => clearTimeout(timer);
  }, []);

  const options: SmartSelectorOption[] = useMemo(() => records.map((r) => ({ id: r.id, label: r.name, meta: `${r.code} · ${r.status}` })), [records]);

  const currentRules = domainRuleMap[domain] ?? defaultRuleConfig;
  const selectedStatus = form.watch("status");
  const currentWarning = currentRules.disabledStatuses.includes(selectedStatus)
    ? `Estado bloqueado para ${domain}: corregí el registro para poder guardar.`
    : currentRules.blockReason;
  const saveBlocked = Boolean(currentWarning) || saveState === "saving";

  const markRow = (id: string, kind: HighlightKind) => {
    setHighlights((prev) => ({ ...prev, [id]: kind }));
    setTimeout(() => {
      setHighlights((prev) => {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      });
    }, 1700);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSuccess(null);
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      form.setError("name", { message: parsed.error.issues[0]?.message ?? "Validación" });
      return;
    }

    if (currentRules.disabledStatuses.includes(parsed.data.status)) {
      form.setError("status", { message: `El estado ${parsed.data.status} está bloqueado para este dominio.` });
      return;
    }

    setSaveState("saving");
    pushToast({
      title: "Procesando cambios",
      description: "Estamos validando y guardando el registro.",
      tone: "processing",
      durationMs: 5000,
      anchorId: contextualToastAnchor,
      groupKey: `${domain}:save-processing`
    });
    await new Promise((resolve) => setTimeout(resolve, 450));

    const currentDate = new Date().toISOString().slice(0, 10);
    const editing = selected ? records.find((record) => record.id === selected) : null;

    if (editing) {
      const updated: DomainRecord = { ...editing, ...parsed.data, updatedAt: currentDate };
      setRecords((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
      setSuccess("Registro actualizado correctamente.");
      setSelected(updated.id);
      markRow(updated.id, "updated");
      pushToast({
        title: "Registro actualizado",
        description: updated.name,
        tone: "success",
        anchorId: contextualToastAnchor,
        groupKey: `${domain}:record-updated`
      });
    } else {
      const created: DomainRecord = {
        id: `${domain}-${Date.now()}`,
        name: parsed.data.name,
        code: parsed.data.code,
        status: parsed.data.status,
        updatedAt: currentDate
      };
      setRecords((prev) => [created, ...prev]);
      setSelected(created.id);
      setSuccess("Registro guardado correctamente.");
      markRow(created.id, "new");
      pushToast({
        title: "Registro guardado",
        description: parsed.data.name,
        tone: "success",
        anchorId: contextualToastAnchor,
        groupKey: `${domain}:record-created`
      });
    }

    setSaveState("success");
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setSaveState("idle");
      successTimeoutRef.current = null;
    }, 1300);
    form.reset({ name: "", code: "", status: "draft" });
  });

  const selectedRecord = records.find((r) => r.id === selected) ?? null;
  const contextualEntityType = contextualEntityByDomain[domain];

  return (
    <Layout title={title} transitionPreset="elevate-in">
      <PageHeader title={title} subtitle={subtitle} />
      {showLoadingSkeleton ? (
        <section aria-label="Cargando resumen y edición del dominio" className="space-y-4">
          <Skeletons variant="dashboard" rows={3} />
          <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
            <div className="rounded-xl border border-zinc-200/80 p-3 dark:border-zinc-800/80">
              <Skeletons variant="avatar" rows={3} density="compact" />
            </div>
            <Skeletons variant="form" density="normal" />
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-3" aria-label="Resumen del dominio">
            <KPIStatCard label="Registros" value={records.length} />
            <KPIStatCard label="Activos" value={records.filter((r) => r.status === "active").length} />
            <KPIStatCard label="Dominio" value={domain} />
          </section>

          <div className="relative grid gap-4 lg:grid-cols-[1.1fr_2fr]">
            <ToastAnchor anchorId={contextualToastAnchor} />
            <SmartSelector
              label={`Selector de ${domain}`}
              options={options}
              value={selected}
              loading={isBusy}
              error={error}
              onChange={setSelected}
              contextualConfig={contextualEntityType ? { entityType: contextualEntityType, originFlow: domain } : undefined}
              onCreateOption={async (input) => {
                const created: DomainRecord = {
                  id: `${domain}-${Date.now()}`,
                  name: input.label,
                  code: `AUTO-${records.length + 1}`,
                  status: "draft",
                  updatedAt: new Date().toISOString().slice(0, 10)
                };
                setRecords((prev) => [created, ...prev]);
                markRow(created.id, "new");
                setSuccess("Alta rápida creada correctamente.");
                pushToast({
                  title: "Alta rápida creada",
                  description: created.name,
                  tone: "success",
                  anchorId: contextualToastAnchor,
                  groupKey: `${domain}:quick-create`
                });
                return { id: created.id, label: created.name, meta: created.code };
              }}
            />

            <form className="card-base" onSubmit={onSubmit}>
              <h3 className="mb-3 text-base font-semibold">Crear / Editar</h3>
              {currentRules.warnings.length ? (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                  {currentRules.warnings.map((warning) => (
                    <p key={warning}>⚠ {warning}</p>
                  ))}
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2">
                <label htmlFor="domain-name">
                  <span className="mb-1 block text-sm font-medium">Nombre</span>
                  <input
                    id="domain-name"
                    className={`input-base focus-premium w-full ${form.formState.errors.name ? "border-red-300" : ""}`}
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? <p className="mt-1 text-sm text-red-600 animate-inline-status">{form.formState.errors.name.message}</p> : null}
                </label>
                <label htmlFor="domain-code">
                  <span className="mb-1 block text-sm font-medium">Código</span>
                  <input
                    id="domain-code"
                    className={`input-base focus-premium w-full ${form.formState.errors.code ? "border-red-300" : ""}`}
                    {...form.register("code")}
                  />
                  {form.formState.errors.code ? <p className="mt-1 text-sm text-red-600 animate-inline-status">{form.formState.errors.code.message}</p> : null}
                </label>
                <label htmlFor="domain-status">
                  <span className="mb-1 block text-sm font-medium">Estado</span>
                  <select
                    id="domain-status"
                    className={`input-base focus-premium w-full ${form.formState.errors.status ? "border-red-300" : ""}`}
                    {...form.register("status")}
                  >
                    <option value="draft">Borrador</option>
                    <option value="active">Activo</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                  {form.formState.errors.status ? <p className="mt-1 text-sm text-red-600 animate-inline-status">{form.formState.errors.status.message}</p> : null}
                </label>
              </div>
              {currentWarning ? <p className="mt-2 text-sm text-amber-700 animate-inline-status">⛔ {currentWarning}</p> : null}
              <button
                className={`btn-primary mt-3 inline-flex items-center justify-center focus-premium ${saveState === "success" ? "btn-save-success-ring" : ""}`}
                type="submit"
                disabled={saveBlocked}
                aria-live="polite"
              >
                <span className="save-label-stack" aria-hidden="true">
                  <span className={`save-label ${saveState === "idle" ? "save-label-visible" : "save-label-hidden"}`}>Guardar</span>
                  <span className={`save-label ${saveState === "saving" ? "save-label-visible" : "save-label-hidden"}`}>
                    <svg className="h-4 w-4 animate-spin text-white dark:text-zinc-900" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" className="opacity-30" stroke="currentColor" strokeWidth="3" />
                      <path d="M12 3a9 9 0 0 1 9 9" className="opacity-100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Guardando...
                  </span>
                  <span className={`save-label ${saveState === "success" ? "save-label-visible" : "save-label-hidden"}`}>✓ Guardado</span>
                </span>
                <span className="sr-only">
                  {saveState === "saving" ? "Guardando" : saveState === "success" ? "Guardado" : "Guardar"}
                </span>
              </button>
            </form>
          </div>
        </>
      )}

      <DataTable
        title={`Tabla ${domain}`}
        loading={isBusy}
        error={error}
        emptyMessage={`No hay registros cargados en ${domain} todavía.`}
        successMessage={success}
        columns={[
          { key: "name", header: "Nombre" },
          { key: "code", header: "Código" },
          { key: "status", header: "Estado" },
          { key: "updatedAt", header: "Actualizado" }
        ]}
        rows={records}
        rowId={(r) => r.id}
        getRowClassName={(row) =>
          highlights[row.id] === "new"
            ? "animate-row-highlight-new bg-emerald-50/70 dark:bg-emerald-950/20"
            : highlights[row.id] === "updated"
              ? "animate-row-highlight-updated bg-sky-50/70 dark:bg-sky-950/20"
              : ""
        }
        onCreate={() => form.setFocus("name")}
        onEdit={(row) => {
          form.reset({ name: row.name, code: row.code, status: row.status });
          setSelected(row.id);
          setSuccess("Registro cargado para edición.");
          pushToast({
            title: "Edición lista",
            description: row.name,
            tone: "processing",
            durationMs: 2200,
            anchorId: contextualToastAnchor,
            groupKey: `${domain}:edit-ready`
          });
        }}
        onDelete={(row) => {
          setRecords((prev) => prev.filter((r) => r.id !== row.id));
          setSuccess("Registro eliminado correctamente.");
          pushToast({
            title: "Registro eliminado",
            description: row.name,
            tone: "info",
            anchorId: contextualToastAnchor,
            groupKey: `${domain}:record-deleted`
          });
        }}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SmartSelector label="Registro A" options={options} value={leftId} onChange={setLeftId} />
        <SmartSelector label="Registro B" options={options} value={rightId} onChange={setRightId} />
      </div>
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
          setSuccess("Registros fusionados correctamente.");
          pushToast({
            title: "Registros fusionados",
            tone: "success",
            anchorId: contextualToastAnchor,
            groupKey: `${domain}:record-merged`
          });
        }}
      />
    </Layout>
  );
}
