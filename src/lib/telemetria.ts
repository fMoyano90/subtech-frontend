import { fetchWithAuth } from "@/lib/api";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export type MachineStatus = "online" | "stale" | "offline";

export interface TelemetryMachine {
  ident: string;
  nombre: string;
  modelo: string;
  categoria: string;
  firstSeen: number;
  lastSeen: number;
  count: number;
  status: MachineStatus;
}

export interface TelemetrySummary {
  fuelRateAvg: number | null;
  fuelRateSampleCount: number;
  docCount: number;
}

export interface TelemetrySeries {
  ident: string;
  from: number;
  to: number;
  bucketSeconds: number;
  count: number;
  truncated: boolean;
  t: number[];
  series: Record<string, (number | null)[]>;
  summary: TelemetrySummary;
  params: { path: string; label: string; unit: string }[];
}

export interface TelemetryLatest {
  ident: string;
  lastSeen: number | null;
  hours: { value: number | null; at: number | null };
  dm1: Record<string, number> | null;
  dm1At: number | null;
  shutdown: Record<string, number> | null;
  shutdownAt: number | null;
}

/* ═══════════════════════════════════════════
   Catálogo de parámetros
   ═══════════════════════════════════════════ */

export interface ParamDef {
  path: string;
  label: string;
  /** Nombre corto para tarjetas angostas y medidores. */
  short: string;
  unit: string;
  decimals: number;
  /** Color de la traza. Cada parámetro tiene el suyo para poder leer la grilla de un vistazo. */
  color: string;
}

/**
 * Los 10 gráficos del dashboard. La lista de bullets de la especificación enumera 9 y
 * omite la temperatura de admisión, pero las notas confirmadas con el mecánico piden
 * "presión de admisión y temperatura de admisión: gráficos separados".
 */
export const PARAMS: ParamDef[] = [
  { path: "engine.rpm", label: "RPM", short: "RPM", unit: "rpm", decimals: 0, color: "#4DA6FF" },
  { path: "engine.coolant.temperature", label: "Temperatura Refrigerante", short: "Refrigerante", unit: "°C", decimals: 1, color: "#FF7A59" },
  { path: "engine.oil.temperature", label: "Temperatura Aceite", short: "Aceite", unit: "°C", decimals: 1, color: "#FFB13D" },
  { path: "engine.oil.pressure", label: "Presión de Aceite", short: "Presión aceite", unit: "kPa", decimals: 0, color: "#A78BFA" },
  { path: "engine.intake.pressure", label: "Presión de Admisión", short: "Presión admisión", unit: "kPa", decimals: 0, color: "#2DD4BF" },
  { path: "engine.intake.temperature", label: "Temperatura de Admisión", short: "Admisión", unit: "°C", decimals: 1, color: "#F472B6" },
  { path: "engine.percent.load", label: "Carga del Motor", short: "Carga", unit: "%", decimals: 0, color: "#C084FC" },
  { path: "engine.accelerator.pedal", label: "Posición del Acelerador", short: "Acelerador", unit: "%", decimals: 0, color: "#FDE047" },
  { path: "electrical.battery.voltage", label: "Voltaje de Batería", short: "Batería", unit: "V", decimals: 2, color: "#4ADE80" },
  { path: "vehicle.speed", label: "Velocidad", short: "Velocidad", unit: "km/h", decimals: 1, color: "#22D3EE" },
];

export function getParam(path: string): ParamDef | undefined {
  return PARAMS.find((param) => param.path === path);
}

/**
 * Medidores radiales de temperatura, al estilo del panel "Temperatures" de la referencia.
 *
 * Las escalas y los umbrales son referenciales, tomados de rangos típicos de un motor
 * diésel: no vienen de la especificación ni del fabricante. Confirmar con el mecánico
 * antes de que alguien tome una decisión de mantenimiento mirando el color.
 */
export interface GaugeSpec {
  path: string;
  min: number;
  max: number;
  warn: number;
  critical: number;
}

export const GAUGES: GaugeSpec[] = [
  { path: "engine.coolant.temperature", min: 0, max: 120, warn: 100, critical: 110 },
  { path: "engine.oil.temperature", min: 0, max: 140, warn: 115, critical: 130 },
  { path: "engine.intake.temperature", min: 0, max: 100, warn: 70, critical: 85 },
];

