import { fetchWithAuth } from "@/lib/api";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export interface MinaTagRaw {
  UID?: string;
  id?: string;
  timestap: number;
  Categoria?: string;
  categoria?: string;
  Etiqueta?: string;
  etiqueta?: string;
  Ubicacion?: string;
  ubicacion?: string;
  Subcategoria?: string;
  subcategoria?: string;
  Portico?: string;
  portico?: string;
  [key: string]: unknown;
}

export interface MinaTag {
  id: string;
  uid: string;
  timestap: number;
  categoria: string;
  etiqueta: string;
  ubicacion: string;
  subcategoria: string;
  portico: string;
  [key: string]: unknown;
}

export interface PaginatedResponse {
  items: MinaTagRaw[];
  lastEvaluatedKey?: string;
  count: number;
  hasMore: boolean;
}

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

export const CATEGORIES = [
  { key: "Personal", label: "Personas", accent: "#6FB0E2" },
  { key: "Maquinaria", label: "Camiones", accent: "#265291" },
  { key: "Flota Vehicular", label: "Vehículos", accent: "#D4A700" },
] as const;

export const POLLING_INTERVAL_MS = 30_000;
export const CHILE_TIME_ZONE = "America/Santiago";

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

export function tsToDate(ts: number): Date {
  return new Date(ts < 1e12 ? ts * 1000 : ts);
}

const chileDateFormatter = new Intl.DateTimeFormat("es-CL", {
  timeZone: CHILE_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const chileTimeFormatter = new Intl.DateTimeFormat("es-CL", {
  timeZone: CHILE_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatDate(ts: number): string {
  const parts = chileDateFormatter.formatToParts(tsToDate(ts));
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  return `${day}/${month}/${year}`;
}

export function formatTime(ts: number): string {
  return chileTimeFormatter.format(tsToDate(ts));
}

export function normalizeTag(raw: MinaTagRaw): MinaTag {
  return {
    ...raw,
    id: raw.id ?? `${raw.UID ?? ""}-${raw.timestap}`,
    uid: raw.UID ?? "",
    timestap: raw.timestap,
    categoria: raw.Categoria ?? raw.categoria ?? "",
    etiqueta: raw.Etiqueta ?? raw.etiqueta ?? "",
    ubicacion: raw.Ubicacion ?? raw.ubicacion ?? "",
    subcategoria: raw.Subcategoria ?? raw.subcategoria ?? "",
    portico: raw.Portico ?? raw.portico ?? "",
  };
}

export function getLatestPerEtiqueta(tags: MinaTag[]): MinaTag[] {
  const map = new Map<string, MinaTag>();
  for (const tag of tags) {
    const existing = map.get(tag.etiqueta);
    if (!existing || tag.timestap > existing.timestap) {
      map.set(tag.etiqueta, tag);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.timestap - a.timestap);
}

export function hasMeaningfulTagChanges(
  prev: MinaTag[],
  next: MinaTag[],
): boolean {
  if (prev.length !== next.length) return true;

  const prevById = new Map(
    prev.map((tag) => [
      tag.id,
      `${tag.timestap}|${tag.categoria}|${tag.etiqueta}|${tag.ubicacion}`,
    ]),
  );

  for (const tag of next) {
    const current = `${tag.timestap}|${tag.categoria}|${tag.etiqueta}|${tag.ubicacion}`;
    if (prevById.get(tag.id) !== current) {
      return true;
    }
  }

  return false;
}

export async function fetchAllMinaTags(): Promise<MinaTag[]> {
  const all: MinaTag[] = [];
  let cursor: string | undefined;
  do {
    const params = new URLSearchParams({ limit: "100" });
    if (cursor) params.set("cursor", cursor);
    const res = await fetchWithAuth<PaginatedResponse>(
      `/mina-tags?${params.toString()}`,
    );
    all.push(...res.items.map(normalizeTag));
    cursor = res.hasMore ? res.lastEvaluatedKey : undefined;
  } while (cursor);
  return all;
}
