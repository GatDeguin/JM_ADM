"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/env";
import { QuickCreateSheet } from "@/components/ui/QuickCreateSheet";
import { logOriginAudit } from "@/components/workflows/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeletons } from "@/components/ui/Skeletons";

export type SmartSelectorOption = { id: string; label: string; meta?: string };
export type ContextualEntityType =
  | "producto"
  | "variante"
  | "presentacion"
  | "unidad"
  | "sku"
  | "alias"
  | "proveedor"
  | "cliente"
  | "direccion"
  | "lista"
  | "cuenta"
  | "cuenta_cobrar"
  | "cuenta_pagar"
  | "formula_version";

type SmartSelectorProps = {
  label: string;
  options: SmartSelectorOption[];
  value?: string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onChange: (value: string) => void;
  onCreateOption?: (input: { label: string; meta?: string }) => Promise<SmartSelectorOption>;
  contextualConfig?: {
    entityType: ContextualEntityType;
    originFlow?: string;
    context?: Record<string, unknown>;
  };
};

export function SmartSelector({
  label,
  options,
  value,
  loading,
  error,
  emptyMessage = "Sin opciones disponibles.",
  onChange,
  onCreateOption,
  contextualConfig,
}: SmartSelectorProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const [contextualOptions, setContextualOptions] = useState<SmartSelectorOption[]>([]);
  const [contextualError, setContextualError] = useState<string | null>(null);

  const inputId = useMemo(
    () => `selector-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    [label],
  );

  useEffect(() => {
    if (!contextualConfig) return;
    const loadOptions = async () => {
      setContextualError(null);
      const response = await fetch(
        `${API_BASE_URL}/masters/contextual/entities/${contextualConfig.entityType}/options`,
      );
      if (!response.ok) {
        setContextualError("No se pudieron cargar opciones contextuales.");
        return;
      }
      const payload = (await response.json()) as SmartSelectorOption[];
      setContextualOptions(payload);
    };
    void loadOptions();
  }, [contextualConfig]);

  const createContextualOption = async (payload: { label: string; meta?: string }) => {
    if (!contextualConfig) return onCreateOption?.(payload);
    const response = await fetch(
      `${API_BASE_URL}/masters/contextual/entities/${contextualConfig.entityType}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, originFlow: contextualConfig.originFlow, context: contextualConfig.context }),
      },
    );
    if (!response.ok) throw new Error(await response.text());
    const created = (await response.json()) as SmartSelectorOption;
    setContextualOptions((prev) => [created, ...prev]);
    await logOriginAudit({
      entity: contextualConfig.entityType,
      entityId: created.id,
      action: "contextual-create",
      origin: contextualConfig.originFlow ?? "nested-flow",
    });
    return created;
  };



  useEffect(() => {
    if (!contextualConfig || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const selectedType = params.get("contextualEntityType");
    const selectedId = params.get("contextualEntityId");
    if (selectedType !== contextualConfig.entityType || !selectedId) return;

    onChange(selectedId);
    params.delete("contextualEntityType");
    params.delete("contextualEntityId");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [contextualConfig, onChange, pathname, router]);
  const sourceOptions = useMemo(() => {
    if (!contextualConfig) return options;
    return [
      ...contextualOptions,
      ...options.filter((option) => !contextualOptions.some((ctx) => ctx.id === option.id)),
    ];
  }, [contextualConfig, contextualOptions, options]);

  const filtered = useMemo(
    () => sourceOptions.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [sourceOptions, query],
  );

  return (
    <section className="card-base">
      <label className="mb-2 block text-sm font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="input-base mb-3 w-full"
        placeholder="Buscar opción"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading ? <Skeletons variant="avatar" rows={3} density="compact" /> : null}
      {error || contextualError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
          {error ?? contextualError}
        </p>
      ) : null}
      {!loading && !error && !contextualError && filtered.length === 0 ? (
        <EmptyState title="Sin coincidencias" subtitle={emptyMessage} />
      ) : null}
      <div className="space-y-1" role="listbox" aria-label={label}>
        {filtered.map((option) => (
          <button
            key={option.id}
            role="option"
            type="button"
            aria-selected={value === option.id}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              value === option.id
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            }`}
            onClick={() => onChange(option.id)}
          >
            <div>{option.label}</div>
            {option.meta ? <div className="text-xs opacity-80">{option.meta}</div> : null}
          </button>
        ))}
      </div>
      {onCreateOption || contextualConfig ? (
        <div className="mt-3">
          <QuickCreateSheet<{ label: string; meta: string }>
            title={`Crear desde ${label}`}
            originFlow={contextualConfig?.originFlow}
            fields={[
              { key: "label", label: "Nombre" },
              { key: "meta", label: "Descripción" },
            ]}
            onCreate={async (payload) => {
              const created = await createContextualOption(payload);
              if (!created) return;
              onChange(created.id);
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