/** Arte de cada equipo. Un ident sin entrada cae a la silueta vectorial. */
export const MACHINE_ART: Record<string, string> = {
  "scoop-st1030-arduino": "/maquinaria/scoop-st1030.webp",
};

export const RANGE_PRESETS = [
  { key: "1h", label: "1 h", full: "la última hora", seconds: 3_600 },
  { key: "6h", label: "6 h", full: "las últimas 6 horas", seconds: 21_600 },
  { key: "24h", label: "24 h", full: "las últimas 24 horas", seconds: 86_400 },
  { key: "2d", label: "2 d", full: "los últimos 2 días", seconds: 172_800 },
  { key: "7d", label: "7 d", full: "los últimos 7 días", seconds: 604_800 },
] as const;

export type RangePresetKey = (typeof RANGE_PRESETS)[number]["key"];

export const DEFAULT_RANGE_PRESET: RangePresetKey = "2d";
export const POLLING_INTERVAL_MS = 30_000;
export const SYNC_KEY = "telemetria-charts";

/* Paleta de la superficie oscura, para lo que se dibuja en canvas y no puede usar Tailwind. */
export const CHART_GRID = "rgba(111,176,226,0.10)";
export const CHART_AXIS = "rgba(138,166,192,0.75)";

export function getPresetSeconds(key: RangePresetKey): number {
  return RANGE_PRESETS.find((preset) => preset.key === key)?.seconds ?? 172_800;
}

export function getPresetLabel(key: RangePresetKey): string {
  return RANGE_PRESETS.find((preset) => preset.key === key)?.full ?? key;
}

/**
 * Preset más chico que alcanza a contener un tramo de datos.
 *
 * Lo usa el salto al último período con datos: sin esto la ventana se queda en la que
 * el usuario tenía elegida (2 días por defecto) y una muestra de 46 minutos se dibuja
 * como una astilla pegada al borde derecho, con todo el resto vacío.
 */
export function pickPresetForSpan(spanSeconds: number): RangePresetKey {
  const fits = RANGE_PRESETS.find((preset) => preset.seconds >= spanSeconds);
  return (fits ?? RANGE_PRESETS[RANGE_PRESETS.length - 1]).key;
}

/* ═══════════════════════════════════════════
   Formato de tiempo
   ═══════════════════════════════════════════ */

/**
 * Flespi manda epoch UTC correcto, así que se formatea directo en la zona de Chile.
 * No usar los helpers de mina-tags.ts: esos restan una hora para compensar un desfase
 * propio de los equipos ThingSpeak, y aquí correrían todo el eje una hora.
 */
