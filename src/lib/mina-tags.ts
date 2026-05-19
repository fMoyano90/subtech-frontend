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

export type PorticoStatus = "online" | "offline";

export type PorticoStatusId =
  | "cruce-polvorin"
  | "portico-950"
  | "niveles-inferiores"
  | "portico-840";

export interface PorticoStatusItem {
  id: PorticoStatusId;
  name: string;
  channelId: string;
  order: number;
  lastEntryId?: number;
  lastSeenAt?: string;
  lastValue?: string;
  status: PorticoStatus;
  checkedAt: string;
  offlineSince?: string;
}

export interface PorticoStatusResponse {
  items: PorticoStatusItem[];
  count: number;
}

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

export const CATEGORIES = [
  { key: "Personal", label: "Personas", accent: "#6FB0E2" },
  { key: "Maquinaria", label: "Maquinaria", accent: "#265291" },
  { key: "Flota Vehicular", label: "Vehículos", accent: "#D4A700" },
] as const;

export const POLLING_INTERVAL_MS = 30_000;
const DISPLAY_TIME_ZONE = "UTC";

// Chile changed from UTC-3 to UTC-4 on April 4, 2026.
// IoT devices still send timestamps with the old UTC-3 offset.
// We subtract -1 hour to display times in the new Chile winter time (UTC-4).
const DST_CHANGE_TS = Date.UTC(2026, 3, 4, 4, 0, 0) / 1000; // ~2026-04-04 00:00 CLT (UTC-4) = 04:00 UTC

function adjustTimestamp(ts: number): number {
  if (ts >= DST_CHANGE_TS) return ts - 3_600;
  return ts;
}

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

export function tsToDate(ts: number): Date {
  const adjusted = ts < 1e12 ? adjustTimestamp(ts) * 1000 : adjustTimestamp(ts / 1000) * 1000;
  return new Date(adjusted);
}

