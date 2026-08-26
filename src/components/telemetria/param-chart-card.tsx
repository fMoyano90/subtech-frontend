"use client";

import { useEffect, useRef } from "react";
import { OscilloscopeChart } from "./oscilloscope-chart";
import {
  computeStats,
  formatTime,
  formatValue,
  type ParamDef,
} from "@/lib/telemetria";

interface ParamChartCardProps {
  param: ParamDef;
  t: number[];
  values: (number | null)[];
}

export function ParamChartCard({ param, t, values }: ParamChartCardProps) {
  const stats = computeStats(values);
  const hasData = stats.samples > 0;

  const valueRef = useRef<HTMLSpanElement | null>(null);
  const captionRef = useRef<HTMLSpanElement | null>(null);

  const restingValue = formatValue(stats.last, param.decimals);
  // El texto de reposo vive en un ref para que el callback del cursor no dependa de un
  // valor calculado en render: el React Compiler no puede memoizar una dependencia así.
  const restingRef = useRef({ value: restingValue, caption: param.unit });

  // Sin arreglo de dependencias a propósito: después de cada render la lectura vuelve al
  // último valor del período. El hover la sobrescribe de forma imperativa hasta que el
  // siguiente render la reponga.
  useEffect(() => {
    restingRef.current = { value: restingValue, caption: param.unit };
    if (valueRef.current) valueRef.current.textContent = restingValue;
    if (captionRef.current) captionRef.current.textContent = param.unit;
  });

  // Sin useCallback: con el React Compiler activo, memoizarlo a mano hace que el
  // compilador se saltee el componente entero. El gráfico guarda este callback en un ref,
  // así que su identidad puede cambiar sin recrear nada.
  const handleCursor = (value: number | null, ts: number | null) => {
    const valueNode = valueRef.current;
    const captionNode = captionRef.current;
    if (!valueNode || !captionNode) return;

    if (value === null || ts === null) {
      valueNode.textContent = restingRef.current.value;
      captionNode.textContent = restingRef.current.caption;
      return;
    }
    valueNode.textContent = formatValue(value, param.decimals);
    captionNode.textContent = `${param.unit} · ${formatTime(ts)}`;
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-tel-line/80 bg-tel-surface pb-2 transition-colors hover:border-tel-line">
      {/* Filete superior del color del parámetro: identifica la tarjeta antes de leerla */}
      <span
        className="absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{
          background: `linear-gradient(90deg, ${param.color}, transparent 85%)`,
        }}
      />

      <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3.5">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-[0.8rem] font-bold text-tel-text">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: param.color }}
            />
            <span className="truncate">{param.label}</span>
          </h3>

          <p
            className="mt-1 flex flex-wrap gap-x-2.5 text-[0.64rem] text-tel-dim"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <span>mín {formatValue(stats.min, param.decimals)}</span>
            <span>prom {formatValue(stats.avg, param.decimals)}</span>
            <span>máx {formatValue(stats.max, param.decimals)}</span>
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span
            ref={valueRef}
            className="block text-[1.15rem] font-bold leading-none tracking-tight tabular-nums"
            style={{ color: hasData ? param.color : "#5B7A96" }}
          >
            {restingValue}
          </span>
          <span
            ref={captionRef}
            className="text-[0.62rem] font-semibold text-tel-dim tabular-nums"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {param.unit}
          </span>
        </div>
      </div>

      {hasData ? (
        <OscilloscopeChart
          t={t}
          values={values}
          unit={param.unit}
          decimals={param.decimals}
          color={param.color}
          onCursor={handleCursor}
        />
      ) : (
        <div
          className="flex h-[160px] items-center justify-center text-[0.72rem] text-tel-dim"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Este parámetro no llegó en el período
        </div>
      )}
    </article>
  );
}
