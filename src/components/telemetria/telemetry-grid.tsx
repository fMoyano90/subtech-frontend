"use client";

import { ParamChartCard } from "./param-chart-card";
import { PARAMS, type TelemetrySeries } from "@/lib/telemetria";

interface TelemetryGridProps {
  series: TelemetrySeries;
}

const EMPTY: (number | null)[] = [];

export function TelemetryGrid({ series }: TelemetryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {PARAMS.map((param) => (
        // La key es el path del parámetro, estable entre cambios de máquina y de rango:
        // así React reusa las mismas instancias de uPlot vía setData() en vez de
        // destruir y recrear un canvas por gráfico en cada carga.
        <ParamChartCard
          key={param.path}
          param={param}
          t={series.t}
          values={series.series[param.path] ?? EMPTY}
        />
      ))}
    </div>
  );
}
