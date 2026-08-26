"use client";

import type { ReactNode } from "react";

interface KpiTileProps {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  /** Color de acento: tiñe el borde, el resplandor y la unidad. */
  color: string;
  icon?: ReactNode;
  /** 0 a 1. Dibuja una barra de progreso bajo el valor (carga, acelerador…). */
  ratio?: number | null;
}

export function KpiTile({
  label,
  value,
  unit,
  hint,
  color,
  icon,
  ratio,
}: KpiTileProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-tel-line/80 bg-tel-surface px-4 py-3.5 transition-colors hover:border-tel-line"
      style={{ boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.03)` }}
    >
      {/* Resplandor de acento: da color sin tapar el fondo oscuro */}
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: color }}
      />
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: color, opacity: 0.75 }}
      />

      <div className="relative flex items-center gap-1.5">
        {icon && (
          <span style={{ color }} className="shrink-0">
            {icon}
          </span>
        )}
        <span
          className="truncate text-[0.62rem] font-bold uppercase tracking-[0.12em] text-tel-muted"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {label}
        </span>
      </div>

      <div className="relative mt-1.5 flex items-baseline gap-1">
        <span className="text-[1.55rem] font-bold leading-none tracking-tight text-tel-text">
          {value}
        </span>
        {unit && (
          <span
            className="text-[0.74rem] font-semibold"
            style={{ color, fontFamily: "var(--font-dm-sans)" }}
          >
            {unit}
          </span>
        )}
      </div>

      {ratio !== undefined && ratio !== null && (
        <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-tel-void">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, ratio * 100))}%`,
              backgroundColor: color,
            }}
          />
        </div>
      )}

      {hint && (
        <p
          className="relative mt-1.5 truncate text-[0.66rem] text-tel-dim"
          style={{ fontFamily: "var(--font-dm-sans)" }}
          title={hint}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
