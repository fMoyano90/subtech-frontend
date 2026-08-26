"use client";

import { useState, useEffect, useRef } from "react";

type PorticoKey = "p-840" | "p-polvorin" | "p-860" | "p-inferiores";
type DemoTab = "historial" | "recorrido";

const porticoData: Record<PorticoKey, {
  name: string;
  status: "online" | "offline";
  count: string;
  x: number;
  y: number;
  w: number;
  h: number;
}> = {
  "p-860": { name: "Bocamina Cota 860", status: "online", count: "1 activo", x: 160, y: 35, w: 160, h: 38 },
  "p-840": { name: "Bocamina Cota 840", status: "online", count: "3 activos", x: 145, y: 115, w: 190, h: 52 },
  "p-polvorin": { name: "Cruce Polvorín", status: "online", count: "2 activos", x: 280, y: 210, w: 135, h: 46 },
  "p-inferiores": { name: "Niveles Inferiores", status: "online", count: "1 activo", x: 110, y: 300, w: 135, h: 38 },
};

const porticoOrder: PorticoKey[] = ["p-860", "p-840", "p-polvorin", "p-inferiores"];

const historialData: Record<PorticoKey, Array<{ name: string; time: string; type: "persona" | "equipo" }>> = {
  "p-860": [
    { name: "P. Rodríguez", time: "08:15", type: "persona" },
    { name: "Camión C3", time: "09:30", type: "equipo" },
  ],
  "p-840": [
    { name: "J. Bustamante", time: "10:30", type: "persona" },
    { name: "Jumbo JD45", time: "10:45", type: "equipo" },
    { name: "J. Bustamante", time: "12:39", type: "persona" },
    { name: "Scooptram S7", time: "13:10", type: "equipo" },
    { name: "J. Bustamante", time: "14:08", type: "persona" },
  ],
  "p-polvorin": [
    { name: "J. Bustamante", time: "12:54", type: "persona" },
    { name: "Jumbo JD45", time: "13:30", type: "equipo" },
    { name: "J. Bustamante", time: "14:42", type: "persona" },
  ],
  "p-inferiores": [
    { name: "M. Torres", time: "11:20", type: "persona" },
  ],
};

const recorridoBustamante = [
  { portico: "p-840" as PorticoKey, hora: "10:30:37", ubicacion: "Exterior Mina", tipo: "exterior" },
  { portico: "p-840" as PorticoKey, hora: "12:39:05", ubicacion: "Niveles Medios", tipo: "" },
  { portico: "p-polvorin" as PorticoKey, hora: "12:54:50", ubicacion: "Niveles Superiores", tipo: "superiores" },
  { portico: "p-840" as PorticoKey, hora: "14:08:53", ubicacion: "Exterior Mina", tipo: "exterior" },
  { portico: "p-polvorin" as PorticoKey, hora: "14:42:33", ubicacion: "Niveles Superiores", tipo: "superiores" },
];

