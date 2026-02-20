import { CATEGORIES } from "@/lib/mina-tags";
import { EXTERIOR_MINA_STATUS, getLocationPresentation } from "@/lib/location-status";
import { CategoryIcon } from "./category-icon";

interface ExteriorCardProps {
  counts: Record<string, number>;
  activeCategory: string | null;
  onCounterClick: (category: string) => void;
}

export function ExteriorCard({
  counts,
  activeCategory,
  onCounterClick,
}: ExteriorCardProps) {
  const exterior = getLocationPresentation(EXTERIOR_MINA_STATUS);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(38,82,145,0.07)]">
      <div className="flex items-center justify-between px-5 py-4">
        <span
          className="inline-flex rounded-md border px-2 py-0.5 text-[0.8rem] font-bold uppercase tracking-[0.12em]"
          style={{
            color: exterior.color,
            backgroundColor: exterior.background,
            borderColor: exterior.border,
          }}
        >
          {exterior.label}
        </span>
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const count = counts[cat.key] ?? 0;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onCounterClick(cat.key)}
                title={cat.label}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[0.75rem] font-semibold transition-colors ${
                  isActive
                    ? "border-subtech-dark-blue bg-subtech-dark-blue text-white"
                    : "border-subtech-light-blue/50 bg-subtech-ice/50 text-subtech-dark-blue hover:border-subtech-dark-blue/30 hover:bg-subtech-ice"
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
    </div>
  );
}
