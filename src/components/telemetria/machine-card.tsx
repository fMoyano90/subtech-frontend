"use client";

import Image from "next/image";
import { ScoopArt } from "./scoop-art";
import {
  MACHINE_ART,
  STATUS_META,
  formatRelative,
  formatValue,
  type TelemetryMachine,
} from "@/lib/telemetria";

interface MachineCardProps {
  machine: TelemetryMachine;
  selected: boolean;
  onSelect: (machine: TelemetryMachine) => void;
  /** La primera carta es el LCP de la página: se precarga en vez de ir en lazy. */
  priority?: boolean;
}

export function MachineCard({
  machine,
  selected,
  onSelect,
  priority = false,
}: MachineCardProps) {
  const art = MACHINE_ART[machine.ident];
  const status = STATUS_META[machine.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(machine)}
      aria-pressed={selected}
      className={`card-shine group relative w-[15rem] shrink-0 overflow-hidden rounded-2xl border text-left transition-all duration-300 ease-out will-change-transform ${
        selected
          ? "-translate-y-1 border-subtech-blue/70 bg-tel-raised shadow-[0_0_0_1px_rgba(111,176,226,0.35),0_18px_40px_-12px_rgba(111,176,226,0.45)]"
          : "border-tel-line/70 bg-tel-surface opacity-75 hover:-translate-y-1 hover:border-subtech-blue/40 hover:opacity-100 hover:shadow-[0_16px_32px_-14px_rgba(0,0,0,0.8)]"
      }`}
    >
      {/* ── Ventana de arte ── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-tel-void">
        {art ? (
          <Image
            src={art}
            alt={machine.nombre}
            fill
            sizes="240px"
            priority={priority}
            className={`object-cover transition-all duration-500 ${
              selected
                ? "scale-100 saturate-100"
                : "scale-[1.03] saturate-50 group-hover:scale-100 group-hover:saturate-100"
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-tel-raised to-tel-void">
            <ScoopArt className="w-28 text-subtech-blue/35" />
          </div>
        )}

        {/* Degradado hacia el panel de datos, para que el texto no compita con la foto */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-tel-surface to-transparent" />

        <span
          className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-tel-void/80 px-2 py-1 text-[0.62rem] font-semibold text-tel-text backdrop-blur-sm"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              machine.status === "online" ? "animate-status-pulse" : ""
            }`}
            style={{ backgroundColor: status.color, color: status.color }}
          />
          {status.short}
        </span>

        <span
          className="absolute right-2.5 top-2.5 rounded-full bg-tel-void/80 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-subtech-light-blue backdrop-blur-sm"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {machine.categoria}
        </span>
      </div>

      {/* ── Panel de datos ── */}
      <div className="relative px-3.5 pb-3.5 pt-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[1.05rem] font-bold leading-tight text-tel-text">
            {machine.nombre}
          </h3>
          <span
            className="shrink-0 text-[0.68rem] font-semibold text-subtech-blue"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {machine.modelo}
          </span>
        </div>

        <div
          className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-tel-line/60 pt-2.5 text-[0.66rem]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <Stat label="Registros" value={formatValue(machine.count, 0)} />
          <Stat label="Último dato" value={formatRelative(machine.lastSeen)} />
        </div>
      </div>

      {/* Filete inferior: marca la carta activa sin agregar otro badge */}
      <span
        className={`absolute inset-x-0 bottom-0 h-[3px] transition-opacity duration-300 ${
          selected ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, transparent, #6FB0E2 35%, #B6E2FF 65%, transparent)",
        }}
      />
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-[0.6rem] uppercase tracking-[0.06em] text-tel-dim">
        {label}
      </span>
      <span className="font-semibold text-tel-muted">{value}</span>
    </span>
  );
}
