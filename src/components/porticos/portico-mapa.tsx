"use client";

/* ═══════════════════════════════════════════════════════
   PorticoMapa — SVG simplified mine diagram with 4 nodes
   ═══════════════════════════════════════════════════════ */

export interface PorticoData {
  portico: string;
  currentCount: number; // tags currently at this portico (latest per etiqueta)
  historyCount: number; // total historical records
}

interface PorticoMapaProps {
  porticos: PorticoData[];
  selected: string | null;
  onSelect: (portico: string | null) => void;
}

/* ──────────────────────────────────────────────────────
   Pórtico-to-position mapping  (from the mine diagram).
   Each entry's `keyword` is matched case-insensitively
   against tag.portico; `short` is shown inside the node.

   Layout (matches Image 9):
     index 0 → left    Bocamina 840
     index 1 → center  Cruce Polvorín
     index 2 → top     Bocamina 950
     index 3 → br      Niveles Inferiores
   ────────────────────────────────────────────────────── */
const PORTICO_MAP = [
  { keyword: "840",      short: "Bocamina 840", fallback: "Pórtico Bocamina Cota 840"  },  // left
  { keyword: "cruce",    short: "Cruce",         fallback: "Cruce Polvorín"             },  // center junction
  { keyword: "950",      short: "Bocamina 950",  fallback: "Pórtico Bocamina Cota 950"  },  // top
  { keyword: "inferior", short: "Inferiores",    fallback: "Niveles Inferiores"          },  // bottom-right
] as const;
const POSITIONS = [
  { id: "left",   x: 18,  y: 290, w: 134, h: 86, rx: 14 },
  { id: "center", x: 266, y: 182, w: 96,  h: 84, rx: 14 },
  // P-top moved from y=12 → y=70 so it sits below the visible mountain peak (~y=30)
  { id: "top",    x: 460, y: 70,  w: 108, h: 94, rx: 14 },
  { id: "br",     x: 798, y: 400, w: 100, h: 92, rx: 14 },
] as const;

/* Centers derived from rect positions */
const cx = (p: (typeof POSITIONS)[number]) => p.x + p.w / 2;
const cy = (p: (typeof POSITIONS)[number]) => p.y + p.h / 2;

/* Tunnel path segments (stroke-width 9, rounded caps/joins).
   These connect the nodes visually matching the mine diagram:

   Segment 1 – main horizontal + BR descent:
     from left-node right edge → rightward → corner down → BR top

   Segment 2 – junction from horizontal to center node:
     from (center-x, horizontal-y) upward → center-node bottom

   Segment 3 – center node to top node (L-shape rightward+up):
     from center-node right → rightward → corner up → top-node bottom
*/
const PL = POSITIONS[0]; // left
const PC = POSITIONS[1]; // center
const PT = POSITIONS[2]; // top
const PB = POSITIONS[3]; // br

const MAIN_HY = Math.round(cy(PL));       // 333 — horizontal rail y
const BR_CX   = Math.round(cx(PB));       // 848
const PC_CX   = Math.round(cx(PC));       // 314
const PT_CX   = Math.round(cx(PT));       // 514
const CURVE_R = 20;

const TUNNEL_PATHS = [
  // 1. Main horizontal + BR descent (rounded corner)
  `M ${Math.round(PL.x + PL.w)} ${MAIN_HY}` +
  ` L ${BR_CX - CURVE_R} ${MAIN_HY}` +
  ` Q ${BR_CX} ${MAIN_HY} ${BR_CX} ${MAIN_HY + CURVE_R}` +
  ` L ${BR_CX} ${PB.y}`,

  // 2. Junction from horizontal rail up to center-node bottom
  `M ${PC_CX} ${MAIN_HY} L ${PC_CX} ${PC.y + PC.h}`,

  // 3. Center-node right → right → corner up → top-node bottom
  `M ${PC.x + PC.w} ${Math.round(cy(PC))}` +
  ` L ${PT_CX - CURVE_R} ${Math.round(cy(PC))}` +
  ` Q ${PT_CX} ${Math.round(cy(PC))} ${PT_CX} ${Math.round(cy(PC)) - CURVE_R}` +
  ` L ${PT_CX} ${PT.y + PT.h}`,
];

/* Split a pórtico name at the word boundary closest to the middle,
   returning two lines. Single-word or short names stay on one line. */
function splitLabel(text: string): [string, string] {
  if (text.length <= 13) return [text, ""];
  const mid = Math.floor(text.length / 2);
  let bestIdx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") {
      const dist = Math.abs(i - mid);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    }
  }
  if (bestIdx === -1) return [text, ""];
  return [text.slice(0, bestIdx), text.slice(bestIdx + 1)];
}

/* ══════════════════════════════════════════════════════ */

