const abbreviations: Record<string, string> = {
  prov: "proveedor",
  cte: "cliente",
  clte: "cliente",
  sr: "senor",
  sra: "senora",
  av: "avenida",
};

export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .map((token) => abbreviations[token] ?? token)
    .join(" ")
    .trim();
}

export function normalizeCode(value: unknown): string {
  return normalizeText(value).replace(/[^a-z0-9]/g, "").toUpperCase();
}

export function isPendingHomologation(value: unknown): boolean {
  const normalized = normalizeText(value);
  return ["si", "sí", "yes", "true", "1", "pending_homologation", "pendiente"].includes(normalized);
}
