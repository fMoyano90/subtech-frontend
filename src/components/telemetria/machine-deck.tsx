"use client";

import { useMemo, useState } from "react";
import { MachineCard } from "./machine-card";
import type { TelemetryMachine } from "@/lib/telemetria";

interface MachineDeckProps {
  machines: TelemetryMachine[];
  selected: TelemetryMachine | null;
  onSelect: (machine: TelemetryMachine) => void;
}

/** A partir de este número la búsqueda deja de ser un estorbo y pasa a ser útil. */
const SEARCH_THRESHOLD = 6;

export function MachineDeck({
  machines,
  selected,
  onSelect,
}: MachineDeckProps) {
  const [query, setQuery] = useState("");
  const showSearch = machines.length >= SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    if (!showSearch || query.trim() === "") return machines;
    const needle = query.toLowerCase();
    return machines.filter((machine) =>
      `${machine.nombre} ${machine.modelo} ${machine.categoria} ${machine.ident}`
        .toLowerCase()
        .includes(needle),
    );
  }, [machines, query, showSearch]);

  return (
    <section className="mb-6">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-subtech-blue">
          Flota con telemetría
        </h2>
        <span
          className="rounded-full border border-tel-line bg-tel-surface px-2 py-0.5 text-[0.66rem] font-semibold text-tel-muted"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {machines.length} {machines.length === 1 ? "equipo" : "equipos"}
        </span>
        <span
          className="text-[0.72rem] text-tel-dim"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Elige un equipo para ver su tablero
        </span>

        {showSearch && (
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar equipo…"
            className="ml-auto w-48 rounded-lg border border-tel-line bg-tel-surface px-3 py-1.5 text-[0.76rem] text-tel-text placeholder:text-tel-dim focus:border-subtech-blue/60 focus:outline-none"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          />
        )}
      </div>

      <div className="tel-scroll -mx-1 flex gap-3.5 overflow-x-auto px-1 pb-3 pt-1">
        {filtered.map((machine, index) => (
          <MachineCard
            key={machine.ident}
            machine={machine}
            selected={machine.ident === selected?.ident}
            onSelect={onSelect}
            priority={index === 0}
          />
        ))}

        {/* Con la flota casi vacía una carta suelta no se lee como un mazo. La ranura
            fantasma da la escala de lo que viene y explica cómo se llena. */}
        {filtered.length > 0 && machines.length < 3 && <GhostSlot />}

        {filtered.length === 0 && (
          <p
            className="py-8 text-[0.8rem] text-tel-dim"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Ningún equipo coincide con la búsqueda.
          </p>
        )}
      </div>
    </section>
  );
}

function GhostSlot() {
  return (
    <div
      className="flex w-[15rem] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-tel-line px-5 text-center"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-tel-line/80 text-tel-dim">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <p className="text-[0.72rem] font-semibold text-tel-muted">
        Espacio para más equipos
      </p>
      <p className="text-[0.66rem] leading-snug text-tel-dim">
        Cada maquinaria aparece aquí en cuanto envía su primer dato.
      </p>
    </div>
  );
}