export function PorticoMapa({ porticos, selected, onSelect }: PorticoMapaProps) {
  // Match each position to its pórtico via keyword (case-insensitive substring)
  const nodes = POSITIONS.map((pos, i) => {
    const { keyword, short, fallback } = PORTICO_MAP[i];
    const data =
      porticos.find((p) => p.portico.toLowerCase().includes(keyword)) ?? null;
    return { pos, data, short, fallback };
  });

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(38,82,145,0.07)]">
      {/* Header */}
      <div className="border-b border-subtech-light-blue/25 px-5 py-3">
        <h3 className="text-[0.8rem] font-bold uppercase tracking-[0.12em] text-subtech-dark-blue">
          Diagrama de pórticos
        </h3>
        <p
          className="mt-0.5 text-[0.72rem] text-subtech-dark-blue/70"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Haz clic en un pórtico para ver su historial
        </p>
      </div>

      {/* SVG diagram */}
      <div className="px-4 py-5">
        <svg
          viewBox="0 0 900 520"
          className="w-full select-none"
          style={{ maxHeight: 430 }}
          aria-label="Diagrama de pórticos de la mina"
        >
          {/* ── Mountain (cerro) silhouette ── */}
          {/*
            Triangular asymmetric cerro: steep left face, longer right slope.
            Straight-line slopes (L) give the hard mountain silhouette.

            Node coverage:
              P-left ( 18–152, 290–376) → inside left wall
              P-ctr  (266–362, 182–266) → left slope at x=314 ≈ y=78, node y=182 ✓
              P-top  (460–568,  70–164) → peak y=6, node y=70 ✓
              P-BR   (798–898, 400–492) → right base at x=848 ≈ y=270, inside body ✓
          */}

          {/* Inner shading — rock depth */}
          <path
            d={
              "M -10 520 L -10 378" +
              " L 82 252" +                 // straight inner left slope
              " L 462 98 Q 490 88 520 98" + // inner peak plateau
              " L 848 278 Q 900 342 910 462" +
              " L 910 520 Z"
            }
            fill="rgba(118,82,28,0.13)"
          />

          {/* Outer cerro — straight slopes, pointed asymmetric peak */}
          <path
            d={
              /* left base + straight steep left face */
              "M -10 520 L -10 302 L 82 168" +
              /* straight left slope up to peak */
              " L 462 6" +
              /* PEAK — short rounded tip */
              " Q 488 -5 516 8" +
              /* straight right slope — more gradual angle */
              " L 848 256" +
              /* right base curve down to ground */
              " Q 900 328 910 430" +
              " L 910 520 Z"
            }
            fill="rgba(168,124,62,0.22)"
            stroke="rgba(128,84,28,0.34)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* ── Tunnel paths ── */}
          {TUNNEL_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#D6C3A8"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* ── Nodes ── */}
          {nodes.map(({ pos, data, short, fallback }) => {
            const ncx = cx(pos);
            const ncy = cy(pos);
            const isActive = !!data && selected === data.portico;
            const empty = !data;

            const fillColor   = empty ? "#F4F7FC" : isActive ? "#265291" : "#FFFFFF";
            const strokeColor = empty ? "#C8DDF2" : isActive ? "#265291" : "#265291";
            const strokeW     = empty ? 1.5 : 2;
            const dash        = empty ? "5 4" : undefined;

            const countColor  = isActive ? "#FFFFFF" : empty ? "rgba(38,82,145,0.30)" : "#265291";
            const labelColor  = isActive ? "rgba(255,255,255,0.80)" : empty ? "rgba(38,82,145,0.30)" : "rgba(38,82,145,0.65)";

            const [line1, line2] = splitLabel(data ? data.portico : fallback);
            const twoLines = line2 !== "";
            const displayCount = data ? data.currentCount : 0;

            return (
              <g
                key={pos.id}
                style={{ cursor: data ? "pointer" : "default" }}
                onClick={() => {
                  if (!data) return;
                  onSelect(isActive ? null : data.portico);
                }}
                role={data ? "button" : undefined}
                aria-label={data ? `Pórtico ${data.portico}` : undefined}
              >
                {/* Drop shadow */}
                {!empty && (
                  <rect
                    x={pos.x + 2}
                    y={pos.y + 4}
                    width={pos.w}
                    height={pos.h}
                    rx={pos.rx}
                    fill="rgba(38,82,145,0.07)"
                  />
                )}

                {/* Main rectangle */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.w}
                  height={pos.h}
                  rx={pos.rx}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  strokeDasharray={dash}
                />

                {/* Content: count + 1-or-2 line label (always shown) */}
                <>
                  <text
                    x={ncx}
                    y={twoLines ? ncy - 16 : ncy - 5}
                    textAnchor="middle"
                    dominantBaseline="auto"
                    fontSize="24"
                    fontWeight="700"
                    fill={countColor}
                    style={{ fontFamily: "var(--font-geist-sans, system-ui)" }}
                  >
                    {displayCount}
                  </text>
                  <text
                    x={ncx}
                    y={twoLines ? ncy + 5 : ncy + 16}
                    textAnchor="middle"
                    dominantBaseline="auto"
                    fontSize="9"
                    fontWeight="500"
                    fill={labelColor}
                    style={{ fontFamily: "var(--font-dm-sans, system-ui)" }}
                  >
                    {line1}
                  </text>
                  {twoLines && (
                    <text
                      x={ncx}
                      y={ncy + 17}
                      textAnchor="middle"
                      dominantBaseline="auto"
                      fontSize="9"
                      fontWeight="500"
                      fill={labelColor}
                      style={{ fontFamily: "var(--font-dm-sans, system-ui)" }}
                    >
                      {line2}
                    </text>
                  )}
                </>

                {/* Invisible hover overlay */}
                {!empty && (
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.w}
                    height={pos.h}
                    rx={pos.rx}
                    fill="transparent"
                    className="hover:fill-black/[0.04] transition-colors"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-5 border-t border-subtech-light-blue/20 px-4 py-2.5 text-[0.65rem] text-subtech-dark-blue/60"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-subtech-dark-blue" />
          Pórtico activo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-subtech-dark-blue bg-white" />
          Sin selección
        </span>
        <span>
          El número indica personas / maquinaria únicas detectadas en este pórtico
        </span>
      </div>
    </div>
  );
}
