"use client";

import { useState } from "react";
import { type MinaTag, CATEGORIES, formatDate, formatTime } from "@/lib/mina-tags";
import { getLocationPresentation } from "@/lib/location-status";
import { TagDetailModal } from "./tag-detail-modal";

interface PlanoSidebarProps {
  level: string;
  category: string;
  tags: MinaTag[];
}

export function PlanoSidebar({
  level,
  category,
  tags,
}: PlanoSidebarProps) {
  const [selectedTag, setSelectedTag] = useState<MinaTag | null>(null);
  const hasSelection = level !== "" && category !== "";
  const catMeta = CATEGORIES.find((c) => c.key === category);
  const label = catMeta?.label ?? category;
  const levelLocation = getLocationPresentation(level);

  return (
    <aside className="w-[370px] shrink-0 border-l border-subtech-light-blue/30 bg-white">
      {hasSelection ? (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-subtech-light-blue/25 px-4 pb-3 pt-4">
            <span
              className="inline-block rounded-md border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em]"
              style={{
                color: levelLocation.color,
                backgroundColor: levelLocation.background,
                borderColor: levelLocation.border,
              }}
            >
              {levelLocation.label}
            </span>
            <h2 className="mt-2 text-[0.85rem] font-bold uppercase tracking-[0.12em] text-subtech-dark-blue">
              {label}
            </h2>
            <p
              className="mt-0.5 text-[0.7rem] text-subtech-dark-blue/80"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {tags.length} registro{tags.length !== 1 && "s"}
            </p>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <table
              className="w-full text-left text-[0.72rem]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-subtech-light-blue/30 text-[0.62rem] font-bold uppercase tracking-wider text-subtech-dark-blue">
                  <th className="pb-1.5 pr-2">Nombre</th>
                  <th className="pb-1.5 pr-2">Fecha</th>
                  <th className="pb-1.5">Hora</th>
                </tr>
              </thead>
              <tbody>
                {tags.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-subtech-dark-blue/55"
                    >
                      Sin registros
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr
                      key={tag.id}
                      onClick={() => setSelectedTag(tag)}
                      className="cursor-pointer border-b border-subtech-ice/60 transition-colors hover:bg-subtech-ice/40"
                    >
                      <td className="py-1.5 pr-2 font-medium text-subtech-dark-blue">
                        {tag.etiqueta}
                      </td>
                      <td className="py-1.5 pr-2 tabular-nums text-subtech-dark-blue/90">
                        {formatDate(tag.timestap)}
                      </td>
                      <td className="py-1.5 tabular-nums text-subtech-dark-blue/90">
                        {formatTime(tag.timestap)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3 text-subtech-light-blue"
          >
            <path d="M15 15l-2 5L9 9l11 4-5 2z" />
            <path d="M15 15l5 5" />
          </svg>
          <p className="text-[0.8rem] font-semibold text-subtech-dark-blue/70">
            Selecciona una categoría
          </p>
          <p
            className="mt-1 text-[0.7rem] text-subtech-dark-blue/50"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Haz clic en un contador de cualquier nivel para ver el detalle
          </p>
        </div>
      )}

      <TagDetailModal tag={selectedTag} onClose={() => setSelectedTag(null)} />
    </aside>
  );
}
