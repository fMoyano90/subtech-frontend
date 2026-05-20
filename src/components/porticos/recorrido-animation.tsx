"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { EnrichedRecorridoStep } from "@/lib/mina-tags";

/* ═══════════════════════════════════════════════════════
   RecorridoAnimation — animated playback on the SVG map
   ═══════════════════════════════════════════════════════ */

const C = {
  p840:  { x: 85,  y: 333 },
  ppolv: { x: 314, y: 224 },
  p950:  { x: 514, y: 117 },
  pinf:  { x: 848, y: 446 },
} as const;

const JUNC = { x: 314, y: 333 };
const BEND = { x: 848, y: 333 };

interface RoutePoint { x: number; y: number }

function keywordToPid(portico: string): string {
  const l = portico.toLowerCase();
  if (l.includes("840")) return "p840";
  if (l.includes("cruce")) return "ppolv";
  if (l.includes("950")) return "p950";
  if (l.includes("inferior")) return "pinf";
  return "p840";
}

function route(from: string, to: string): RoutePoint[] {
  const a = C[from as keyof typeof C] ?? C.p840;
  const b = C[to as keyof typeof C] ?? C.p840;
  if ((from === "p840" && to === "ppolv") || (from === "ppolv" && to === "p840"))
    return [a, { x: JUNC.x, y: C.p840.y }, b];
  if ((from === "p840" && to === "p950") || (from === "p950" && to === "p840"))
    return [a, { x: JUNC.x, y: C.p840.y }, C.ppolv, b];
  if ((from === "ppolv" && to === "p950") || (from === "p950" && to === "ppolv"))
    return [a, b];
  if ((from === "p840" && to === "pinf") || (from === "pinf" && to === "p840"))
    return [a, { x: BEND.x, y: C.p840.y }, b];
  if ((from === "ppolv" && to === "pinf") || (from === "pinf" && to === "ppolv"))
    return [a, { x: JUNC.x, y: JUNC.y }, { x: BEND.x, y: JUNC.y }, b];
  if ((from === "p950" && to === "pinf") || (from === "pinf" && to === "p950"))
    return [a, C.ppolv, { x: JUNC.x, y: JUNC.y }, { x: BEND.x, y: JUNC.y }, b];
  return [a, b];
}

function ptsToD(pts: RoutePoint[]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

function pathLength(pts: RoutePoint[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

function pointOnPath(pts: RoutePoint[], t: number): { x: number; y: number } {
  const total = pathLength(pts);
  let target = t * total;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (target <= segLen) {
      const f = segLen > 0 ? target / segLen : 0;
      return { x: pts[i - 1].x + dx * f, y: pts[i - 1].y + dy * f };
    }
    target -= segLen;
  }
  return pts[pts.length - 1];
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface RecorridoAnimationProps {
  steps: EnrichedRecorridoStep[];
  isPlaying: boolean;
  currentStep: number;
  speed: number;
  onStepComplete?: (step: number) => void;
}

export function RecorridoAnimation({
  steps,
  isPlaying,
  currentStep,
  speed,
  onStepComplete,
}: RecorridoAnimationProps) {
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);
  const [animProgress, setAnimProgress] = useState(0);

  const BASE_DURATION = 1800;

  const tickFn = useRef<((timestamp: number) => void) | null>(null);

  const tick = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    const cs = currentStep;
    if (cs < steps.length) {
      const fromPid = cs === 0 ? "p840" : keywordToPid(steps[cs - 1].portico);
      const toPid = keywordToPid(steps[cs].portico);
      const pts = route(fromPid, toPid);
      const dur = BASE_DURATION / speed;

      progressRef.current += delta / dur;

      if (progressRef.current >= 1) {
        progressRef.current = 1;
        const end = pointOnPath(pts, 1);
        setDotPos(end);
        setAnimProgress(1);
        lastTimeRef.current = 0;
        onStepComplete?.(cs + 1);
        return;
      }

      const eased = easeInOutCubic(progressRef.current);
      setAnimProgress(eased);
      setDotPos(pointOnPath(pts, eased));
    }

    if (tickFn.current) {
      animRef.current = requestAnimationFrame(tickFn.current);
    }
  }, [currentStep, steps, speed, onStepComplete]);

  useEffect(() => {
    tickFn.current = tick;
  }, [tick]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      lastTimeRef.current = 0;
      progressRef.current = 0;
      if (tickFn.current) {
        animRef.current = requestAnimationFrame(tickFn.current);
      }
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, currentStep, steps.length]);

  if (steps.length === 0) return null;

  const completedPaths: { d: string; num: number; mx: number; my: number }[] = [];
  let activePath: { d: string; pts: RoutePoint[]; labelX: number; labelY: number } | null = null;

  for (let i = 0; i <= currentStep && i < steps.length; i++) {
    const fromPid = i === 0 ? "p840" : keywordToPid(steps[i - 1].portico);
    const toPid = keywordToPid(steps[i].portico);
    const pts = route(fromPid, toPid);
    const d = ptsToD(pts);
    const mi = Math.max(0, Math.floor(pts.length / 2) - 1);
    const mx = (pts[mi].x + (pts[mi + 1] ?? pts[mi]).x) / 2;
    const my = (pts[mi].y + (pts[mi + 1] ?? pts[mi]).y) / 2;

    if (i < currentStep) {
      completedPaths.push({ d, num: i + 1, mx, my });
    } else if (i === currentStep) {
      activePath = { d, pts, labelX: mx, labelY: my };
    }
  }

  const activeLen = activePath ? pathLength(activePath.pts) : 0;
  const activeDashOffset = activeLen * (1 - animProgress);

  return (
    <g className="recorrido-animation-layer">
      {/* Completed paths */}
      {completedPaths.map((p, i) => (
        <g key={`c-${i}`}>
          <path d={p.d} fill="none" stroke="#888780" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" strokeDasharray="5 3" />
          <circle cx={p.mx} cy={p.my} r="8" fill="#888780" opacity="0.7" />
          <text x={p.mx} y={p.my + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">{p.num}</text>
        </g>
      ))}

      {/* Active path */}
      {activePath && (
        <g>
          <path d={activePath.d} fill="none" stroke="#185FA5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
          <path d={activePath.d} fill="none" stroke="#185FA5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={activeLen} strokeDashoffset={activeDashOffset} />
          <circle cx={activePath.labelX} cy={activePath.labelY} r="9" fill="#185FA5" />
          <text x={activePath.labelX} y={activePath.labelY + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">{currentStep + 1}</text>
        </g>
      )}

      {/* Moving dot */}
      {dotPos && isPlaying && (
        <g>
          <circle cx={dotPos.x} cy={dotPos.y} r="14" fill="#185FA5" opacity="0.15">
            <animate attributeName="r" values="12;16;12" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.1;0.2" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx={dotPos.x} cy={dotPos.y} r="7" fill="none" stroke="#185FA5" strokeWidth="1.5" opacity="0.4" />
          <circle cx={dotPos.x} cy={dotPos.y} r="5" fill="#185FA5" stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
    </g>
  );
}
