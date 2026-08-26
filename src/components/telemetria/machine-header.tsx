"use client";

import Image from "next/image";
import { ScoopArt } from "./scoop-art";
import {
  MACHINE_ART,
  STATUS_META,
  formatRelative,
  formatShortDateTime,
  type TelemetryMachine,
} from "@/lib/telemetria";
import type { ReactNode } from "react";

interface MachineHeaderProps {
  machine: TelemetryMachine;
  /** La barra de rango va incrustada aquí, como en la maqueta del cliente. */
  children?: ReactNode;
}

export function MachineHeader({ machine, children }: MachineHeaderProps) {
  const art = MACHINE_ART[machine.ident];
  const status = STATUS_META[machine.status];

  return (
    <header className="relative mb-4 overflow-hidden rounded-2xl border border-tel-line/80 bg-tel-surface">
      {/* Foto difuminada al fondo: da profundidad sin robarle legibilidad al texto */}
      {art && (
        <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
          <Image
            src={art}
            alt=""
            fill
            sizes="100vw"
            className="scale-110 object-cover blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-tel-surface via-tel-surface/70 to-tel-surface" />
        </div>
      )}

      <div className="relative flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-tel-line bg-tel-void">
            {art ? (
              <Image
                src={art}
                alt={machine.nombre}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <ScoopArt className="absolute inset-0 m-auto w-14 text-subtech-blue/40" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[1.4rem] font-bold leading-none tracking-tight text-tel-text">
                {machine.nombre}
              </h1>
              <span
                className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.64rem] font-semibold"
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  color: status.color,
                  borderColor: `${status.color}55`,
                  backgroundColor: `${status.color}14`,
                }}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    machine.status === "online" ? "animate-status-pulse" : ""
                  }`}
                  style={{ backgroundColor: status.color, color: status.color }}
                />
                {status.label}
              </span>
            </div>

            <p
              className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.74rem] text-tel-muted"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <span className="font-semibold text-subtech-blue">
                {machine.modelo}
              </span>
              <Dot />
              <span>{machine.categoria}</span>
              <Dot />
              <span title={formatShortDateTime(machine.lastSeen)}>
                último dato {formatRelative(machine.lastSeen)}
              </span>
            </p>
          </div>
        </div>

        {children}
      </div>
    </header>
  );
}

function Dot() {
  return <span className="text-tel-dim">·</span>;
}
