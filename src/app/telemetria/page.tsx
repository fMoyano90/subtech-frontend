"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { MachineDeck } from "@/components/telemetria/machine-deck";
import { MachineHeader } from "@/components/telemetria/machine-header";
import { RangeBar } from "@/components/telemetria/range-bar";
import { TelemetryGrid } from "@/components/telemetria/telemetry-grid";
import { GaugePanel } from "@/components/telemetria/gauge-panel";
import { KpiTile } from "@/components/telemetria/kpi-tile";
import { AlertBanners } from "@/components/telemetria/alert-banners";
import { EmptyRangeState } from "@/components/telemetria/empty-range-state";
import {
  ClockIcon,
  EngineIcon,
  FuelIcon,
  LoadIcon,
  PulseIcon,
  SpeedIcon,
} from "@/components/telemetria/icons";
import { getToken } from "@/lib/auth";
import {
  DEFAULT_RANGE_PRESET,
  POLLING_INTERVAL_MS,
  computeStats,
  deriveOperatingState,
  fetchLatest,
  fetchMachines,
  fetchSeries,
  formatRelative,
  formatValue,
  getPresetLabel,
  getPresetSeconds,
  pickPresetForSpan,
  type RangePresetKey,
  type TelemetryLatest,
  type TelemetryMachine,
  type TelemetrySeries,
} from "@/lib/telemetria";

