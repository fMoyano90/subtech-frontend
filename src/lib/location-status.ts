export type KnownLocationStatus =
  | "Niveles Superiores"
  | "Niveles Medios"
  | "Niveles Inferiores"
  | "Exterior Mina - 840"
  | "Ubicación desconocida";

interface LocationPalette {
  color: string;
  background: string;
  border: string;
}

const LOCATION_PALETTE: Record<KnownLocationStatus, LocationPalette> = {
  "Niveles Superiores": {
    color: "#0A84FF",
    background: "rgba(10, 132, 255, 0.14)",
    border: "rgba(10, 132, 255, 0.36)",
  },
  "Niveles Medios": {
    color: "#009688",
    background: "rgba(0, 150, 136, 0.14)",
    border: "rgba(0, 150, 136, 0.34)",
  },
  "Niveles Inferiores": {
    color: "#E67E22",
    background: "rgba(230, 126, 34, 0.14)",
    border: "rgba(230, 126, 34, 0.34)",
  },
  "Exterior Mina - 840": {
    color: "#265291",
    background: "rgba(38, 82, 145, 0.12)",
    border: "rgba(38, 82, 145, 0.32)",
  },
  "Ubicación desconocida": {
    color: "#667085",
    background: "rgba(102, 112, 133, 0.12)",
    border: "rgba(102, 112, 133, 0.32)",
  },
};

function normalizeLocation(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function resolveKnownLocation(
  location: string,
): KnownLocationStatus | null {
  const normalized = normalizeLocation(location);

  if (!normalized) return "Ubicación desconocida";
  if (normalized.includes("niveles superiores")) return "Niveles Superiores";
  if (normalized.includes("niveles medios")) return "Niveles Medios";
  if (normalized.includes("niveles inferiores")) return "Niveles Inferiores";
  if (normalized.includes("exterior mina")) return "Exterior Mina - 840";
  if (normalized.includes("desconocid")) return "Ubicación desconocida";

  return null;
}

export interface LocationPresentation {
  status: KnownLocationStatus;
  label: string;
  color: string;
  background: string;
  border: string;
}

export function getLocationPresentation(location?: string | null): LocationPresentation {
  const raw = String(location ?? "").trim();
  const known = resolveKnownLocation(raw);
  const status = known ?? "Ubicación desconocida";
  const palette = LOCATION_PALETTE[status];

  return {
    status,
    label: known ? known : raw || "Ubicación desconocida",
    color: palette.color,
    background: palette.background,
    border: palette.border,
  };
}

const INTERIOR_STATUSES: ReadonlySet<KnownLocationStatus> = new Set([
  "Niveles Superiores",
  "Niveles Medios",
  "Niveles Inferiores",
]);

export function isInteriorMinaLocation(location?: string | null): boolean {
  const { status } = getLocationPresentation(location);
  return INTERIOR_STATUSES.has(status);
}
