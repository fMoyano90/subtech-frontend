"use client";

import { useEffect, useRef, useState } from "react";
import {
  type EtiquetaOption,
  type RecorridoResponse,
  fetchEtiquetas,
  fetchRecorrido,
} from "@/lib/mina-tags";

interface RecorridoModalProps {
  open: boolean;
  onClose: () => void;
  onResult: (recorrido: RecorridoResponse) => void;
}

export function RecorridoModal({ open, onClose, onResult }: RecorridoModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<EtiquetaOption | null>(null);
  const [etiquetas, setEtiquetas] = useState<EtiquetaOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    fetchEtiquetas()
      .then(setEtiquetas)
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  const filtered = etiquetas
    .filter((e) =>
      (e.etiqueta + " " + e.categoria)
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 50);

  async function handleApply() {
    if (!selected) { setError("Selecciona una entidad."); return; }
    if (!date) { setError("Selecciona una fecha."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await fetchRecorrido(selected.etiqueta, date);
      onResult(result);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al obtener el recorrido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_8px_32px_rgba(38,82,145,0.18)]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-base font-bold text-subtech-dark-blue">Ver recorrido</h2>
          <p className="mt-0.5 text-[0.75rem] text-subtech-dark-blue/60">
            Selecciona una fecha y una entidad para ver la secuencia de pórticos.
          </p>
        </div>

        {/* Date picker */}
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-[0.08em] text-subtech-dark-blue/55">
          Fecha
        </label>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="mb-4 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice px-3 py-2 text-sm text-subtech-dark-blue outline-none focus:border-subtech-dark-blue"
        />

        {/* Combobox */}
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-[0.08em] text-subtech-dark-blue/55">
          Entidad
        </label>
        <div className="relative mb-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar vehículo, maquinaria o persona…"
            value={selected ? selected.etiqueta : query}
            onChange={(e) => {
              setSelected(null);
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice px-3 py-2 text-sm text-subtech-dark-blue outline-none focus:border-subtech-dark-blue"
          />
          {showDropdown && filtered.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-subtech-light-blue/40 bg-white shadow-md">
              {filtered.map((e) => (
                <li
                  key={e.etiqueta}
                  onMouseDown={() => {
                    setSelected(e);
                    setQuery("");
                    setShowDropdown(false);
                  }}
                  className="cursor-pointer px-3 py-2 text-sm text-subtech-dark-blue hover:bg-subtech-ice"
                >
                  <span className="font-medium">{e.etiqueta}</span>
                  <span className="ml-2 text-[0.68rem] text-subtech-dark-blue/50">{e.categoria}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="mb-3 text-[0.75rem] text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            disabled={loading}
            className="flex-1 rounded-lg bg-subtech-dark-blue px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Cargando…" : "Aplicar"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-subtech-light-blue/50 px-4 py-2 text-sm font-semibold text-subtech-dark-blue hover:bg-subtech-ice"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