const CHILE_TZ = "America/Santiago";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  timeZone: CHILE_TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("es-CL", {
  timeZone: CHILE_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const timeSecondsFormatter = new Intl.DateTimeFormat("es-CL", {
  timeZone: CHILE_TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dayMonthFormatter = new Intl.DateTimeFormat("es-CL", {
  timeZone: CHILE_TZ,
  day: "2-digit",
  month: "2-digit",
});

export function tsToDate(ts: number): Date {
  return new Date(Math.trunc(ts) * 1000);
}

export function formatDate(ts: number): string {
  return dateFormatter.format(tsToDate(ts));
}

export function formatTime(ts: number): string {
  return timeFormatter.format(tsToDate(ts));
}

export function formatDateTime(ts: number): string {
  return `${formatDate(ts)} ${timeSecondsFormatter.format(tsToDate(ts))}`;
}

/** Compacto para tarjetas: "19/08 21:41". */
export function formatShortDateTime(ts: number): string {
  const date = tsToDate(ts);
  return `${dayMonthFormatter.format(date)} ${timeFormatter.format(date)}`;
}

/** "hace 3 h", "hace 5 días". */
export function formatRelative(ts: number, now = Date.now() / 1000): string {
  const seconds = Math.max(0, Math.floor(now - ts));
  if (seconds < 60) return "recién";
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86_400) return `hace ${Math.floor(seconds / 3600)} h`;
  const days = Math.floor(seconds / 86_400);
  return `hace ${days} ${days === 1 ? "día" : "días"}`;
}

/** Etiqueta del eje X: solo la hora en ventanas cortas, día y hora en las largas. */
export function formatAxisTick(ts: number, spanSeconds: number): string {
  const date = tsToDate(ts);
  return spanSeconds <= 36 * 3600
    ? timeFormatter.format(date)
    : `${dayMonthFormatter.format(date)} ${timeFormatter.format(date)}`;
}

export function formatBucket(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  return `${Math.round(seconds / 3600)} h`;
}

export function formatValue(
  value: number | null | undefined,
  decimals: number,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return value.toLocaleString("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Miles abreviados para el horómetro: 13.816,9 → "13.817". */
export function formatCompact(value: number | null, decimals = 0): string {
  return formatValue(value, decimals);
}

/* ═══════════════════════════════════════════
   Estadística de una serie
   ═══════════════════════════════════════════ */

export interface SeriesStats {
  min: number | null;
  max: number | null;
  avg: number | null;
  last: number | null;
  samples: number;
}

const EMPTY_STATS: SeriesStats = {
  min: null,
  max: null,
  avg: null,
  last: null,
  samples: 0,
};

export function computeStats(values: (number | null)[] | undefined): SeriesStats {
  if (!values || values.length === 0) return EMPTY_STATS;

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let samples = 0;
  let last: number | null = null;

  for (const value of values) {
    if (value === null || !Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
    sum += value;
    samples += 1;
    last = value;
  }

  if (samples === 0) return EMPTY_STATS;
  return { min, max, avg: sum / samples, last, samples };
}

/* ═══════════════════════════════════════════
   Estado operativo derivado
   ═══════════════════════════════════════════ */

export type OperatingState = "operando" | "ralenti" | "detenido" | "sin-datos";

export interface OperatingStateInfo {
  state: OperatingState;
  label: string;
  color: string;
}

const OPERATING_STATE: Record<OperatingState, OperatingStateInfo> = {
  operando: { state: "operando", label: "En operación", color: "#4ADE80" },
  ralenti: { state: "ralenti", label: "Motor en ralentí", color: "#FDE047" },
  detenido: { state: "detenido", label: "Detenido", color: "#8AA6C0" },
  "sin-datos": { state: "sin-datos", label: "Sin datos", color: "#5B7A96" },
};

/**
 * El estado no viene del equipo: se deduce del último punto del período que se está
 * mirando. Por eso las tarjetas lo rotulan como "según el último dato del período" y no
 * como un estado en vivo.
 */
export function deriveOperatingState(
  rpm: number | null,
  speed: number | null,
): OperatingStateInfo {
  if (rpm === null) return OPERATING_STATE["sin-datos"];
  if (rpm < 350) return OPERATING_STATE.detenido;
  if ((speed ?? 0) > 0.5) return OPERATING_STATE.operando;
  return OPERATING_STATE.ralenti;
}

export const STATUS_META: Record<
  MachineStatus,
  { label: string; short: string; color: string }
> = {
  online: { label: "Reportando ahora", short: "En línea", color: "#4ADE80" },
  stale: { label: "Sin reportar hace horas", short: "Con retraso", color: "#FDE047" },
  offline: { label: "Sin reportar", short: "Fuera de línea", color: "#8AA6C0" },
};

export function isMachineReporting(machine: TelemetryMachine): boolean {
  return machine.status === "online";
}

/* ═══════════════════════════════════════════
   Fetchers
   ═══════════════════════════════════════════ */

export async function fetchMachines(
  options?: RequestInit,
): Promise<TelemetryMachine[]> {
  const res = await fetchWithAuth<{
    items: TelemetryMachine[];
    count: number;
  }>("/telemetry/machines", options);
  return res.items;
}

export async function fetchLatest(
  ident: string,
  options?: RequestInit,
): Promise<TelemetryLatest> {
  return fetchWithAuth<TelemetryLatest>(
    `/telemetry/${encodeURIComponent(ident)}/latest`,
    options,
  );
}

export async function fetchSeries(
  ident: string,
  from: number,
  to: number,
  options?: RequestInit,
): Promise<TelemetrySeries> {
  const params = new URLSearchParams({
    from: String(Math.floor(from)),
    to: String(Math.ceil(to)),
  });
  return fetchWithAuth<TelemetrySeries>(
    `/telemetry/${encodeURIComponent(ident)}/series?${params.toString()}`,
    options,
  );
}
