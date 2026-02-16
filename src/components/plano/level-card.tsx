import { CATEGORIES } from "@/lib/mina-tags";
import { getLocationPresentation } from "@/lib/location-status";
import { CategoryIcon } from "./category-icon";

interface LevelCardProps {
  name: string;
  svgSrc: string;
  counts: Record<string, number>;
  activeCategory: string | null;
  onCounterClick: (category: string) => void;
  onImageLoad?: () => void;
}

export function LevelCard({
  name,
  svgSrc,
  counts,
  activeCategory,
  onCounterClick,
  onImageLoad,
}: LevelCardProps) {
  const location = getLocationPresentation(name);

  return (
    <div className="relative min-h-[220px]">
      {/* Map — full bleed, no padding */}
      <div className="overflow-x-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svgSrc}
          alt={`Mapa ${name}`}
          className="block w-full"
          onLoad={onImageLoad}
        />
      </div>

      {/* Floating overlay — top-left corner inside the map */}
      <div className="absolute left-4 top-4 flex flex-col gap-2.5">
        <span
          className="w-fit rounded-md border px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] backdrop-blur-sm"
          style={{
            color: location.color,
            backgroundColor: location.background,
            borderColor: location.border,
          }}
        >
          {location.label}
        </span>
        {CATEGORIES.map((cat) => {
          const count = counts[cat.key] ?? 0;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onCounterClick(cat.key)}
              title={cat.label}
              className={`flex w-fit cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[0.75rem] font-semibold backdrop-blur-sm transition-colors ${
                isActive
                  ? "bg-subtech-dark-blue text-white shadow-sm"
                  : "bg-white/80 text-subtech-dark-blue shadow-sm hover:bg-white"
              }`}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <CategoryIcon
                category={cat.key}
                className={isActive ? "text-white" : ""}
              />
              <span style={{ color: isActive ? "white" : cat.accent }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
