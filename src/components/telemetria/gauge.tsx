"use client";

import { formatValue } from "@/lib/telemetria";

interface GaugeProps {
  label: string;
  value: number | null;
  unit: string;
  decimals: number;
  min: number;
  max: number;
  warn: number;
  critical: number;
  /** Color identitario del parámetro: solo el punto de la etiqueta, no el arco. */
  color: string;
}

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Medidor de 240°, con la abertura abajo, como los instrumentos de cabina. */
const ARC = CIRCUMFERENCE * (240 / 360);

/** Escala de umbrales exterior, más fina y de mayor radio que el arco de valor. */
const ZONE_RADIUS = 47;
const ZONE_CIRCUMFERENCE = 2 * Math.PI * ZONE_RADIUS;
const ZONE_ARC = ZONE_CIRCUMFERENCE * (240 / 360);

const OK_COLOR = "#4ADE80";
const WARN_COLOR = "#FDE047";
const CRITICAL_COLOR = "#FF6B4A";
const IDLE_COLOR = "#5B7A96";

export function Gauge({
  label,
  value,
  unit,
  decimals,
  min,
  max,
  warn,
  critical,
  color,
}: GaugeProps) {
  const hasValue = value !== null && Number.isFinite(value);
  const span = max - min;
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const ratio = hasValue ? clamp((value - min) / span) : 0;

  // El arco de valor es un semáforo, no un color de identidad: si 82 °C normales se
  // dibujaran en rojo anaranjado, el medidor mentiría sobre el estado del motor.
  const tone = !hasValue
    ? IDLE_COLOR
    : value >= critical
      ? CRITICAL_COLOR
      : value >= warn
        ? WARN_COLOR
        : OK_COLOR;

  const warnStart = clamp((warn - min) / span);
  const criticalStart = clamp((critical - min) / span);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="h-[7.5rem] w-[7.5rem]">
          {/* escala exterior: zona de advertencia y zona crítica */}
          <ZoneArc from={warnStart} to={criticalStart} color={WARN_COLOR} />
          <ZoneArc from={criticalStart} to={1} color={CRITICAL_COLOR} />

          {/* pista */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="#15273B"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
            transform="rotate(150 50 50)"
          />

          {/* valor */}
          {hasValue && (
            <circle
              className="gauge-arc"
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={tone}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
              strokeDashoffset={ARC * (1 - ratio)}
              transform="rotate(150 50 50)"
              style={
                {
                  "--gauge-empty": ARC,
                  "--gauge-offset": ARC * (1 - ratio),
                  filter: `drop-shadow(0 0 5px ${tone}55)`,
                } as React.CSSProperties
              }
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span
            className="text-[1.3rem] font-bold leading-none tracking-tight"
            style={{ color: tone }}
          >
            {formatValue(value, decimals)}
          </span>
          <span
            className="mt-0.5 text-[0.62rem] font-semibold text-tel-dim"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {unit}
          </span>
        </div>
      </div>

      <span
        className="-mt-2 flex items-center gap-1.5 text-[0.72rem] font-semibold text-tel-muted"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {/* Punto del color del parámetro: enlaza el medidor con su gráfico de abajo */}
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        {label}
      </span>
      <span
        className="text-[0.6rem] text-tel-dim"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        alerta sobre {warn} {unit}
      </span>
    </div>
  );
}

/** Tramo de la escala exterior, entre dos fracciones del recorrido total. */
function ZoneArc({
  from,
  to,
  color,
}: {
  from: number;
  to: number;
  color: string;
}) {
  const length = ZONE_ARC * Math.max(0, to - from);
  if (length <= 0) return null;

  return (
    <circle
      cx="50"
      cy="50"
      r={ZONE_RADIUS}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeOpacity="0.55"
      strokeDasharray={`${length} ${ZONE_CIRCUMFERENCE}`}
      strokeDashoffset={-ZONE_ARC * from}
      transform="rotate(150 50 50)"
    />
  );
}
