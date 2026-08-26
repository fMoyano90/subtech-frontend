"use client";

import {
  RANGE_PRESETS,
  formatBucket,
  formatShortDateTime,
  type RangePresetKey,
} from "@/lib/telemetria";

interface RangeBarProps {
  preset: RangePresetKey;
  onPresetChange: (preset: RangePresetKey) => void;
  /** Ancla histórica activa, si el usuario saltó al último período con datos. */
  anchor: number | null;
  onClearAnchor: () => void;
  bucketSeconds?: number;
}

export function RangeBar({
  preset,
  onPresetChange,
  anchor,
  onClearAnchor,
  bucketSeconds,
}: RangeBarProps) {
  return (
    <div className="flex flex-col items-start gap-2 lg:items-end">
      <div className="flex items-center gap-1 rounded-xl border border-tel-line bg-tel-void/60 p-1">
        {RANGE_PRESETS.map((option) => {
          const isActive = option.key === preset;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onPresetChange(option.key)}
              aria-pressed={isActive}
              title={option.full}
              className={`rounded-lg px-3 py-1.5 text-[0.76rem] font-semibold transition-all ${
                isActive
                  ? "bg-subtech-blue text-tel-void shadow-[0_2px_10px_-2px_rgba(111,176,226,0.6)]"
                  : "text-tel-muted hover:bg-tel-raised hover:text-tel-text"
              }`}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-tel-dim"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {bucketSeconds !== undefined && bucketSeconds > 0 && (
          <span>1 punto cada {formatBucket(bucketSeconds)}</span>
        )}

        {anchor !== null && (
          <button
            type="button"
            onClick={onClearAnchor}
            className="rounded-full border border-subtech-yellow/40 bg-subtech-yellow/10 px-2.5 py-0.5 font-semibold text-subtech-yellow transition-colors hover:bg-subtech-yellow/20"
          >
            Histórico hasta {formatShortDateTime(anchor)} · volver a ahora
          </button>
        )}
      </div>
    </div>
  );
}
