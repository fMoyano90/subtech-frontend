"use client";

import { formatShortDateTime, type TelemetryLatest } from "@/lib/telemetria";

interface AlertBannersProps {
  latest: TelemetryLatest | null;
}

const AMBER = "#FDE047";
const RED = "#FF6B4A";
const GREEN = "#4ADE80";

export function AlertBanners({ latest }: AlertBannersProps) {
  if (!latest) return null;

  const dm1 = latest.dm1;
  const shutdown = latest.shutdown;

  const dm1Red = (dm1?.red ?? 0) === 1 || (dm1?.mil ?? 0) === 1;
  const dm1Amber = (dm1?.amber ?? 0) === 1;
  const dm1Active = dm1Red || dm1Amber;

  const shutdownActive = (shutdown?.active ?? 0) === 1;
  const shutdownApproaching = (shutdown?.approaching ?? 0) === 1;

  const lamps = [
    dm1Amber && "ámbar",
    (dm1?.red ?? 0) === 1 && "roja",
    (dm1?.mil ?? 0) === 1 && "MIL",
  ].filter(Boolean) as string[];

  return (
    <div className="mb-4 flex flex-col gap-2">
      {dm1Active ? (
        <Banner
          tone={dm1Red ? RED : AMBER}
          icon={<WarningIcon />}
          title={`Falla activa en el motor — lámpara ${lamps.join(", ")}`}
          detail={`SPN ${dm1?.spn ?? "—"} · FMI ${dm1?.fmi ?? "—"}${
            dm1?.occurrence !== undefined
              ? ` · ${dm1.occurrence} ocurrencias`
              : ""
          }`}
          at={latest.dm1At}
        />
      ) : (
        dm1 && (
          <Banner
            tone={GREEN}
            icon={<CheckIcon />}
            title="Diagnóstico del motor sin fallas activas"
            detail="Ninguna lámpara de advertencia encendida"
            at={latest.dm1At}
          />
        )
      )}

      {(shutdownActive || shutdownApproaching) && (
        <Banner
          tone={shutdownActive ? RED : AMBER}
          icon={<WarningIcon />}
          title={
            shutdownActive
              ? "Apagado por protección del motor ACTIVO"
              : "Apagado por protección del motor inminente"
          }
          detail="Revisar el equipo antes de continuar la operación"
          at={latest.shutdownAt}
        />
      )}
    </div>
  );
}

function Banner({
  tone,
  icon,
  title,
  detail,
  at,
}: {
  tone: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  at: number | null;
}) {
  return (
    <div
      className="relative flex flex-wrap items-center gap-x-3 gap-y-1 overflow-hidden rounded-xl border py-2.5 pl-4 pr-4"
      style={{
        borderColor: `${tone}3D`,
        backgroundColor: `${tone}12`,
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: tone }}
      />
      <span style={{ color: tone }} className="shrink-0">
        {icon}
      </span>
      <span className="text-[0.8rem] font-semibold" style={{ color: tone }}>
        {title}
      </span>
      <span className="text-[0.74rem] text-tel-muted">{detail}</span>
      {at !== null && (
        <span className="ml-auto text-[0.68rem] text-tel-dim">
          {formatShortDateTime(at)}
        </span>
      )}
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
