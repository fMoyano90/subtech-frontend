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

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

export function tsToDate(ts: number): Date {
  return new Date(ts < 1e12 ? ts * 1000 : ts);
}

export function formatDate(ts: number): string {
  const date = tsToDate(ts);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

export function formatTime(ts: number): string {
  return tsToDate(ts).toLocaleTimeString("es-CL", { hour12: false });
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