export default function DemoInteractiva() {
  const [activeTab, setActiveTab] = useState<DemoTab>("historial");
  const [selectedPortico, setSelectedPortico] = useState<PorticoKey | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number | null>(null);

  const handlePorticoSelect = (id: PorticoKey) => {
    if (isPlaying) return;
    setSelectedPortico((prev) => (prev === id ? null : id));
  };

  const startSimulation = () => {
    if (isPlaying) {
      stopSimulation();
      return;
    }
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
    setSelectedPortico(null);

    let step = 0;
    let prog = 0;
    const animDuration = 1500;
    let startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      prog = Math.min(elapsed / animDuration, 1);
      setProgress(prog);

      if (prog >= 1) {
        step++;
        if (step >= animPathSegments.length) {
          setIsPlaying(false);
          setCurrentStep(-1);
          setProgress(0);
          return;
        }
        setCurrentStep(step);
        startTime = performance.now();
        prog = 0;
        setProgress(0);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const stopSimulation = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsPlaying(false);
    setCurrentStep(-1);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const getPorticoCenter = (pk: PorticoKey) => {
    const d = porticoData[pk];
    return { cx: d.x + d.w / 2, cy: d.y + d.h / 2 };
  };

  // Path segments for animation (bustamante recorrido)
  const animPathSegments = [
    { from: "p-840" as PorticoKey, to: "p-840" as PorticoKey },
    { from: "p-840" as PorticoKey, to: "p-polvorin" as PorticoKey },
    { from: "p-polvorin" as PorticoKey, to: "p-840" as PorticoKey },
    { from: "p-840" as PorticoKey, to: "p-polvorin" as PorticoKey },
  ];

  const activePathIdx = isPlaying ? currentStep : -1;

  return (
    <section id="demo" className="relative overflow-hidden px-4 py-24 md:px-10 lg:py-32">
      {/* Mountain/underground background */}
      <div className="absolute inset-0 bg-[#060e1a]" />
      <div className="absolute inset-0">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1440 600">
          <defs>
            <linearGradient id="mtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(15,30,50,0.6)" />
              <stop offset="100%" stopColor="rgba(6,14,26,0)" />
            </linearGradient>
            <linearGradient id="mtnGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(20,40,65,0.4)" />
              <stop offset="100%" stopColor="rgba(6,14,26,0)" />
            </linearGradient>
          </defs>
          {/* Far mountain silhouette */}
          <path d="M0 300 Q100 200 200 250 Q350 150 500 220 Q600 180 720 200 Q850 160 1000 230 Q1100 190 1200 240 Q1350 200 1440 260 L1440 600 L0 600Z" fill="url(#mtnGrad2)" />
          {/* Near mountain silhouette */}
          <path d="M0 350 Q150 280 300 320 Q450 260 600 300 Q750 250 900 310 Q1050 270 1200 330 Q1350 290 1440 340 L1440 600 L0 600Z" fill="url(#mtnGrad)" />
          {/* Underground tunnel hint */}
          <path d="M0 450 Q200 420 400 440 Q600 430 800 450 Q1000 435 1200 445 Q1350 440 1440 455 L1440 600 L0 600Z" fill="rgba(10,20,35,0.5)" />
        </svg>
      </div>
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(111,176,226,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(111,176,226,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative mx-auto max-w-[1280px]">
        {/* Section header */}
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-subtech-blue/20 bg-subtech-blue/5 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtech-light-blue">
              Demo interactiva
            </p>
          </div>
          <h2 className="text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-white md:text-5xl">
            Así funcionan los datos en tu operación.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-subtech-light-blue/60" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Explora el sistema real. Selecciona un pórtico para ver su historial, o reproduce un recorrido simulado.
          </p>
        </div>

        {/* Dashboard */}
        <div data-reveal className="mt-14 overflow-hidden rounded-3xl border border-white/5 bg-[#0a1525]/80 shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-sm">
          {/* Tab bar */}
          <div className="flex items-center justify-between border-b border-white/5 bg-[#0c1828]/60 px-6 py-3">
            <div className="flex gap-1 rounded-lg bg-black/30 p-1">
              <button
                onClick={() => { setActiveTab("historial"); setSelectedPortico(null); stopSimulation(); }}
                className={`rounded-md px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 ${
                  activeTab === "historial"
                    ? "bg-subtech-dark-blue text-white shadow-lg shadow-subtech-dark-blue/30"
                    : "text-subtech-light-blue/40 hover:text-white"
                }`}
              >
                Historial de pórtico
              </button>
              <button
                onClick={() => { setActiveTab("recorrido"); stopSimulation(); }}
                className={`rounded-md px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 ${
                  activeTab === "recorrido"
                    ? "bg-subtech-dark-blue text-white shadow-lg shadow-subtech-dark-blue/30"
                    : "text-subtech-light-blue/40 hover:text-white"
                }`}
              >
                Recorrido simulado
              </button>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "recorrido" && (
                <button
                  onClick={startSimulation}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200 ${
                    isPlaying
                      ? "bg-red-400/15 text-red-400 border border-red-400/30 hover:bg-red-400/25"
                      : "bg-subtech-dark-blue text-white border border-subtech-blue/30 hover:bg-subtech-blue shadow-lg shadow-subtech-dark-blue/20"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                      Detener
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                      Reproducir
                    </>
                  )}
                </button>
              )}
              <div className="flex items-center gap-1.5 rounded-md border border-white/5 bg-black/20 px-2.5 py-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? "animate-pulse bg-green-400" : "bg-white/20"}`} />
                <span className="text-[10px] font-medium text-white/30">
                  {isPlaying ? "SIMULANDO" : "Mina Don Jaime"}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col lg:flex-row">
            {/* Map area */}
            <div className="relative flex min-h-[460px] items-center justify-center p-6 lg:flex-1">
              {/* Corner brackets */}
              <div className="pointer-events-none absolute left-3 top-3 h-12 w-12 border-l border-t border-subtech-blue/15" />
              <div className="pointer-events-none absolute right-3 top-3 h-12 w-12 border-r border-t border-subtech-blue/15" />
              <div className="pointer-events-none absolute bottom-3 left-3 h-12 w-12 border-b border-l border-subtech-blue/15" />
              <div className="pointer-events-none absolute bottom-3 right-3 h-12 w-12 border-b border-r border-subtech-blue/15" />

              <svg viewBox="0 0 520 400" className="w-full max-w-[560px]" style={{ fontFamily: "Outfit, sans-serif" }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glowStrong">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Wide mountain silhouette - house/peak shape */}
                <path
                  d="M60 140 L160 50 L260 20 L360 50 L460 140 L460 350 Q460 368 442 368 L78 368 Q60 368 60 350 Z"
                  fill="rgba(8,16,30,0.6)"
                  stroke="rgba(111,176,226,0.15)"
                  strokeWidth="1.5"
                />
                {/* Inner glow border */}
                <path
                  d="M60 140 L160 50 L260 20 L360 50 L460 140 L460 350 Q460 368 442 368 L78 368 Q60 368 60 350 Z"
                  fill="none"
                  stroke="rgba(111,176,226,0.06)"
                  strokeWidth="24"
                  filter="url(#glow)"
                />
                {/* Rock texture - diagonal lines */}
                <path d="M160 50 L140 120 L120 200" stroke="rgba(111,176,226,0.04)" strokeWidth="0.5" />
                <path d="M260 20 L258 100 L255 200" stroke="rgba(111,176,226,0.04)" strokeWidth="0.5" />
                <path d="M360 50 L380 120 L400 200" stroke="rgba(111,176,226,0.04)" strokeWidth="0.5" />
                <path d="M60 140 L100 180" stroke="rgba(111,176,226,0.04)" strokeWidth="0.5" />
                <path d="M460 140 L420 180" stroke="rgba(111,176,226,0.04)" strokeWidth="0.5" />

                {/* Level lines */}
                <line x1="70" y1="145" x2="450" y2="145" stroke="rgba(111,176,226,0.06)" strokeWidth="1" strokeDasharray="6 4" />
                <line x1="70" y1="240" x2="450" y2="240" stroke="rgba(111,176,226,0.06)" strokeWidth="1" strokeDasharray="6 4" />
                <text x="78" y="141" fontSize="9" fill="rgba(111,176,226,0.2)" textAnchor="start">Niveles superiores</text>
                <text x="78" y="236" fontSize="9" fill="rgba(111,176,226,0.2)" textAnchor="start">Niveles medios</text>
                <text x="78" y="364" fontSize="9" fill="rgba(111,176,226,0.2)" textAnchor="start">Niveles inferiores</text>

                {/* Tunnel connections */}
                {/* 860 -> 840 (vertical dashed) */}
                <path d="M240 73 L240 115" stroke="rgba(111,176,226,0.15)" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="4 4" />
                {/* 840 -> Polvorín (diagonal down-right) */}
                <path d="M250 167 L347 210" stroke="rgba(111,176,226,0.12)" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* 840 -> Inferiores (diagonal down-left) */}
                <path d="M225 167 L177 300" stroke="rgba(111,176,226,0.12)" strokeWidth="3" strokeLinecap="round" fill="none" />

                {/* Animated travel path */}
                {isPlaying && activePathIdx >= 0 && (
                  <g filter="url(#glow)">
                    {animPathSegments.map((seg, i) => {
                       if (i > activePathIdx) return null;
                       const from = getPorticoCenter(seg.from);
                       const to = getPorticoCenter(seg.to);
                       const isPast = i < activePathIdx;

                      if (isPast) {
                        return (
                          <path
                            key={i}
                            d={`M${from.cx} ${from.cy} L${to.cx} ${to.cy}`}
                            stroke="#6FB0E2"
                            strokeWidth="2"
                            fill="none"
                            opacity="0.25"
                          />
                        );
                      }

                      const dx = to.cx - from.cx;
                      const dy = to.cy - from.cy;
                      const endX = from.cx + dx * progress;
                      const endY = from.cy + dy * progress;

                      return (
                        <g key={i}>
                          <path
                            d={`M${from.cx} ${from.cy} L${to.cx} ${to.cy}`}
                            stroke="rgba(111,176,226,0.1)"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <path
                            d={`M${from.cx} ${from.cy} L${endX} ${endY}`}
                            stroke="#ef9f27"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                          <circle cx={endX} cy={endY} r="3.5" fill="#ef9f27" />
                          <circle cx={endX} cy={endY} r="7" fill="none" stroke="rgba(239,159,39,0.25)" strokeWidth="1" />
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Portico cards */}
                {porticoOrder.map((pk) => {
                  const d = porticoData[pk];
                  const isSelected = selectedPortico === pk;
                  const isHighlighted = isPlaying && activePathIdx >= 0 && (
                    animPathSegments[activePathIdx]?.from === pk || animPathSegments[activePathIdx]?.to === pk
                  );

                  return (
                    <g
                      key={pk}
                      className="cursor-pointer"
                      onClick={() => handlePorticoSelect(pk)}
                    >
                      {/* Card background */}
                      <rect
                        x={d.x}
                        y={d.y}
                        width={d.w}
                        height={d.h}
                        rx="10"
                        fill={
                          isSelected
                            ? "rgba(38,82,145,0.5)"
                            : isHighlighted
                            ? "rgba(38,82,145,0.3)"
                            : "rgba(20,35,55,0.6)"
                        }
                        stroke={
                          isSelected
                            ? "rgba(111,176,226,0.7)"
                            : isHighlighted
                            ? "rgba(111,176,226,0.4)"
                            : "rgba(111,176,226,0.2)"
                        }
                        strokeWidth={isSelected || isHighlighted ? 1.5 : 1}
                        className="transition-all duration-300"
                      />
                      {/* Status dot */}
                      <circle
                        cx={d.x + d.w - 14}
                        cy={d.y + 12}
                        r="3.5"
                        fill="#4ade80"
                      />
                      <circle cx={d.x + d.w - 14} cy={d.y + 12} r="3.5" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.4">
                        <animate attributeName="r" values="3.5;8;3.5" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                      {/* Status text */}
                      <text
                        x={d.x + d.w / 2}
                        y={d.y + 16}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#4ade80"
                        fontWeight="600"
                        letterSpacing="0.5"
                      >
                        ONLINE
                      </text>
                      {/* Active count */}
                      <text
                        x={d.x + d.w / 2}
                        y={d.y + d.h / 2 + 4}
                        textAnchor="middle"
                        fontSize="14"
                        fill="white"
                        fontWeight="700"
                        letterSpacing="3"
                      >
                        {pk === "p-840" ? "1 2 4" : pk === "p-polvorin" ? "3 5" : "1"}
                      </text>
                      {/* Name */}
                      <text
                        x={d.x + d.w / 2}
                        y={d.y + d.h - 8}
                        textAnchor="middle"
                        fontSize="8"
                        fill="rgba(182,226,255,0.5)"
                      >
                        {d.name}
                      </text>
                    </g>
                  );
                })}

                {/* Legend */}
                <g transform="translate(12, 12)">
                  <rect x="0" y="0" width="80" height="36" rx="6" fill="rgba(10,18,32,0.7)" stroke="rgba(111,176,226,0.1)" strokeWidth="1" />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="rgba(111,176,226,0.5)" strokeWidth="1.5" />
                  <text x="22" y="15" fontSize="7.5" fill="rgba(182,226,255,0.4)">Pórtico activo</text>
                  <circle cx="12" cy="24" r="3" fill="rgba(38,82,145,0.4)" stroke="rgba(111,176,226,0.5)" strokeWidth="1.5" />
                  <text x="22" y="27" fontSize="7.5" fill="rgba(182,226,255,0.4)">Con activos</text>
                </g>
              </svg>
            </div>

            {/* Side Panel */}
            <div className="border-t border-white/5 bg-[#0c1828]/40 p-6 lg:w-80 lg:border-l lg:border-t-0">
              {activeTab === "historial" && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-4 w-0.5 rounded-full bg-subtech-blue" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtech-light-blue/40">
                      Selecciona un pórtico
                    </p>
                  </div>
                  <div className="mb-5 flex flex-col gap-2">
                    {porticoOrder.map((pk) => {
                      const d = porticoData[pk];
                      return (
                        <button
                          key={pk}
                          onClick={() => handlePorticoSelect(pk)}
                          disabled={isPlaying}
                          className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                            selectedPortico === pk
                              ? "border-subtech-light-blue/20 bg-subtech-dark-blue/20"
                              : "border-white/5 bg-black/15 hover:border-white/10 hover:bg-white/5"
                          } ${isPlaying ? "opacity-40 pointer-events-none" : ""}`}
                        >
                          <span className="relative h-2 w-2 flex-shrink-0 rounded-full bg-green-400" />
                          <span className="flex-1 text-[12px] font-medium text-white/80">{d.name}</span>
                          <span className="text-[10px] font-semibold text-green-400/60">
                            {d.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedPortico && historialData[selectedPortico].length > 0 && (
                    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtech-light-blue/60">
                          {porticoData[selectedPortico].name}
                        </p>
                        <span className="rounded-md bg-subtech-blue/10 px-2 py-0.5 text-[9px] font-semibold text-subtech-light-blue/50">
                          Hoy
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {historialData[selectedPortico].map((entry, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-black/25 px-3 py-2 text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                entry.type === "persona" ? "bg-subtech-light-blue/60" : "bg-amber-400/60"
                              }`} />
                              <span className="text-white/70">{entry.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white/25">{entry.time}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                                entry.type === "persona"
                                  ? "bg-subtech-blue/15 text-subtech-light-blue/60"
                                  : "bg-amber-400/15 text-amber-400/60"
                              }`}>
                                {entry.type === "persona" ? "Persona" : "Equipo"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedPortico && !isPlaying && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-white/[0.02]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
                          <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-white/20">Haz clic en un pórtico del mapa</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "recorrido" && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-4 w-0.5 rounded-full bg-subtech-yellow" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtech-light-blue/40">
                      Recorrido simulado
                    </p>
                  </div>

                  {/* Simulation info */}
                  <div className="mb-5 rounded-xl border border-subtech-yellow/10 bg-subtech-yellow/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-bold text-subtech-light-blue/80">
                        Julio Berne Bustamante
                      </p>
                      <span className="rounded-md bg-subtech-yellow/10 px-2 py-0.5 text-[9px] font-semibold text-subtech-yellow/70">
                        5 pasos
                      </span>
                    </div>
                    <p className="text-[10px] leading-5 text-white/30">
                      Recorrido del turno día · 15/05/2026
                    </p>
                  </div>

                  {/* Progress bar */}
                  {isPlaying && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] text-white/30">Progreso</span>
                        <span className="text-[10px] font-semibold text-subtech-light-blue/50">
                          {currentStep + 1} / {animPathSegments.length}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-subtech-dark-blue to-subtech-light-blue transition-all duration-100"
                          style={{ width: `${((currentStep + progress) / animPathSegments.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  <div className="flex flex-col">
                    {recorridoBustamante.map((paso, i) => {
                       const isActive = isPlaying && i === currentStep;
                       const isPast = isPlaying && i < currentStep;

                       return (
                        <div
                          key={i}
                          className={`relative flex items-start gap-3 border-l-2 py-3 pl-5 transition-all duration-300 ${
                            isActive
                              ? "border-subtech-light-blue"
                              : isPast
                              ? "border-subtech-blue/20"
                              : "border-white/5"
                          }`}
                        >
                          <span
                            className={`absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full border-2 transition-all duration-300 ${
                              isActive
                                ? "border-subtech-light-blue bg-subtech-light-blue shadow-[0_0_0_4px_rgba(111,176,226,0.15)]"
                                : isPast
                                ? "border-subtech-blue/30 bg-subtech-blue/20"
                                : "border-white/10 bg-transparent"
                            }`}
                          />
                          <span className={`mt-0.5 min-w-[16px] text-[10px] font-semibold ${
                            isActive ? "text-subtech-light-blue" : isPast ? "text-white/30" : "text-white/15"
                          }`}>
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <p className={`text-[12px] font-semibold ${
                              isActive ? "text-white" : isPast ? "text-white/50" : "text-white/25"
                            }`}>
                              {porticoData[paso.portico].name}
                            </p>
                            <p className={`text-[10px] ${
                              isActive ? "text-subtech-light-blue/50" : "text-white/20"
                            }`}>
                              {paso.hora}
                            </p>
                            <span
                              className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                paso.tipo === "exterior"
                                  ? "bg-green-400/10 text-green-400/70"
                                  : paso.tipo === "superiores"
                                  ? "bg-amber-400/10 text-amber-400/70"
                                  : "bg-subtech-blue/10 text-subtech-light-blue/50"
                              }`}
                            >
                              {paso.ubicacion}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!isPlaying && (
                    <div className="mt-4 text-center">
                      <p className="text-[11px] text-white/20">Presiona Reproducir para ver el recorrido</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
