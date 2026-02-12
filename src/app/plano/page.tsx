"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
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
import { getNavLinks } from "@/lib/nav-links";
import {
  type MinaTag,
  CATEGORIES,
  POLLING_INTERVAL_MS,
  getLatestPerEtiqueta,
  hasMeaningfulTagChanges,
  fetchAllMinaTags,
} from "@/lib/mina-tags";

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

const LEVELS = [
  { ubicacion: "Niveles Superiores", label: "Niveles Superiores", svg: "/mapa-mina-nivel-1.svg" },
  { ubicacion: "Niveles Medios", label: "Niveles Medios", svg: "/mapa-mina-nivel-2.svg" },
  { ubicacion: "Niveles Inferiores", label: "Niveles Inferiores", svg: "/mapa-mina-nivel-3.svg" },
] as const;

const EXTERIOR_KEY = "Exterior Mina - 840";

/* ═══════════════════════════════════════════
   Plano Page
   ═══════════════════════════════════════════ */

export default function PlanoPage() {
  const router = useRouter();
  const [tags, setTags] = useState<MinaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isRefreshingRef = useRef(false);
  const navLinks = useMemo(() => getNavLinks(getTokenPayload()?.role), []);

  /* Sidebar state */
  const [sidebarLevel, setSidebarLevel] = useState("");
  const [sidebarCategory, setSidebarCategory] = useState("");

  const refreshTags = useCallback(
    async ({ silent }: { silent: boolean }) => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        const nextTags = await fetchAllMinaTags();
        startTransition(() => {
          setTags((prev) =>
            hasMeaningfulTagChanges(prev, nextTags) ? nextTags : prev,
          );
        });
        if (!silent) setError("");
      } catch (e) {
        if (!silent) {
          setError(e instanceof Error ? e.message : "Error desconocido");
        }
      } finally {
        if (!silent) setLoading(false);
        isRefreshingRef.current = false;
      }
    },
    [],
  );

  /* Auth check + data fetch */
  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }
    void refreshTags({ silent: false });
  }, [refreshTags, router]);

  /* Silent polling every 30s */
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!getToken()) return;
      void refreshTags({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refreshTags]);

  /* Latest per etiqueta */
  const latest = useMemo(() => getLatestPerEtiqueta(tags), [tags]);

  /* Group by ubicacion */
  const byUbicacion = useMemo(() => {
    const m = new Map<string, MinaTag[]>();
    for (const tag of latest) {
      const key = tag.ubicacion;
      const arr = m.get(key);
      if (arr) arr.push(tag);
      else m.set(key, [tag]);
    }
    return m;
  }, [latest]);

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
      <DashboardNavbar title="Plano" links={navLinks} />

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
                    Vista por niveles con ubicación de personas, camiones y vehículos
                  </p>
                </div>

                {/* Unified mine cross-section */}
                <div className="animate-slide-up opacity-0">
                  <div className="divide-y divide-subtech-dark-blue/20 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(38,82,145,0.07)]">
                    {LEVELS.map((level) => (
                      <LevelCard
                        key={level.ubicacion}
                        name={level.label}
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
                      />
                    ))}
                  </div>
                </div>

                {/* Exterior card */}
                <div
                  className="mt-4 animate-slide-up opacity-0"
                  style={{ animationDelay: "100ms" }}
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
