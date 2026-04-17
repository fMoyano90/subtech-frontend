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
import { LevelCard } from "@/components/plano/level-card";
import { ExteriorCard } from "@/components/plano/exterior-card";
import { PlanoSidebar } from "@/components/plano/plano-sidebar";
import { getToken, getTokenPayload } from "@/lib/auth";
import { EXTERIOR_MINA_STATUS, isExteriorMinaLocation } from "@/lib/location-status";
import {
  type MinaTag,
  CATEGORIES,
  POLLING_INTERVAL_MS,
  hasMeaningfulTagChanges,
  fetchLatestMinaTags,
} from "@/lib/mina-tags";

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

const LEVELS = [
  {
    ubicacion: "Niveles Superiores",
    label: "Niveles Superiores",
    range: "Cota 840 - Salida superficie 950",
    svg: "/mapa-mina-nivel-1.svg",
  },
  {
    ubicacion: "Niveles Medios",
    label: "Niveles Medios",
    range: "Cota 840 - Cota 785",
    svg: "/mapa-mina-nivel-2.svg",
  },
  {
    ubicacion: "Niveles Inferiores",
    label: "Niveles Inferiores",
    range: "Cota 785 - Cota 740",
    svg: "/mapa-mina-nivel-3.svg",
  },
] as const;

const EXTERIOR_KEY = EXTERIOR_MINA_STATUS;

/* ═══════════════════════════════════════════
   Plano Page
   ═══════════════════════════════════════════ */

export default function PlanoPage() {
  const router = useRouter();
  const [tags, setTags] = useState<MinaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isPollingRef = useRef(false);
  /* Image preloading — show skeleton until all maps are loaded */
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const imagesReady = imagesLoaded >= LEVELS.length;
  const handleImageLoad = useCallback(() => setImagesLoaded((c) => c + 1), []);

  /* Sidebar state */
  const [sidebarLevel, setSidebarLevel] = useState("");
  const [sidebarCategory, setSidebarCategory] = useState("");

  const loadInitial = useCallback(async () => {
    try {
      const latest = await fetchLatestMinaTags();
      setTags(latest);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  const pollSilently = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      const latest = await fetchLatestMinaTags();
      setTags((prev) =>
        hasMeaningfulTagChanges(prev, latest) ? latest : prev,
      );
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

  /* Group by ubicacion */
  const byUbicacion = useMemo(() => {
    const m = new Map<string, MinaTag[]>();
    for (const tag of tags) {
      const rawLocation = String(tag.ubicacion ?? "").trim();
      const key = isExteriorMinaLocation(rawLocation)
        ? EXTERIOR_KEY
        : rawLocation || "Ubicación desconocida";
      const arr = m.get(key);
      if (arr) arr.push(tag);
      else m.set(key, [tag]);
    }
    return m;
  }, [tags]);

  /* Count by category for a given ubicacion */
  function countsFor(ubicacion: string): Record<string, number> {
    const tagsInLevel = byUbicacion.get(ubicacion) ?? [];
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat.key] = tagsInLevel.filter((t) => t.categoria === cat.key).length;
    }
    return counts;
  }

  /* Handle counter click */
  function handleCounterClick(ubicacion: string, category: string) {
    if (sidebarLevel === ubicacion && sidebarCategory === category) {
      setSidebarLevel("");
      setSidebarCategory("");
    } else {
      setSidebarLevel(ubicacion);
      setSidebarCategory(category);
    }
  }

  /* Tags for sidebar */
  const sidebarTags = useMemo(() => {
    if (!sidebarLevel || !sidebarCategory) return [];
    return (byUbicacion.get(sidebarLevel) ?? []).filter(
      (t) => t.categoria === sidebarCategory,
    );
  }, [sidebarLevel, sidebarCategory, byUbicacion]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-subtech-ice">
      <DashboardNavbar title="Plano" />

      {/* ── Body ── */}
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
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-52 animate-pulse rounded-xl bg-white/70"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center rounded-xl bg-white">
                <div className="text-center">
                  <p className="font-semibold text-red-500">
                    Error al cargar datos
                  </p>
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
                <div className="mb-6">
                  <h1 className="text-lg font-bold tracking-tight text-subtech-dark-blue">
                    Plano de la Mina
                  </h1>
                  <p
                    className="mt-0.5 text-[0.82rem] text-subtech-dark-blue/85"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    Vista por niveles con ubicación de personas, maquinaria y vehículos
                  </p>
                </div>

                {/* Skeleton while images load */}
                {!imagesReady && (
                  <div className="space-y-5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-52 animate-pulse rounded-xl bg-white/70"
                      />
                    ))}
                  </div>
                )}

                {/* Unified mine cross-section — render hidden until images ready */}
                <div className={imagesReady ? "animate-slide-up opacity-0" : "invisible absolute"}>
                  <div className="divide-y divide-subtech-dark-blue/20 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(38,82,145,0.07)]">
                    {LEVELS.map((level) => (
                      <LevelCard
                        key={level.ubicacion}
                        name={level.label}
                        range={level.range}
                        svgSrc={level.svg}
                        counts={countsFor(level.ubicacion)}
                        activeCategory={
                          sidebarLevel === level.ubicacion
                            ? sidebarCategory
                            : null
                        }
                        onCounterClick={(cat) =>
                          handleCounterClick(level.ubicacion, cat)
                        }
                        onImageLoad={handleImageLoad}
                      />
                    ))}
                  </div>
                </div>

                {/* Exterior card */}
                <div
                  className={imagesReady ? "mt-4 animate-slide-up opacity-0" : "invisible absolute"}
                  style={imagesReady ? { animationDelay: "100ms" } : undefined}
                >
                  <ExteriorCard
                    counts={countsFor(EXTERIOR_KEY)}
                    activeCategory={
                      sidebarLevel === EXTERIOR_KEY
                        ? sidebarCategory
                        : null
                    }
                    onCounterClick={(cat) =>
                      handleCounterClick(EXTERIOR_KEY, cat)
                    }
                  />
                </div>
              </>
            )}
          </div>
        </main>

        {/* ── Sidebar ── */}
        <PlanoSidebar
          level={sidebarLevel}
          category={sidebarCategory}
          tags={sidebarTags}
        />
      </div>
    </div>
  );
}
