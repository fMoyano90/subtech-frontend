"use client";

import { useEffect } from "react";
import { type MinaTag, formatDate, formatTime } from "@/lib/mina-tags";
import { getLocationPresentation } from "@/lib/location-status";

interface TagDetailModalProps {
  tag: MinaTag | null;
  onClose: () => void;
}

const FIELDS: {
  label: string;
  isLocation?: boolean;
  getValue: (t: MinaTag) => string;
}[] = [
  { label: "Etiqueta", getValue: (t) => t.etiqueta },
  { label: "UID", getValue: (t) => t.uid },
  { label: "Categoría", getValue: (t) => t.categoria },
  { label: "Subcategoría", getValue: (t) => t.subcategoria },
  {
    label: "Ubicación",
    isLocation: true,
    getValue: (t) => getLocationPresentation(t.ubicacion).label,
  },
  { label: "Pórtico", getValue: (t) => t.portico },
  { label: "Fecha", getValue: (t) => formatDate(t.timestap) },
  { label: "Hora", getValue: (t) => formatTime(t.timestap) },
];

export function TagDetailModal({ tag, onClose }: TagDetailModalProps) {
  /* Close on Escape */
  useEffect(() => {
    if (!tag) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tag, onClose]);

  if (!tag) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-subtech-dark-blue/20 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md animate-scale-in rounded-xl bg-white p-6 shadow-[0_8px_30px_rgba(38,82,145,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-subtech-dark-blue/50 transition-colors hover:bg-subtech-ice hover:text-subtech-dark-blue"
        >
          <svg
            width="16"
            height="16"
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

        {/* Title */}
        <h3 className="text-[0.9rem] font-bold text-subtech-dark-blue">
          {tag.etiqueta}
        </h3>
        <p
          className="mt-0.5 text-[0.7rem] text-subtech-dark-blue/60"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Detalle del registro
        </p>

        {/* Fields */}
        <div
          className="mt-4 divide-y divide-subtech-light-blue/20"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {FIELDS.map(({ label, getValue, isLocation }) => {
            const value = getValue(tag);
            if (!value) return null;
            const location = isLocation
              ? getLocationPresentation(tag.ubicacion)
              : null;
            return (
              <div key={label} className="flex items-center justify-between py-2.5">
                <span className="text-[0.72rem] font-semibold uppercase tracking-wider text-subtech-dark-blue/60">
                  {label}
                </span>
                <span
                  className="text-[0.78rem] font-medium text-subtech-dark-blue"
                  style={location ? { color: location.color } : undefined}
                >
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
