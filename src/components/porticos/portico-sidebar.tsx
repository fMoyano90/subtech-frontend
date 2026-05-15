"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type MinaTag, CATEGORIES, formatDate, formatTime, tsToDate, fetchEtiquetas, fetchRecorrido, type RecorridoStep } from "@/lib/mina-tags";

interface PorticoSidebarProps {
  selected: string | null;
  allTags: MinaTag[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onRecorridoChange: (recorrido: { steps: RecorridoStep[]; etiqueta: string; date: string } | null) => void;
}

type TabKey = "historial" | "recorrido";

export function PorticoSidebar({
  selected,
  allTags,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onRecorridoChange,
}: PorticoSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("historial");

  /* ── Date filter state (historial) ── */
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");

  /* ── Visible limit ── */
  const visibleLimitKey = `${selected ?? ""}|${dateFrom}|${dateTo}`;
  const [visibleLimitState, setVisibleLimitState] = useState({
    key: "",
    limit: 50,
  });
  const visibleLimit =
    visibleLimitState.key === visibleLimitKey ? visibleLimitState.limit : 50;

  /* ── Recorrido state ── */
  const today = new Date().toISOString().slice(0, 10);
  const [recorridoDate, setRecorridoDate] = useState(today);
  const [recorridoQuery, setRecorridoQuery] = useState("");
  const [recorridoSelected, setRecorridoSelected] = useState<{ etiqueta: string; categoria: string } | null>(null);
  const [etiquetas, setEtiquetas] = useState<{ etiqueta: string; categoria: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recorridoLoading, setRecorridoLoading] = useState(false);
  const [recorridoError, setRecorridoError] = useState("");
  const [recorridoData, setRecorridoData] = useState<{ steps: RecorridoStep[]; etiqueta: string; date: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEtiquetas().then(setEtiquetas).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredEtiquetas = useMemo(() => {
    if (!recorridoQuery) return etiquetas.slice(0, 50);
    return etiquetas
      .filter((e) =>
        (e.etiqueta + " " + e.categoria)
          .toLowerCase()
          .includes(recorridoQuery.toLowerCase()),
      )
      .slice(0, 50);
  }, [etiquetas, recorridoQuery]);

  const handleApplyRecorrido = useCallback(async () => {
    if (!recorridoSelected) { setRecorridoError("Selecciona una entidad."); return; }
    if (!recorridoDate) { setRecorridoError("Selecciona una fecha."); return; }
    setRecorridoError("");
    setRecorridoLoading(true);
    try {
      const result = await fetchRecorrido(recorridoSelected.etiqueta, recorridoDate);
      const data = { steps: result.steps, etiqueta: result.etiqueta, date: result.date };
      setRecorridoData(data);
      onRecorridoChange(data);
    } catch (e) {
      setRecorridoError(e instanceof Error ? e.message : "Error al obtener el recorrido");
      setRecorridoData(null);
      onRecorridoChange(null);
    } finally {
      setRecorridoLoading(false);
    }
  }, [recorridoSelected, recorridoDate, onRecorridoChange]);

  const handleClearRecorrido = useCallback(() => {
    setRecorridoData(null);
    setRecorridoSelected(null);
    setRecorridoQuery("");
    setRecorridoError("");
    onRecorridoChange(null);
  }, [onRecorridoChange]);

  /* ── Historial: all tags sorted by time, optionally filtered by portico ── */
  const historialTags = useMemo(() => {
    const base = selected ? allTags.filter((t) => t.portico === selected) : allTags;
    return base.sort((a, b) => b.timestap - a.timestap);
  }, [allTags, selected]);

  const filteredHistorial = useMemo(() => {
    if (!dateFrom && !dateTo) return historialTags;
    return historialTags.filter((t) => {
      const iso = tsToDate(t.timestap).toISOString().slice(0, 10);
      if (dateFrom && iso < dateFrom) return false;
      if (dateTo   && iso > dateTo)   return false;
      return true;
    });
  }, [historialTags, dateFrom, dateTo]);

  const hasDateFilter = dateFrom !== "" || dateTo !== "";

  return (
    <aside className="w-[370px] shrink-0 border-l border-subtech-light-blue/30 bg-white">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-subtech-light-blue/25 px-4 pb-3 pt-4">
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-subtech-dark-blue/55">
            {selected ? "Pórtico" : "General"}
          </span>
          <h2
            className="mt-0.5 truncate text-[0.92rem] font-bold text-subtech-dark-blue"
            title={selected ?? "Todos los pórticos"}
          >
            {selected ?? "Todos los pórticos"}
          </h2>

          {/* Tabs */}
          <div className="mt-3 flex gap-1 rounded-lg bg-subtech-ice/60 p-0.5">
            <button
              onClick={() => setActiveTab("historial")}
              className={`flex-1 rounded-md py-1.5 text-[0.7rem] font-semibold transition-colors ${
                activeTab === "historial"
                  ? "bg-white text-subtech-dark-blue shadow-sm"
                  : "text-subtech-dark-blue/55 hover:text-subtech-dark-blue/80"
              }`}
            >
              Historial
            </button>
            <button
              onClick={() => setActiveTab("recorrido")}
              className={`flex-1 rounded-md py-1.5 text-[0.7rem] font-semibold transition-colors ${
                activeTab === "recorrido"
                  ? "bg-white text-subtech-dark-blue shadow-sm"
                  : "text-subtech-dark-blue/55 hover:text-subtech-dark-blue/80"
              }`}
            >
              Recorrido
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {activeTab === "historial" ? (
            <>
              {/* Date filter */}
              <div
                className="mb-2 flex items-center gap-2"
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
                {hasDateFilter && (
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
                className="mb-2 text-[0.68rem] text-subtech-dark-blue/55"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {filteredHistorial.length} registro{filteredHistorial.length !== 1 && "s"}
                {hasDateFilter && ` (de ${historialTags.length} totales)`}
              </p>

              {/* Table */}
              {filteredHistorial.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-[0.8rem] font-semibold text-subtech-dark-blue/60">
                    Sin registros
                  </p>
                  <p
                    className="mt-1 text-[0.7rem] text-subtech-dark-blue/40"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {hasDateFilter
                      ? "No hay datos para el rango de fechas seleccionado"
                      : "No hay datos históricos"}
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
                      {!selected && <th className="pb-1.5 pr-2">Pórtico</th>}
                      <th className="pb-1.5 pr-2">Fecha</th>
                      <th className="pb-1.5 pr-2">Hora</th>
                      <th className="pb-1.5">Cat.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistorial.slice(0, visibleLimit).map((tag) => {
                      const catMeta = CATEGORIES.find((c) => c.key === tag.categoria);
                      return (
                        <tr
                          key={tag.id}
                          className="border-b border-subtech-ice/60 transition-colors hover:bg-subtech-ice/40"
                        >
                          <td className="py-1.5 pr-2 font-medium text-subtech-dark-blue">
                            {tag.etiqueta}
                          </td>
                          {!selected && (
                            <td className="py-1.5 pr-2 text-[0.68rem] text-subtech-dark-blue/60">
                              {tag.portico}
                            </td>
                          )}
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
                {(visibleLimit < filteredHistorial.length || hasMore) && (
                  <button
                    onClick={() => {
                      setVisibleLimitState({
                        key: visibleLimitKey,
                        limit: visibleLimit + 50,
                      });
                      if (visibleLimit >= filteredHistorial.length) {
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
            </>
          ) : (
            /* ── Recorrido tab ── */
            <div style={{ fontFamily: "var(--font-dm-sans)" }}>
              {/* Date picker */}
              <label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-subtech-dark-blue/55">
                Fecha
              </label>
              <input
                type="date"
                value={recorridoDate}
                max={today}
                onChange={(e) => setRecorridoDate(e.target.value)}
                className="mb-3 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/40 px-3 py-2 text-[0.78rem] text-subtech-dark-blue outline-none focus:border-subtech-dark-blue"
              />

              {/* Combobox */}
              <label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-subtech-dark-blue/55">
                Entidad
              </label>
              <div ref={dropdownRef} className="relative mb-3">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar vehículo, maquinaria o persona…"
                  value={recorridoSelected ? recorridoSelected.etiqueta : recorridoQuery}
                  onChange={(e) => {
                    setRecorridoSelected(null);
                    setRecorridoQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/40 px-3 py-2 text-[0.78rem] text-subtech-dark-blue outline-none focus:border-subtech-dark-blue"
                />
                {showDropdown && filteredEtiquetas.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-subtech-light-blue/40 bg-white shadow-md">
                    {filteredEtiquetas.map((e) => (
                      <li
                        key={e.etiqueta}
                        onMouseDown={() => {
                          setRecorridoSelected(e);
                          setRecorridoQuery("");
                          setShowDropdown(false);
                        }}
                        className="cursor-pointer px-3 py-2 text-[0.78rem] text-subtech-dark-blue hover:bg-subtech-ice"
                      >
                        <span className="font-medium">{e.etiqueta}</span>
                        <span className="ml-2 text-[0.65rem] text-subtech-dark-blue/50">{e.categoria}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {recorridoError && (
                <p className="mb-3 text-[0.72rem] text-red-500">{recorridoError}</p>
              )}

              {/* Actions */}
              <div className="mb-4 flex gap-2">
                <button
                  onClick={handleApplyRecorrido}
                  disabled={recorridoLoading}
                  className="flex-1 rounded-lg bg-subtech-dark-blue px-4 py-2 text-[0.78rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {recorridoLoading ? "Buscando…" : "Buscar"}
                </button>
                {recorridoData && (
                  <button
                    onClick={handleClearRecorrido}
                    className="rounded-lg border border-subtech-light-blue/50 px-4 py-2 text-[0.78rem] font-semibold text-subtech-dark-blue hover:bg-subtech-ice"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Results */}
              {recorridoData ? (
                <>
                  <p className="mb-2 text-[0.68rem] font-semibold text-subtech-dark-blue/55">
                    {recorridoData.steps.length} paso{recorridoData.steps.length !== 1 && "s"} — {recorridoData.etiqueta}
                  </p>
                  {recorridoData.steps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-[0.78rem] font-semibold text-subtech-dark-blue/60">
                        Sin pasos registrados
                      </p>
                      <p className="mt-1 text-[0.68rem] text-subtech-dark-blue/40">
                        No hay datos de recorrido para esta entidad en la fecha seleccionada
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-[0.72rem]">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-subtech-light-blue/30 text-[0.62rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
                          <th className="pb-1.5 pr-2">#</th>
                          <th className="pb-1.5 pr-2">Pórtico</th>
                          <th className="pb-1.5 pr-2">Hora</th>
                          <th className="pb-1.5">Ubicación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recorridoData.steps.map((step) => (
                          <tr
                            key={step.sequence}
                            className="border-b border-subtech-ice/60 transition-colors hover:bg-subtech-ice/40"
                          >
                            <td className="py-1.5 pr-2 font-bold text-subtech-dark-blue">
                              {step.sequence}
                            </td>
                            <td className="py-1.5 pr-2 text-subtech-dark-blue/75">
                              {step.portico}
                            </td>
                            <td className="py-1.5 pr-2 tabular-nums text-subtech-dark-blue/75">
                              {formatTime(step.timestap)}
                            </td>
                            <td className="py-1.5 text-subtech-dark-blue/60">
                              {step.ubicacion}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <svg
                    width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.4"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="mb-2 text-subtech-light-blue"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <p className="text-[0.78rem] font-semibold text-subtech-dark-blue/60">
                    Busca un recorrido
                  </p>
                  <p className="mt-1 text-[0.68rem] text-subtech-dark-blue/40">
                    Selecciona una entidad y fecha para ver la secuencia de pasos
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
