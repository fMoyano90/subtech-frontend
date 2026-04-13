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
import { getToken, getTokenPayload } from "@/lib/auth";
import {
  type MinaTag,
  POLLING_INTERVAL_MS,
  fetchMinaTagsPage,
} from "@/lib/mina-tags";

export default function PorticosPage() {
  const router = useRouter();
  const [tags, setTags] = useState<MinaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const isPollingRef = useRef(false);

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
    if (!getToken()) { router.replace("/"); return; }
    void loadInitial();
  }, [loadInitial, router]);

  /* Silent polling every 30s */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!getToken()) return;
      void pollSilently();
    }, POLLING_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pollSilently]);

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

  /** Full historical records for the selected pórtico, newest first */
  const sidebarTags = useMemo<MinaTag[]>(() => {
    if (!selected) return [];
    return tags
      .filter((t) => t.portico === selected)
      .sort((a, b) => b.timestap - a.timestap);
  }, [tags, selected]);

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
                <div className="mb-5">
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
                  />
                </div>
              </>
            )}
          </div>
        </main>

        {/* ── Sidebar ── */}
        <PorticoSidebar
          selected={selected}
          tags={sidebarTags}
          hasMore={!!nextCursor}
          loadingMore={loadingMore}
          onLoadMore={() => void handleLoadMore()}
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