export default function TelemetriaPage() {
  const router = useRouter();

  const [machines, setMachines] = useState<TelemetryMachine[]>([]);
  const [selected, setSelected] = useState<TelemetryMachine | null>(null);
  const [preset, setPreset] = useState<RangePresetKey>(DEFAULT_RANGE_PRESET);
  /** null = ventana viva (relativa a ahora); un número fija el extremo derecho. */
  const [anchor, setAnchor] = useState<number | null>(null);

  const [latest, setLatest] = useState<TelemetryLatest | null>(null);
  const [series, setSeries] = useState<TelemetrySeries | null>(null);

  const [loading, setLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [error, setError] = useState("");

  const isPollingRef = useRef(false);

  /* ── Rango efectivo ── */
  // `anchor` se incluye para recalcular la ventana al saltar a un período histórico;
  // sin ancla la ventana se recalcula en cada render contra el reloj actual.
  const range = useMemo(() => {
    const span = getPresetSeconds(preset);
    const to = anchor ?? Math.floor(Date.now() / 1000);
    return { from: to - span, to };
  }, [preset, anchor]);

  /* ── Carga del catálogo de maquinarias ── */
  const loadMachines = useCallback(async () => {
    try {
      const items = await fetchMachines();
      setMachines(items);
      setSelected((prev) => prev ?? items[0] ?? null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    void loadMachines();
  }, [loadMachines, router]);

  /* ── Último valor conocido (no depende del rango) ── */
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    fetchLatest(selected.ident, { signal: controller.signal })
      .then(setLatest)
      .catch(() => {
        /* el error visible lo maneja la carga de series */
      });
    return () => controller.abort();
  }, [selected]);

  /* ── Series del rango seleccionado ── */
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    setSeriesLoading(true);

    fetchSeries(selected.ident, range.from, range.to, {
      signal: controller.signal,
    })
      .then((data) => {
        setSeries(data);
        setError("");
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Error desconocido");
      })
      .finally(() => {
        if (!controller.signal.aborted) setSeriesLoading(false);
      });

    return () => controller.abort();
  }, [selected, range]);

  /* ── Polling silencioso ── */
  const pollSilently = useCallback(async () => {
    if (isPollingRef.current || !selected) return;
    isPollingRef.current = true;
    try {
      const tasks: Promise<unknown>[] = [
        fetchLatest(selected.ident).then(setLatest),
      ];
      // Un rango anclado a un período histórico no cambia: no tiene sentido repedirlo.
      if (anchor === null) {
        const span = getPresetSeconds(preset);
        const to = Math.floor(Date.now() / 1000);
        tasks.push(fetchSeries(selected.ident, to - span, to).then(setSeries));
      }
      await Promise.all(tasks);
    } catch {
      /* silent */
    } finally {
      isPollingRef.current = false;
    }
  }, [selected, anchor, preset]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!getToken()) return;
      void pollSilently();
    }, POLLING_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pollSilently]);

  /* ── Derivados ── */
  const hasData = (series?.summary.docCount ?? 0) > 0;

  const rpm = computeStats(series?.series["engine.rpm"]);
  const speed = computeStats(series?.series["vehicle.speed"]);
  const load = computeStats(series?.series["engine.percent.load"]);
  const operating = deriveOperatingState(rpm.last, speed.last);
  const periodHint = `Según el último dato de ${getPresetLabel(preset)}`;

  const handleSelectMachine = useCallback((machine: TelemetryMachine) => {
    setSelected(machine);
    setAnchor(null);
    setSeries(null);
    setLatest(null);
  }, []);

  // Además de mover el ancla, ajusta el preset al tramo que el equipo realmente
  // reportó: quedarse en la ventana anterior dejaría la muestra comprimida contra el
  // borde derecho del gráfico.
  const handleJumpToLastData = useCallback(() => {
    const lastSeen = latest?.lastSeen ?? selected?.lastSeen ?? null;
    if (lastSeen === null) return;
    if (selected) {
      setPreset(pickPresetForSpan(lastSeen - selected.firstSeen));
    }
    setAnchor(Math.ceil(lastSeen));
  }, [latest, selected]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-tel-bg">
      <DashboardNavbar title="Telemetría" />

      <main className="relative min-h-0 flex-1 overflow-y-auto">
        {/* Ambiente de sala de control: dos focos fríos sobre el fondo casi negro */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 top-[4.5rem] z-0"
          style={{
            background:
              "radial-gradient(900px 420px at 12% -8%, rgba(111,176,226,0.13), transparent 65%)," +
              "radial-gradient(700px 380px at 88% 4%, rgba(38,82,145,0.20), transparent 62%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[110rem] p-5 lg:p-6">
          {loading ? (
            <LoadingState />
          ) : error && machines.length === 0 ? (
            <ErrorBox message={error} />
          ) : machines.length === 0 ? (
            <NoMachinesBox />
          ) : (
            <>
              <MachineDeck
                machines={machines}
                selected={selected}
                onSelect={handleSelectMachine}
              />

              {selected && (
                <>
                  <MachineHeader machine={selected}>
                    <RangeBar
                      preset={preset}
                      onPresetChange={setPreset}
                      anchor={anchor}
                      onClearAnchor={() => setAnchor(null)}
                      bucketSeconds={series?.bucketSeconds}
                    />
                  </MachineHeader>

                  <AlertBanners latest={latest} />

                  <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    <KpiTile
                      label="Horómetro"
                      value={formatValue(latest?.hours.value ?? null, 1)}
                      unit="h"
                      color="#6FB0E2"
                      icon={<ClockIcon />}
                      hint={
                        latest?.hours.at
                          ? `Último valor conocido, ${formatRelative(latest.hours.at)}`
                          : "Aún sin lectura"
                      }
                    />
                    <KpiTile
                      label="Estado"
                      value={operating.label}
                      color={operating.color}
                      icon={<PulseIcon />}
                      hint={periodHint}
                    />
                    <KpiTile
                      label="RPM"
                      value={formatValue(rpm.last, 0)}
                      unit="rpm"
                      color="#4DA6FF"
                      icon={<EngineIcon />}
                      hint={`Máx ${formatValue(rpm.max, 0)} en el período`}
                    />
                    <KpiTile
                      label="Combustible"
                      value={formatValue(
                        series?.summary.fuelRateAvg ?? null,
                        2,
                      )}
                      unit="L/h"
                      color="#FFB13D"
                      icon={<FuelIcon />}
                      hint={
                        series
                          ? `Promedio de ${series.summary.fuelRateSampleCount} muestras`
                          : undefined
                      }
                    />
                    <KpiTile
                      label="Carga del motor"
                      value={formatValue(load.last, 0)}
                      unit="%"
                      color="#C084FC"
                      icon={<LoadIcon />}
                      ratio={load.last !== null ? load.last / 100 : null}
                      hint={`Promedio ${formatValue(load.avg, 0)} % en el período`}
                    />
                    <KpiTile
                      label="Velocidad"
                      value={formatValue(speed.last, 1)}
                      unit="km/h"
                      color="#22D3EE"
                      icon={<SpeedIcon />}
                      hint={`Máx ${formatValue(speed.max, 1)} km/h en el período`}
                    />
                  </div>

                  {error && <ErrorBox message={error} />}

                  <div
                    className={
                      seriesLoading
                        ? "opacity-50 transition-opacity duration-200"
                        : "transition-opacity duration-200"
                    }
                  >
                    {series && hasData ? (
                      <div className="flex flex-col gap-4">
                        <GaugePanel series={series} />
                        <TelemetryGrid series={series} />
                      </div>
                    ) : series ? (
                      <EmptyRangeState
                        preset={preset}
                        lastSeen={latest?.lastSeen ?? selected.lastSeen ?? null}
                        onJumpToLastData={handleJumpToLastData}
                      />
                    ) : (
                      <SkeletonGrid />
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[16.5rem] w-[15rem] shrink-0 animate-pulse rounded-2xl bg-tel-surface"
          />
        ))}
      </div>
      <div className="h-20 animate-pulse rounded-2xl bg-tel-surface" />
      <SkeletonGrid />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-2xl bg-tel-surface"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      className="mb-4 rounded-xl border border-[#FF6B4A]/35 bg-[#FF6B4A]/10 px-4 py-3 text-[0.8rem] text-[#FF6B4A]"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {message}
    </div>
  );
}

function NoMachinesBox() {
  return (
    <div
      className="rounded-2xl border border-tel-line/80 bg-tel-surface px-6 py-16 text-center"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      <p className="text-[1rem] font-bold text-tel-text">
        Todavía no hay maquinarias con telemetría
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[0.8rem] text-tel-muted">
        Ningún equipo ha enviado datos al webhook aún. En cuanto llegue el
        primer mensaje, el equipo aparecerá aquí.
      </p>
    </div>
  );
}
