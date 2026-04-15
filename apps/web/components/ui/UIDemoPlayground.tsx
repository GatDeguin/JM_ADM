"use client";

import { useState } from "react";
import { AttachmentUploader } from "./AttachmentUploader";
import { CommandPalette } from "./CommandPalette";
import { ConfirmDialog } from "./ConfirmDialog";
import { DataCards } from "./DataCards";
import { DetailTabs } from "./DetailTabs";
import { EntityChip } from "./EntityChip";
import { MobileStickyCTA } from "./MobileStickyCTA";

export function UIDemoPlayground() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="space-y-6">
      <section className="card-base space-y-3">
        <h2 className="text-lg font-semibold">EntityChip + DataCards</h2>
        <div className="flex flex-wrap gap-2">
          <EntityChip label="Cliente A" subtitle="Activo" tone="success" />
          <EntityChip label="Proveedor B" tone="warning" loading />
          <EntityChip label="Bloqueado" tone="danger" disabled />
        </div>
        <DataCards
          title="KPIs demo"
          items={[
            { id: "1", label: "Tickets", value: 24, helper: "+6 vs semana pasada", tone: "success" },
            { id: "2", label: "Errores", value: 3, helper: "Pendientes de revisión", tone: "warning" },
            { id: "3", label: "Backlog", value: 11, helper: "Objetivo < 8", tone: "danger" }
          ]}
        />
      </section>

      <DetailTabs
        tabs={[
          { id: "resumen", label: "Resumen", content: <p className="text-sm">Resumen visual del flujo.</p> },
          { id: "actividad", label: "Actividad", content: <p className="text-sm">Timeline y auditoría.</p> },
          { id: "adjuntos", label: "Adjuntos", content: <AttachmentUploader entityType="demo" entityId="ui-kit" /> }
        ]}
      />

      <section className="card-base flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => setDialogOpen(true)}>
          Abrir ConfirmDialog
        </button>
        <button type="button" className="btn-secondary" onClick={() => setPaletteOpen(true)}>
          Abrir CommandPalette
        </button>
      </section>

      <ConfirmDialog
        open={dialogOpen}
        title="Confirmar acción"
        description="Esta acción elimina el borrador actual."
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => setDialogOpen(false)}
        confirmLabel="Eliminar"
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={[
          { id: "go-home", title: "Ir a inicio", subtitle: "Navega al dashboard", onSelect: () => window.alert("Inicio") },
          { id: "create", title: "Crear registro", subtitle: "Alta rápida", keywords: ["nuevo", "alta"], onSelect: () => window.alert("Crear") }
        ]}
      />

      <MobileStickyCTA label="Guardar cambios" onClick={() => window.alert("Guardado demo")} helperText="Visible solo en mobile" />
    </div>
  );
}
