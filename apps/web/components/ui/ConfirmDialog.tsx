"use client";

import { useEffect, useId, useRef } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  disabled,
  loading,
  error,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="presentation">
      <button aria-label="Cerrar diálogo" type="button" className="absolute inset-0 cursor-default" onClick={onCancel} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        ) : null}
        {error ? <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={disabled || loading}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="btn-primary"
            onClick={() => void onConfirm()}
            disabled={disabled || loading}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
