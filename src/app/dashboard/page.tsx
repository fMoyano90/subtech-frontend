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
import { fetchWithAuth } from "@/lib/api";
import { getToken } from "@/lib/auth";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface MinaTag {
  id: string;
  timestap: number;
  categoria: string;
  etiqueta: string;
  ubicacion: string;
  [key: string]: unknown;
}

interface PaginatedResponse {
  items: MinaTag[];
  lastEvaluatedKey?: string;
  count: number;
  hasMore: boolean;
}

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

const CATEGORIES = [
  { key: "Personal", label: "Personas", accent: "#6FB0E2" },
  { key: "Maquinaria", label: "Camiones", accent: "#265291" },
  { key: "Flota vehicular", label: "Vehículos", accent: "#D4A700" },
] as const;

const POLLING_INTERVAL_MS = 30_000;

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

function tsToDate(ts: number): Date {
  return new Date(ts < 1e12 ? ts * 1000 : ts);
}

function formatDate(ts: number): string {
  const date = tsToDate(ts);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

function formatTime(ts: number): string {
  return tsToDate(ts).toLocaleTimeString("es-CL", { hour12: false });
}

function isInterior(tag: MinaTag): boolean {
  return String(tag.ubicacion ?? "").toLowerCase().includes("interior");
}

function getLatestPerEtiqueta(tags: MinaTag[]): MinaTag[] {
  const map = new Map<string, MinaTag>();
  for (const tag of tags) {
    const existing = map.get(tag.etiqueta);
    if (!existing || tag.timestap > existing.timestap) {
      map.set(tag.etiqueta, tag);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.timestap - a.timestap);
}

function hasMeaningfulTagChanges(prev: MinaTag[], next: MinaTag[]): boolean {
  if (prev.length !== next.length) return true;

  const prevById = new Map(
    prev.map((tag) => [
      tag.id,
      `${tag.timestap}|${tag.categoria}|${tag.etiqueta}|${tag.ubicacion}`,
    ]),
  );

  for (const tag of next) {
    const current = `${tag.timestap}|${tag.categoria}|${tag.etiqueta}|${tag.ubicacion}`;
    if (prevById.get(tag.id) !== current) {
      return true;
    }
  }

  return false;
}

async function fetchAllMinaTags(): Promise<MinaTag[]> {
  const all: MinaTag[] = [];
  let cursor: string | undefined;
  do {
    const params = new URLSearchParams({ limit: "100" });
    if (cursor) params.set("cursor", cursor);
    const res = await fetchWithAuth<PaginatedResponse>(
      `/mina-tags?${params.toString()}`,
    );
    all.push(...res.items);
    cursor = res.hasMore ? res.lastEvaluatedKey : undefined;
  } while (cursor);
  return all;
}

/* ═══════════════════════════════════════════
   SVG Donut Chart
   ═══════════════════════════════════════════ */

function DonutChart({
  interior,
  total,
}: {
  interior: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((interior / total) * 100) : 0;
  const r = 36;
  const c = 2 * Math.PI * r;
  const arc = (pct / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center gap-3 text-[0.65rem]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-subtech-blue" />
          Exterior mina
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-subtech-dark-blue" />
          Interior mina
        </span>
      </div>

      <svg
        width="110"
        height="110"
        viewBox="0 0 100 100"
        className="drop-shadow-sm"
      >
        {/* Exterior ring (full) */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#6FB0E2"
          strokeWidth="13"
        />
        {/* Interior arc */}
        {pct > 0 && (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#265291"
            strokeWidth="13"
            strokeDasharray={`${arc} ${c - arc}`}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        )}
        {/* White center */}
        <circle cx="50" cy="50" r="26" fill="white" />
        {/* Percentage */}
        <text
          x="50"
          y="46"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="17"
          fontWeight="700"
          fill="#265291"
        >
          {pct}%
        </text>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontSize="7"
          fill="#265291"
          opacity="0.45"
        >
          interior
        </text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Category Section
   ═══════════════════════════════════════════ */

function CategorySection({
  label,
  accent,
  tags,
}: {
  label: string;
  accent: string;
  tags: MinaTag[];
}) {
  const latest = useMemo(() => getLatestPerEtiqueta(tags), [tags]);
  const interiorCount = latest.filter(isInterior).length;

  return (
    <div
      className="overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(38,82,145,0.07)]"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      {/* Header */}
      <div className="border-b border-subtech-light-blue/25 px-5 py-3">
        <h3 className="text-[0.8rem] font-bold uppercase tracking-[0.12em] text-subtech-dark-blue">
          {label}
        </h3>
      </div>

      <div className="flex items-stretch">
        {/* Table */}
        <div className="min-w-0 flex-1 overflow-x-auto px-5 py-4">
          {latest.length === 0 ? (
            <p
              className="py-6 text-center text-sm text-subtech-dark-blue/60"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Sin registros
            </p>
          ) : (
            <table
              className="w-full text-left text-[0.8rem]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <thead>
                <tr className="border-b border-subtech-light-blue/40 text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
                  <th className="pb-2 pr-4">Asignación</th>
                  <th className="pb-2 pr-4">A/F</th>
                  <th className="pb-2 pr-4">Hora</th>
                  <th className="pb-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((tag) => (
                  <tr
                    key={tag.id}
                    className="border-b border-subtech-ice/80 transition-colors last:border-0 hover:bg-subtech-ice/50"
                  >
                    <td className="py-2 pr-4 font-medium text-subtech-dark-blue">
                      {tag.etiqueta}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[0.7rem] font-medium ${
                          isInterior(tag)
                            ? "bg-[#265291]/10 text-subtech-dark-blue"
                            : "bg-[#6FB0E2]/15 text-subtech-blue"
                        }`}
                      >
                        {tag.ubicacion}
                      </span>
                    </td>
                    <td className="py-2 pr-4 tabular-nums text-subtech-dark-blue/80">
                      {formatTime(tag.timestap)}
                    </td>
                    <td className="py-2 tabular-nums text-subtech-dark-blue/80">
                      {formatDate(tag.timestap)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Chart + interior count */}
        {latest.length > 0 && (
          <div className="flex shrink-0 items-center gap-5 border-l border-subtech-ice px-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-subtech-dark-blue/65">
                Relación A/F
              </span>
              <DonutChart interior={interiorCount} total={latest.length} />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em] leading-tight text-subtech-dark-blue/65">
                En el Interior
                <br />
                Mina
              </span>
              <span className="mt-2 text-[2.5rem] font-bold leading-none text-subtech-dark-blue">
                {interiorCount}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Dashboard Page
   ═══════════════════════════════════════════ */

export default function DashboardPage() {
  const router = useRouter();
  const [tags, setTags] = useState<MinaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState("");
  const isRefreshingRef = useRef(false);

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

  /* Group by category */
  const grouped = useMemo(() => {
    const m = new Map<string, MinaTag[]>();
    for (const c of CATEGORIES) m.set(c.key, []);
    for (const t of tags) {
      const arr = m.get(t.categoria);
      if (arr) arr.push(t);
    }
    return m;
  }, [tags]);

  /* History: all records, sorted, filtered */
  const history = useMemo(() => {
    const sorted = [...tags].sort((a, b) => b.timestap - a.timestap);
    if (!filter.trim()) return sorted;
    const q = filter.toLowerCase();
    return sorted.filter((t) =>
      t.etiqueta.toLowerCase().includes(q),
    );
  }, [tags, filter]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-subtech-ice">
      <DashboardNavbar title="Dashboard" />

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1">
        {/* ── Main content ── */}
        <main className="relative flex-1 overflow-y-auto p-6">
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
                    Última Información Registrada
                  </h1>
                  <p
                    className="mt-0.5 text-[0.82rem] text-subtech-dark-blue/70"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    Estado actual de personas, camiones y vehículos en la mina
                  </p>
                </div>

                {/* Category sections */}
                <div className="space-y-5">
                  {CATEGORIES.map((cat, i) => (
                    <div
                      key={cat.key}
                      className="animate-slide-up opacity-0"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <CategorySection
                        label={cat.label}
                        accent={cat.accent}
                        tags={grouped.get(cat.key) ?? []}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>

        {/* ── Sidebar ── */}
        <aside
          className={`relative shrink-0 transition-[width] duration-300 ease-in-out ${
            sidebarOpen ? "w-[370px]" : "w-11"
          }`}
        >
          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="absolute -left-3.5 top-5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-subtech-light-blue/50 bg-white text-subtech-dark-blue/80 shadow-sm transition-colors hover:bg-subtech-dark-blue hover:text-white"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${
                sidebarOpen ? "rotate-0" : "rotate-180"
              }`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Expanded content */}
          <div
            className={`flex h-full flex-col border-l border-subtech-light-blue/30 bg-white transition-opacity duration-200 ${
              sidebarOpen
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            {/* Header + filter */}
            <div className="shrink-0 border-b border-subtech-light-blue/25 px-4 pb-3 pt-4">
              <h2 className="text-[0.8rem] font-bold uppercase tracking-[0.12em] text-subtech-dark-blue">
                Registros Históricos
              </h2>
              <div className="relative mt-3">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-subtech-blue/60"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="h-9 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/50 pl-9 pr-8 text-[0.78rem] text-subtech-dark-blue placeholder:text-subtech-dark-blue/65 transition-colors focus:border-subtech-dark-blue focus:shadow-[0_0_0_3px_rgba(38,82,145,0.06)]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                />
                {filter && (
                  <button
                    onClick={() => setFilter("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtech-blue/60 transition-colors hover:text-subtech-dark-blue"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Result count */}
              <p
                className="mt-2 text-[0.68rem] text-subtech-dark-blue/60"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {history.length} registro{history.length !== 1 && "s"}
                {filter && " encontrado" + (history.length !== 1 ? "s" : "")}
              </p>
            </div>

            {/* History table */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <table
                className="w-full text-left text-[0.72rem]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-subtech-light-blue/30 text-[0.62rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
                    <th className="pb-1.5 pr-2">Nombre</th>
                    <th className="pb-1.5 pr-2">Fecha</th>
                    <th className="pb-1.5 pr-2">Hora</th>
                    <th className="pb-1.5">A/F</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-subtech-dark-blue/55"
                      >
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    history.map((tag) => (
                      <tr
                        key={tag.id}
                        className="border-b border-subtech-ice/60 transition-colors hover:bg-subtech-ice/40"
                      >
                        <td className="py-1.5 pr-2 font-medium text-subtech-dark-blue">
                          {tag.etiqueta}
                        </td>
                        <td className="py-1.5 pr-2 tabular-nums text-subtech-dark-blue/75">
                          {formatDate(tag.timestap)}
                        </td>
                        <td className="py-1.5 pr-2 tabular-nums text-subtech-dark-blue/75">
                          {formatTime(tag.timestap)}
                        </td>
                        <td className="py-1.5">
                          <span
                            className={`text-[0.65rem] font-medium ${
                              isInterior(tag)
                                ? "text-subtech-dark-blue"
                                : "text-subtech-blue"
                            }`}
                          >
                            {tag.ubicacion}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Collapsed state */}
          <div
            className={`absolute inset-y-0 right-0 flex w-11 items-center justify-center border-l border-subtech-light-blue/30 bg-white transition-opacity duration-200 ${
              sidebarOpen
                ? "pointer-events-none opacity-0"
                : "opacity-100"
            }`}
          >
            <span
              className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-subtech-dark-blue/55"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              Registros
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
