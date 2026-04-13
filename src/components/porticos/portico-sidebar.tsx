"use client";

import { useEffect, useMemo, useState } from "react";
import { type MinaTag, CATEGORIES, formatDate, formatTime, tsToDate } from "@/lib/mina-tags";

interface PorticoSidebarProps {
  selected: string | null;
  tags: MinaTag[];   // ALL historical records for the selected pórtico
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export function PorticoSidebar({
  selected,
  tags,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: PorticoSidebarProps) {
  const hasSelection = !!selected;

  /* ── Date filter state ── */
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");

  /* ── Visible limit ── */
  const [visibleLimit, setVisibleLimit] = useState(50);

  /* Reset limit when pórtico or filters change */
  useEffect(() => setVisibleLimit(50), [selected, dateFrom, dateTo]);

  /* ── Apply date filter ── */
  const filtered = useMemo(() => {
    if (!dateFrom && !dateTo) return tags;
    return tags.filter((t) => {
      const iso = tsToDate(t.timestap).toISOString().slice(0, 10);
      if (dateFrom && iso < dateFrom) return false;
      if (dateTo   && iso > dateTo)   return false;
      return true;
    });
  }, [tags, dateFrom, dateTo]);

  const hasFilter = dateFrom !== "" || dateTo !== "";

  return (
    <aside className="w-[370px] shrink-0 border-l border-subtech-light-blue/30 bg-white">
      {hasSelection ? (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-subtech-light-blue/25 px-4 pb-3 pt-4">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-subtech-dark-blue/55">
              Pórtico
            </span>
            <h2
              className="mt-0.5 truncate text-[0.92rem] font-bold text-subtech-dark-blue"
              title={selected}
            >
              {selected}
            </h2>

            {/* Date filter */}
            <div
              className="mt-3 flex items-center gap-2"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <div className="flex flex-1 flex-col gap-0.5">
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-subtech-dark-blue/50">
                  Desde
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/40 px-2 text-[0.75rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:outline-none"
                />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <label className="text-[0.6rem] font-bold uppercase tracking-wider text-subtech-dark-blue/50">
                  Hasta
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/40 px-2 text-[0.75rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:outline-none"
                />
              </div>
              {hasFilter && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  title="Limpiar filtro"
                  className="mt-4 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-subtech-light-blue/50 text-subtech-dark-blue/50 transition-colors hover:border-subtech-dark-blue/40 hover:text-subtech-dark-blue"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <p
              className="mt-2 text-[0.68rem] text-subtech-dark-blue/55"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {filtered.length} registro{filtered.length !== 1 && "s"}
              {hasFilter && ` (de ${tags.length} totales)`}
            </p>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-[0.8rem] font-semibold text-subtech-dark-blue/60">
                  Sin registros
                </p>
                <p
                  className="mt-1 text-[0.7rem] text-subtech-dark-blue/40"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {hasFilter
                    ? "No hay datos para el rango de fechas seleccionado"
                    : "No hay datos históricos para este pórtico"}
                </p>
              </div>
            ) : (
              <>
              <table
                className="w-full text-left text-[0.72rem]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-subtech-light-blue/30 text-[0.62rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
                    <th className="pb-1.5 pr-2">Nombre</th>
                    <th className="pb-1.5 pr-2">Fecha</th>
                    <th className="pb-1.5 pr-2">Hora</th>
                    <th className="pb-1.5">Cat.</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, visibleLimit).map((tag) => {
                    const catMeta = CATEGORIES.find((c) => c.key === tag.categoria);
                    return (
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
                            className="text-[0.65rem] font-semibold"
                            style={{ color: catMeta?.accent ?? "#265291" }}
                          >
                            {catMeta?.label ?? tag.categoria}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Load more */}
              {(visibleLimit < filtered.length || hasMore) && (
                <button
                  onClick={() => {
                    setVisibleLimit((l) => l + 50);
                    if (visibleLimit >= filtered.length) {
                      onLoadMore?.();
                    }
                  }}
                  disabled={loadingMore}
                  className="mt-3 w-full rounded-lg border border-subtech-light-blue/40 py-2 text-[0.72rem] font-medium text-subtech-dark-blue/70 transition-colors hover:border-subtech-dark-blue/30 hover:text-subtech-dark-blue disabled:opacity-50"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {loadingMore ? "Cargando..." : "Cargar más"}
                </button>
              )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <svg
            width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round"
            className="mb-3 text-subtech-light-blue"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M17.5 14v3M17.5 21v.01M14 17.5h3M21 17.5h.01" />
          </svg>
          <p className="text-[0.8rem] font-semibold text-subtech-dark-blue/70">
            Selecciona un pórtico
          </p>
          <p
            className="mt-1 text-[0.7rem] text-subtech-dark-blue/50"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Haz clic en cualquier nodo del diagrama para ver su historial de detecciones
          </p>
        </div>
      )}
    </aside>
  );
}
