"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { PorticoMapa } from "@/components/porticos/portico-mapa";
import { PorticoSidebar } from "@/components/porticos/portico-sidebar";
import { getToken } from "@/lib/auth";
import {
  type MinaTag,
  type PorticoStatusId,
  type PorticoStatusItem,
  type RecorridoStep,
  type EnrichedRecorridoStep,
  POLLING_INTERVAL_MS,
  fetchMinaTagsPage,
  fetchPorticoStatuses,
  enrichRecorridoSteps,
} from "@/lib/mina-tags";

export default function PorticosPage() {
  const router = useRouter();
  const [tags, setTags] = useState<MinaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [recorridoData, setRecorridoData] = useState<{ steps: RecorridoStep[]; etiqueta: string; date: string } | null>(null);
  const [enrichedSteps, setEnrichedSteps] = useState<EnrichedRecorridoStep[]>([]);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [porticoStatuses, setPorticoStatuses] = useState<PorticoStatusItem[]>([]);
  const isPollingRef = useRef(false);
  const isStatusPollingRef = useRef(false);

  const loadInitial = useCallback(async () => {
    try {
      const result = await fetchMinaTagsPage();
      setTags(result.tags);
      setNextCursor(result.nextCursor);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchMinaTagsPage(nextCursor);
      setTags((prev) => [...prev, ...result.tags]);
      setNextCursor(result.nextCursor);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }

  const loadPorticoStatuses = useCallback(async () => {
    if (isStatusPollingRef.current) return;
    isStatusPollingRef.current = true;
    try {
      const result = await fetchPorticoStatuses();
      setPorticoStatuses(result.items);
    } catch {
      // Keep the diagram available and preserve the last known status if any.
    } finally {
      isStatusPollingRef.current = false;
    }
  }, []);

  const pollSilently = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      const result = await fetchMinaTagsPage();
      setTags((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newRecords = result.tags.filter((t) => !existingIds.has(t.id));
        return newRecords.length > 0 ? [...newRecords, ...prev] : prev;
      });
    } catch {
      // silent
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  /* Auth check + initial load */
  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    void loadInitial();
    void loadPorticoStatuses();
  }, [loadInitial, loadPorticoStatuses, router]);

  /* Silent polling every 30s — paused while a recorrido is displayed */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (recorridoData) return;
      if (document.visibilityState !== "visible") return;
      if (!getToken()) return;
      void pollSilently();
    }, POLLING_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pollSilently, recorridoData]);

  /* Silent polling for backend-computed pórtico online/offline state. */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!getToken()) return;
      void loadPorticoStatuses();
    }, POLLING_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [loadPorticoStatuses]);

  /* ── Derived data ── */

  /**
   * Build the pórtico nodes for the diagram.
   * currentCount = unique etiquetas (assets) detected at this pórtico in the loaded data.
   */
  const porticoNodes = useMemo(() => {
    // Count unique etiquetas per pórtico across all loaded tags
    const uniqueMap = new Map<string, Set<string>>();
    for (const tag of tags) {
      if (!tag.portico) continue;
      if (!uniqueMap.has(tag.portico)) uniqueMap.set(tag.portico, new Set());
      uniqueMap.get(tag.portico)!.add(tag.etiqueta);
    }

    return Array.from(uniqueMap.entries()).map(([portico, etiquetas]) => ({
      portico,
      currentCount: etiquetas.size,
      historyCount: etiquetas.size,
    }));
  }, [tags]);

  const statusByPorticoId = useMemo<Partial<Record<PorticoStatusId, PorticoStatusItem>>>(() => {
    return Object.fromEntries(
      porticoStatuses.map((item) => [item.id, item]),
    ) as Partial<Record<PorticoStatusId, PorticoStatusItem>>;
  }, [porticoStatuses]);

  /* ── Animation controls ── */
  const handleRecorridoChange = useCallback((data: { steps: RecorridoStep[]; etiqueta: string; date: string } | null) => {
    setRecorridoData(data);
    if (data) {
      setEnrichedSteps(enrichRecorridoSteps(data.steps));
      setAnimationStep(0);
      setAnimationPlaying(false);
    } else {
      setEnrichedSteps([]);
      setAnimationStep(0);
      setAnimationPlaying(false);
    }
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (!recorridoData || enrichedSteps.length === 0) return;
    if (animationStep >= enrichedSteps.length) {
      setAnimationStep(0);
    }
    setAnimationPlaying((p) => !p);
  }, [recorridoData, enrichedSteps.length, animationStep]);

  const handleAnimationStepChange = useCallback((step: number) => {
    if (step >= enrichedSteps.length) {
      setAnimationStep(enrichedSteps.length);
      setAnimationPlaying(false);
    } else {
      setAnimationStep(step);
    }
  }, [enrichedSteps.length]);

  const handleStepJump = useCallback((step: number) => {
    setAnimationStep(step);
    setAnimationPlaying(false);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setAnimationSpeed(speed);
  }, []);

  /* ── Stats bar values ── */
  const totalCurrent = porticoNodes.reduce((s, n) => s + n.currentCount, 0);
  const totalPorticos = porticoNodes.length;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-subtech-ice">
      <DashboardNavbar title="Plano" />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Main content ── */}
        <main className="relative min-w-0 flex-1 overflow-y-auto p-6">
          {/* Dot pattern bg */}
          <div
            className="pointer-events-none fixed inset-0 top-14 z-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(38,82,145,0.04) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10">
            {loading ? (
              <div className="space-y-5">
                <div className="h-10 w-64 animate-pulse rounded-lg bg-white/70" />
                <div className="h-[420px] animate-pulse rounded-xl bg-white/70" />
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center rounded-xl bg-white">
                <div className="text-center">
                  <p className="font-semibold text-red-500">Error al cargar datos</p>
                  <p
                    className="mt-1 text-sm text-subtech-dark-blue/65"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {error}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Page header */}
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-subtech-dark-blue">
                      Plano Simplificado de Pórticos
                    </h1>
                    <p
                      className="mt-0.5 text-[0.82rem] text-subtech-dark-blue/85"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      Diagrama esquemático de la faena con detección en tiempo real
                    </p>
                  </div>
                </div>

                {/* Recorrido active chip */}
                {recorridoData && (
                  <div
                    className="mb-4 flex items-center gap-3 rounded-xl border border-[#D4A700]/40 bg-[#FFF9E6] px-4 py-2.5"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    <span className="flex-1 text-[0.78rem] font-semibold text-subtech-dark-blue">
                      Recorrido: <span className="font-bold">{recorridoData.etiqueta}</span>
                      {" · "}{recorridoData.date}
                      {" · "}{recorridoData.steps.length} {recorridoData.steps.length === 1 ? "paso" : "pasos"}
                      {animationPlaying && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[0.72rem] text-subtech-dark-blue/70">
                          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-subtech-dark-blue" />
                          Reproduciendo
                        </span>
                      )}
                      {animationStep >= recorridoData.steps.length && recorridoData.steps.length > 0 && (
                        <span className="ml-2 text-[0.72rem] text-green-600">Completado</span>
                      )}
                    </span>
                    <button
                      onClick={() => handleRecorridoChange(null)}
                      className="text-[0.72rem] font-semibold text-subtech-dark-blue/60 hover:text-subtech-dark-blue"
                    >
                      Limpiar
                    </button>
                  </div>
                )}

                {/* Stats strip */}
                <div
                  className="mb-5 flex gap-3 animate-slide-up opacity-0"
                  style={{ animationDelay: "0ms" }}
                >
                  <StatCard label="Pórticos activos" value={totalPorticos} />
                  <StatCard label="Activos en pórticos" value={totalCurrent} />
                  <StatCard label="Seleccionado" value={selected ?? "—"} />
                </div>

                {/* Mine diagram */}
                <div
                  className="animate-slide-up opacity-0"
                  style={{ animationDelay: "80ms" }}
                >
                  <PorticoMapa
                    porticos={porticoNodes}
                    selected={selected}
                    onSelect={setSelected}
                    recorrido={recorridoData?.steps ?? null}
                    enrichedSteps={enrichedSteps}
                    animationPlaying={animationPlaying}
                    animationStep={animationStep}
                    animationSpeed={animationSpeed}
                    onAnimationStepChange={handleAnimationStepChange}
                    statusByPorticoId={statusByPorticoId}
                  />
                </div>
              </>
            )}
          </div>
        </main>

        {/* ── Sidebar ── */}
        <PorticoSidebar
          selected={selected}
          allTags={tags}
          hasMore={!!nextCursor}
          loadingMore={loadingMore}
          onLoadMore={() => void handleLoadMore()}
          onRecorridoChange={handleRecorridoChange}
          animationPlaying={animationPlaying}
          animationStep={animationStep}
          animationSpeed={animationSpeed}
          onPlayToggle={handlePlayToggle}
          onStepJump={handleStepJump}
          onSpeedChange={handleSpeedChange}
        />
      </div>
    </div>
  );
}

/* ── Small stat card ── */
function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="flex flex-col rounded-xl bg-white px-4 py-3 shadow-[0_1px_4px_rgba(38,82,145,0.07)]"
      style={{ minWidth: 130 }}
    >
      <span
        className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-subtech-dark-blue/55"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
      </span>
      <span className="mt-1 text-[1.4rem] font-bold leading-none text-subtech-dark-blue">
        {value}
      </span>
    </div>
  );
}
