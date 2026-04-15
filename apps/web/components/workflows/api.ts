import { API_BASE_URL } from "@/lib/env";

type RequestOptions = RequestInit & { skipJson?: boolean };

export async function apiRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (response.status === 204 || options?.skipJson) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function logOriginAudit(params: {
  entity: string;
  entityId: string;
  action: string;
  origin: string;
}) {
  try {
    await apiRequest("/audit", {
      method: "POST",
      body: JSON.stringify(params),
    });
  } catch {
    // El flujo principal no debe fallar por errores de auditoría.
  }
}
