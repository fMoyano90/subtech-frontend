"use client";

import {
  formatRelative,
  formatShortDateTime,
  getPresetLabel,
  type RangePresetKey,
} from "@/lib/telemetria";

interface EmptyRangeStateProps {
  preset: RangePresetKey;
  lastSeen: number | null;
  onJumpToLastData: () => void;
}

export function EmptyRangeState({
  preset,
  lastSeen,
  onJumpToLastData,
}: EmptyRangeStateProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-tel-line/80 bg-tel-surface px-6 py-14 text-center"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-subtech-blue/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-tel-line bg-tel-void text-subtech-blue">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12h5l2 5 4-10 2 5h5" />
          </svg>
        </span>

        <h3 className="text-[1rem] font-bold text-tel-text">
          Sin señal en {getPresetLabel(preset)}
        </h3>

        <p className="text-[0.8rem] leading-relaxed text-tel-muted">
          El equipo no registró telemetría en esta ventana.
          {lastSeen !== null && (
            <>
              {" "}
              El último dato llegó {formatRelative(lastSeen)}, el{" "}
              <span className="font-semibold text-tel-text">
                {formatShortDateTime(lastSeen)}
              </span>
              .
            </>
          )}
        </p>

        {lastSeen !== null && (
          <button
            type="button"
            onClick={onJumpToLastData}
            className="btn-press mt-1 rounded-xl bg-subtech-blue px-4 py-2.5 text-[0.8rem] font-bold text-tel-void transition-all hover:bg-subtech-light-blue hover:shadow-[0_6px_20px_-6px_rgba(111,176,226,0.8)]"
          >
            Ver último período con datos
          </button>
        )}
      </div>
    </div>
  );
}
