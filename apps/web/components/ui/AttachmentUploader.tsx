"use client";

import { useId, useMemo, useRef, useState } from "react";

import { API_BASE_URL } from "@/lib/env";

export type UploadedAttachment = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  entityType: string;
  entityId: string;
  status: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type AttachmentUploaderProps = {
  entityType: string;
  entityId: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  maxSizeMb?: number;
  metadata?: Record<string, unknown>;
  onUploaded?: (attachments: UploadedAttachment[]) => void;
};

async function uploadSingleFile(params: {
  file: File;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<UploadedAttachment> {
  const body = new FormData();
  body.append("file", params.file);
  body.append("entityType", params.entityType);
  body.append("entityId", params.entityId);
  if (params.metadata) {
    body.append("metadata", JSON.stringify(params.metadata));
  }

  const response = await fetch(`${API_BASE_URL}/attachments/upload`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? "No se pudo subir el archivo");
  }

  return (await response.json()) as UploadedAttachment;
}

export function AttachmentUploader({
  entityType,
  entityId,
  accept,
  multiple,
  disabled,
  loading,
  error,
  maxSizeMb = 10,
  metadata,
  onUploaded,
}: AttachmentUploaderProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recentUploads, setRecentUploads] = useState<UploadedAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  const resolvedError = error ?? internalError;
  const busy = loading || uploading;

  const helper = useMemo(() => {
    const suffix = multiple ? "s" : "";
    return `Máximo ${maxSizeMb}MB por archivo${suffix}.`;
  }, [maxSizeMb, multiple]);

  const onFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return;

    setInternalError(null);
    const maxBytes = maxSizeMb * 1024 * 1024;
    const chosen = Array.from(files);
    const oversized = chosen.find((file) => file.size > maxBytes);
    if (oversized) {
      setInternalError(`El archivo ${oversized.name} supera ${maxSizeMb}MB.`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        chosen.map((file) => uploadSingleFile({ file, entityType, entityId, metadata })),
      );
      setRecentUploads((prev) => [...uploaded, ...prev].slice(0, 6));
      onUploaded?.(uploaded);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (uploadError) {
      setInternalError(
        uploadError instanceof Error ? uploadError.message : "Error al subir archivos",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="card-base space-y-3" aria-busy={busy}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Adjuntos</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{helper}</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          disabled={disabled || busy}
          onClick={() => fileInputRef.current?.click()}
        >
          {busy ? "Subiendo..." : "Seleccionar archivo"}
        </button>
      </div>

      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled || busy}
        onChange={(event) => void onFilesSelected(event.target.files)}
      />
      <label htmlFor={inputId} className="sr-only">
        Subir adjunto
      </label>

      {resolvedError ? (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {resolvedError}
        </p>
      ) : null}

      {recentUploads.length ? (
        <ul className="space-y-2" aria-label="Archivos subidos">
          {recentUploads.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                  {item.fileName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {(item.size / 1024).toFixed(1)} KB · {item.mimeType}
                </p>
              </div>
              <a href={item.url} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
                Ver
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
