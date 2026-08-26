"use client";

import { Gauge } from "./gauge";
import {
  GAUGES,
  computeStats,
  getParam,
  type TelemetrySeries,
} from "@/lib/telemetria";

interface GaugePanelProps {
  series: TelemetrySeries;
}

export function GaugePanel({ series }: GaugePanelProps) {
  return (
    <section className="rounded-2xl border border-tel-line/80 bg-tel-surface p-5">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[0.9rem] font-bold text-tel-text">
          Temperaturas del motor
        </h2>
        <span
          className="text-[0.66rem] text-tel-dim"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Último valor del período · escalas referenciales
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-around gap-4 pt-3">
        {GAUGES.map((gauge) => {
          const param = getParam(gauge.path);
          if (!param) return null;
          const stats = computeStats(series.series[gauge.path]);

          return (
            <Gauge
              key={gauge.path}
              label={param.short}
              value={stats.last}
              unit={param.unit}
              decimals={param.decimals}
              min={gauge.min}
              max={gauge.max}
              warn={gauge.warn}
              critical={gauge.critical}
              color={param.color}
            />
          );
        })}
      </div>
    </section>
  );
}