const localDateFormatter = new Intl.DateTimeFormat("es-CL", {
  timeZone: DISPLAY_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const localTimeFormatter = new Intl.DateTimeFormat("es-CL", {
  timeZone: DISPLAY_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatDate(ts: number): string {
  const parts = localDateFormatter.formatToParts(tsToDate(ts));
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  return `${day}/${month}/${year}`;
}

export function formatTime(ts: number): string {
  return localTimeFormatter.format(tsToDate(ts));
}

export function normalizeTag(raw: MinaTagRaw): MinaTag {
  return {
    ...raw,
    id: raw.id ?? `${raw.Etiqueta ?? raw.etiqueta ?? raw.UID ?? "unknown"}-${raw.timestap}`,
    uid: raw.UID ?? "",
    timestap: raw.timestap,
    categoria: raw.Categoria ?? raw.categoria ?? "",
    etiqueta: raw.Etiqueta ?? raw.etiqueta ?? "",
    ubicacion: raw.Ubicacion ?? raw.ubicacion ?? "",
    subcategoria: raw.Subcategoria ?? raw.subcategoria ?? "",
    portico: raw.Portico ?? raw.portico ?? "",
  };
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

export interface PageResult {
  tags: MinaTag[];
  nextCursor: string | undefined;
}

/** Fetches the latest record per unique etiqueta (current mine state). */
export async function fetchLatestMinaTags(): Promise<MinaTag[]> {
  const res = await fetchWithAuth<{ items: MinaTagRaw[]; count: number }>(
    '/mina-tags/latest',
  );
  return res.items.map(normalizeTag);
}

/** Fetches backend-computed online/offline status for each pórtico. */
export async function fetchPorticoStatuses(): Promise<PorticoStatusResponse> {
  return fetchWithAuth<PorticoStatusResponse>('/mina-tags/porticos/status');
}

/* ═══════════════════════════════════════════
   Recorrido types & fetchers
   ═══════════════════════════════════════════ */

export interface RecorridoStep {
  sequence: number;
  portico: string;
  timestap: number;
  ubicacion: string;
}

export interface EnrichedRecorridoStep extends RecorridoStep {
  porticoName: string;
  direction: {
    label: string;
    arrow: "↑" | "↓" | "→";
  };
  timeInSector: string;
}

export interface RecorridoResponse {
  etiqueta: string;
  date: string;
  count: number;
  steps: RecorridoStep[];
}

export interface EtiquetaOption {
  etiqueta: string;
  categoria: string;
}

export async function fetchEtiquetas(): Promise<EtiquetaOption[]> {
  const res = await fetchWithAuth<{ items: EtiquetaOption[]; count: number }>(
    '/mina-tags/etiquetas',
  );
  return res.items;
}

export async function fetchRecorrido(
  etiqueta: string,
  date: string,
): Promise<RecorridoResponse> {
  const params = new URLSearchParams({ etiqueta, date });
  return fetchWithAuth<RecorridoResponse>(`/mina-tags/recorrido?${params.toString()}`);
}

const PORTICO_NAME_MAP: Record<string, string> = {
  "840": "Bocamina Cota 840",
  "950": "Bocamina Cota 950",
  cruce: "Cruce Polvorín",
  inferior: "Niveles Inferiores",
};

function getPorticoDisplayName(portico: string): string {
  const lower = portico.toLowerCase();
  for (const [keyword, name] of Object.entries(PORTICO_NAME_MAP)) {
    if (lower.includes(keyword)) return name;
  }
  return portico;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seg en sector`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes} min ${remainingSeconds} seg en sector`
      : `${minutes} min en sector`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}min en sector`
    : `${hours}h en sector`;
}

export function enrichRecorridoSteps(steps: RecorridoStep[]): EnrichedRecorridoStep[] {
  return steps.map((step, index) => {
    const nextStep = steps[index + 1];
    const timeInSector = nextStep
      ? formatDuration(nextStep.timestap - step.timestap)
      : "Último registro";

    const currentLoc = step.ubicacion.toLowerCase();
    const nextLoc = nextStep?.ubicacion.toLowerCase() ?? "";

    let direction: { label: string; arrow: "↑" | "↓" | "→" };

    const isCurrentExterior =
      currentLoc.includes("exterior") || currentLoc.includes("mina exterior");
    const isNextExterior =
      nextLoc.includes("exterior") || nextLoc.includes("mina exterior");
    const isCurrentInterior =
      currentLoc.includes("nivel") && !isCurrentExterior;
    const isNextInterior = nextLoc.includes("nivel") && !isNextExterior;

    if (isCurrentExterior && isNextInterior) {
      direction = { label: "Entrando a mina", arrow: "↓" };
    } else if (isCurrentInterior && isNextExterior) {
      direction = { label: "Saliendo de mina", arrow: "↑" };
    } else if (isCurrentInterior && isNextInterior) {
      const currentLevel = currentLoc.includes("superior")
        ? 3
        : currentLoc.includes("medio")
          ? 2
          : 1;
      const nextLevel = nextLoc.includes("superior")
        ? 3
        : nextLoc.includes("medio")
          ? 2
          : 1;
      if (nextLevel > currentLevel) {
        direction = { label: "Subiendo por ramal", arrow: "↑" };
      } else if (nextLevel < currentLevel) {
        direction = { label: "Bajando por ramal", arrow: "↓" };
      } else {
        direction = { label: "Mismo nivel", arrow: "→" };
      }
    } else {
      direction = { label: "En sector", arrow: "→" };
    }

    return {
      ...step,
      porticoName: getPorticoDisplayName(step.portico),
      direction,
      timeInSector,
    };
  });
}

/** Fetches a single page of mina tags (most recent first). */
export async function fetchMinaTagsPage(cursor?: string): Promise<PageResult> {
  const params = new URLSearchParams({ limit: "50" });
  if (cursor) params.set("cursor", cursor);
  const res = await fetchWithAuth<PaginatedResponse>(
    `/mina-tags?${params.toString()}`,
  );
  return {
    tags: res.items.map(normalizeTag),
    nextCursor: res.hasMore ? res.lastEvaluatedKey : undefined,
  };
}
