"use client";

import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  CHART_AXIS,
  CHART_GRID,
  SYNC_KEY,
  formatAxisTick,
  formatValue,
} from "@/lib/telemetria";

interface OscilloscopeChartProps {
  t: number[];
  values: (number | null)[];
  unit: string;
  decimals: number;
  color: string;
  height?: number;
  /**
   * Muestra bajo el cursor, o (null, null) al salir del gráfico.
   *
   * Se avisa por callback en vez de por estado de React: con el cursor sincronizado, un
   * setState por movimiento del mouse serían diez re-renders por pixel recorrido.
   */
  onCursor?: (value: number | null, ts: number | null) => void;
}

interface ChartMeta {
  unit: string;
  decimals: number;
  color: string;
  span: number;
}

const AXIS_FONT = "10px var(--font-dm-sans), sans-serif";

function spanOf(t: number[]): number {
  return t.length > 1 ? t[t.length - 1] - t[0] : 3600;
}

/** #RRGGBB → rgba(), para las capas translúcidas del relleno. */
function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function OscilloscopeChart({
  t,
  values,
  unit,
  decimals,
  color,
  height = 160,
  onCursor,
}: OscilloscopeChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<uPlot | null>(null);

  // Los callbacks de uPlot corren al dibujar, no al renderizar, así que leen de este ref
  // para ver siempre el formato vigente sin obligar a recrear la instancia.
  const metaRef = useRef<ChartMeta>({
    unit,
    decimals,
    color,
    span: spanOf(t),
  });
  const initialDataRef = useRef<uPlot.AlignedData>([
    t,
    values,
  ] as uPlot.AlignedData);
  const onCursorRef = useRef(onCursor);

  // Declarados antes del efecto de datos: así el setData de abajo ya dibuja con el
  // formato actualizado.
  useEffect(() => {
    metaRef.current = { unit, decimals, color, span: spanOf(t) };
  }, [unit, decimals, color, t]);

  useEffect(() => {
    onCursorRef.current = onCursor;
  }, [onCursor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = new uPlot(
      {
        width: container.clientWidth || 320,
        height,
        // El eje de tiempo nativo de uPlot formatea en la zona del navegador. Se apaga y
        // se rotula a mano en hora de Chile, para que el eje diga lo mismo en cualquier
        // equipo que abra el dashboard.
        scales: { x: { time: false } },
        legend: { show: false },
        hooks: {
          setCursor: [
            (self) => {
              const notify = onCursorRef.current;
              if (!notify) return;
              const idx = self.cursor.idx;
              if (idx === null || idx === undefined) {
                notify(null, null);
                return;
              }
              const ys = self.data[1] as (number | null)[];
              const xs = self.data[0] as number[];
              notify(ys[idx] ?? null, xs[idx] ?? null);
            },
          ],
        },
        cursor: {
          y: false,
          // El rango lo manda la barra de presets: sin arrastre para zoom no quedan
          // gráficos con escalas distintas entre sí.
          drag: { x: false, y: false },
          sync: { key: SYNC_KEY },
          points: { size: 7 },
        },
        axes: [
          {
            stroke: CHART_AXIS,
            grid: { stroke: CHART_GRID, width: 1 },
            ticks: { stroke: CHART_GRID, width: 1 },
            font: AXIS_FONT,
            size: 28,
            values: (_self, splits) =>
              splits.map((value) => formatAxisTick(value, metaRef.current.span)),
          },
          {
            stroke: CHART_AXIS,
            grid: { stroke: CHART_GRID, width: 1 },
            ticks: { stroke: CHART_GRID, width: 1 },
            font: AXIS_FONT,
            size: 46,
            values: (_self, splits) =>
              splits.map((value) =>
                formatValue(value, metaRef.current.decimals),
              ),
          },
        ],
        series: [
          {
            value: (_self, value) =>
              value === null
                ? "—"
                : formatAxisTick(value, metaRef.current.span),
          },
          {
            stroke: () => metaRef.current.color,
            width: 1.8,
            // Degradado bajo la traza: es lo que separa una línea suelta de algo que se
            // lee como una señal. Se recalcula en cada draw porque depende del bbox.
            fill: (self) => {
              const gradient = self.ctx.createLinearGradient(
                0,
                self.bbox.top,
                0,
                self.bbox.top + self.bbox.height,
              );
              gradient.addColorStop(0, withAlpha(metaRef.current.color, 0.3));
              gradient.addColorStop(1, withAlpha(metaRef.current.color, 0));
              return gradient;
            },
            // Sin points explícitos: uPlot los muestra solo cuando las muestras quedan
            // separadas. El equipo reporta de forma irregular (de 4 a 650 s), así que sin
            // esto las muestras aisladas no se dibujan y el gráfico se ve vacío.
            points: { size: 4, fill: () => metaRef.current.color },
            spanGaps: false,
            value: (_self, value) =>
              `${formatValue(value, metaRef.current.decimals)} ${metaRef.current.unit}`,
          },
        ],
      },
      initialDataRef.current,
      container,
    );

    chartRef.current = chart;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width && width > 0) chart.setSize({ width, height });
    });
    observer.observe(container);

    // StrictMode monta, desmonta y vuelve a montar en desarrollo: la limpieza tiene que
    // dejar el contenedor vacío o quedan canvas duplicados.
    return () => {
      observer.disconnect();
      chart.destroy();
      chartRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    chartRef.current?.setData([t, values] as uPlot.AlignedData);
  }, [t, values]);

  return <div ref={containerRef} className="tel-chart w-full" />;
}
