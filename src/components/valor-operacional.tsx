"use client";

import { useState } from "react";

type CasoIdx = 0 | 1 | 2;

const casos = [
  {
    icon: "⛏",
    iconBg: "from-subtech-blue/20 to-subtech-dark-blue/20",
    iconBorder: "border-subtech-blue/20",
    role: "Jefe de turno",
    title: "Control en tiempo real",
    desc: "Durante un turno, el jefe de turno necesita saber dónde están sus recursos sin hacer rondas físicas. Con el historial de pórticos sabe en tiempo real qué equipos y personas cruzaron cada punto de control y en qué nivel quedaron.",
    beneficios: [
      "Saber en qué nivel está cada equipo sin llamar por radio",
      "Detectar si un equipo lleva demasiado tiempo sin cruzar un pórtico",
      "Confirmar presencia antes de iniciar tronadura en un sector",
      "Validar entradas y salidas de mina en cada cambio de turno",
      "Reducir tiempo de búsqueda de activos mal ubicados",
    ],
    screenHeader: "Vista jefe de turno · 15/05/2026 · Turno día",
    kpis: [
      { num: "17", label: "Personas en interior mina", color: "" },
      { num: "9", label: "Equipos activos", color: "" },
      { num: "4", label: "Pórticos online", color: "verde" },
      { num: "2", label: "Equipos sin mov. +2h", color: "amarillo" },
    ],
    alerts: [
      {
        type: "warning" as const,
        icon: "⚠",
        text: "Jumbo JD45 lleva 2h 15min sin cruzar ningún pórtico. Último registro: Cruce Polvorín 11:30.",
      },
      {
        type: "success" as const,
        icon: "✓",
        text: "Todos los niveles superiores con personal confirmado en turno.",
      },
    ],
  },
  {
    icon: "🛡",
    iconBg: "from-red-400/15 to-amber-400/10",
    iconBorder: "border-red-400/20",
    role: "Jefe de seguridad",
    title: "Trazabilidad y emergencias",
    desc: "El jefe de seguridad necesita dos cosas: saber exactamente quién está adentro si hay una emergencia, y tener registro digital para cualquier auditoría o investigación post-incidente. Ambas vienen del mismo sistema.",
    beneficios: [
      "En emergencia: lista inmediata de personas en interior con última ubicación conocida",
      "Recorrido cronológico reconstruible de cualquier persona en cualquier día",
      "Evidencia digital ante inspección de SERNAGEOMIN",
      "Alertas cuando un pórtico se desconecta (punto ciego potencial)",
      "Historial de maquinaria pesada para prevención de colisiones",
    ],
    screenHeader: "Panel de seguridad · Emergencia simulada · Nivel 3",
    alerts: [
      {
        type: "danger" as const,
        icon: "🚨",
        text: "Alerta de emergencia activada · Nivel 3 · 14:23 hrs",
      },
    ],
    miniListTitle: "Personal en zona afectada",
    miniList: [
      { name: "J. Bustamante", detail: "Cruce Polvorín · 14:08", color: "text-amber-400" },
      { name: "P. Rodríguez", detail: "Niv. Superiores · 13:55", color: "text-amber-400" },
      { name: "C. Vidal", detail: "Exterior · 13:40", color: "text-green-400" },
    ],
    footerAlert: {
      type: "info" as const,
      icon: "📋",
      text: "Registro exportado automáticamente para informe SERNAGEOMIN.",
    },
  },
  {
    icon: "📊",
    iconBg: "from-green-400/15 to-subtech-blue/10",
    iconBorder: "border-green-400/20",
    role: "Gerencia de operaciones",
    title: "Visibilidad y eficiencia",
    desc: "La gerencia de operaciones necesita visibilidad de qué tan eficientemente se mueven los recursos en la mina. Los datos de recorrido revelan cuellos de botella, patrones de movimiento y oportunidades de mejora en la planificación.",
    beneficios: [
      "Verificar presencia efectiva de personas y equipos en faena por turno",
      "Analizar patrones de movimiento para optimizar asignación de equipos",
      "Detectar sectores con alta concentración o congestión de activos",
      "Respaldo digital para informes operacionales y reportes de producción",
      "Base de datos para decisiones de escalabilidad y nuevas inversiones",
    ],
    screenHeader: "Resumen gerencial · Mayo 2026",
    kpis: [
      { num: "98%", label: "Uptime del sistema", color: "verde" },
      { num: "1.240", label: "Pasos registrados este mes", color: "" },
    ],
    miniListTitle: "Flujo por pórtico",
    miniList: [
      { name: "Bocamina Cota 840", detail: "617 pasos", color: "text-white" },
      { name: "Cruce Polvorín", detail: "389 pasos", color: "text-white" },
      { name: "Bocamina Cota 860", detail: "234 pasos", color: "text-white" },
    ],
  },
];

export default function ValorOperacional() {
  const [activeCaso, setActiveCaso] = useState<CasoIdx>(0);
  const caso = casos[activeCaso];

  return (
    <section id="valor" className="relative overflow-hidden px-4 py-24 md:px-10 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[#020611]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_30%,rgba(255,241,156,0.04),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_70%,rgba(38,82,145,0.06),transparent)]" />

      <div className="relative mx-auto max-w-[1280px]">
        {/* Section header */}
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-subtech-yellow/20 bg-subtech-yellow/5 px-4 py-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-subtech-yellow/70">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtech-yellow">
              Valor operacional
            </p>
          </div>
          <h2 className="text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-white md:text-5xl">
            ¿Qué hace tu equipo con estos datos?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-subtech-light-blue/60" style={{ fontFamily: "var(--font-dm-sans)" }}>
            La información de recorridos e historial se traduce en decisiones concretas según el rol. Elige el tuyo.
          </p>
        </div>

        {/* Tabs */}
        <div data-reveal className="mt-14 grid gap-3 md:grid-cols-3">
          {casos.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveCaso(i as CasoIdx)}
              className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                activeCaso === i
                  ? "border-subtech-blue/20 bg-[#0c1525] shadow-[0_8px_32px_rgba(38,82,145,0.15)]"
                  : "border-subtech-blue/8 bg-[#070d1a]/60 hover:border-subtech-blue/15 hover:bg-[#0a1220]"
              }`}
            >
              {/* Active indicator */}
              {activeCaso === i && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-subtech-light-blue to-transparent" />
              )}
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.iconBg} border ${c.iconBorder} text-xl transition-transform duration-300 group-hover:scale-105`}>
                  {c.icon}
                </div>
                <div>
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtech-light-blue/40">
                    {c.role}
                  </p>
                  <p className={`text-[14px] font-bold transition-colors duration-200 ${
                    activeCaso === i ? "text-white" : "text-subtech-light-blue/60 group-hover:text-white"
                  }`}>
                    {c.title}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left: Description + Benefits */}
          <div data-reveal>
            <div className="mb-6 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${caso.iconBg} border ${caso.iconBorder} text-lg`}>
                {caso.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtech-light-blue/40">
                  {caso.role}
                </p>
                <p className="text-lg font-bold text-white">{caso.title}</p>
              </div>
            </div>

            <p className="text-[14px] leading-8 text-subtech-light-blue/60" style={{ fontFamily: "var(--font-dm-sans)" }}>
              {caso.desc}
            </p>

            <div className="mt-8 rounded-2xl border border-subtech-blue/8 bg-[#070d1a]/50 p-6">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtech-light-blue/40">
                Beneficios clave
              </p>
              <ul className="flex flex-col gap-3">
                {caso.beneficios.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-subtech-dark-blue/30 text-[10px] font-bold text-subtech-light-blue/60">
                      {i + 1}
                    </span>
                    <span className="text-[13px] leading-6 text-subtech-light-blue/60" style={{ fontFamily: "var(--font-dm-sans)" }}>
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Mock Screen */}
          <div data-reveal className="rounded-2xl border border-subtech-blue/10 bg-[#070d1a] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center justify-between border-b border-subtech-blue/10 bg-[#0a1220] px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              </div>
              <span className="text-[10px] font-medium tracking-[0.06em] text-subtech-light-blue/30">
                {caso.screenHeader}
              </span>
              <div className="flex items-center gap-1.5 rounded-md border border-subtech-blue/10 bg-black/30 px-2 py-1">
                <span className="h-1 w-1 rounded-full bg-green-400" />
                <span className="text-[9px] text-green-400/60">LIVE</span>
              </div>
            </div>

            {/* Screen content */}
            <div className="bg-gradient-to-b from-[#0a1220]/50 to-[#070d1a] p-5">
              {/* KPIs */}
              {caso.kpis && (
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {caso.kpis.map((kpi, i) => (
                    <div
                      key={i}
                      className={`group relative overflow-hidden rounded-xl border border-subtech-blue/8 bg-black/30 p-4 transition-all duration-200 hover:border-subtech-blue/15 ${
                        kpi.color === "verde"
                          ? "border-green-400/15 bg-green-400/5"
                          : kpi.color === "amarillo"
                          ? "border-amber-400/15 bg-amber-400/5"
                          : ""
                      }`}
                    >
                      {/* Subtle gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        kpi.color === "verde" ? "from-green-400/5 to-transparent" :
                        kpi.color === "amarillo" ? "from-amber-400/5 to-transparent" :
                        "from-subtech-blue/5 to-transparent"
                      }`} />
                      <div className="relative">
                        <span className={`block text-2xl font-bold tracking-tight ${
                          kpi.color === "verde" ? "text-green-400" :
                          kpi.color === "amarillo" ? "text-amber-400" :
                          "text-subtech-light-blue"
                        }`}>
                          {kpi.num}
                        </span>
                        <span className="mt-1 block text-[10px] leading-tight text-subtech-light-blue/35">
                          {kpi.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Alerts */}
              {caso.alerts?.map((alert, i) => (
                <div
                  key={i}
                  className={`mb-3 flex items-start gap-3 rounded-xl border p-4 text-[12px] leading-6 ${
                    alert.type === "warning"
                      ? "border-amber-400/20 bg-amber-400/5 text-amber-300/80"
                      : alert.type === "success"
                      ? "border-green-400/15 bg-green-400/5 text-green-400/80"
                      : "border-red-400/20 bg-red-400/5 text-red-300/80"
                  }`}
                >
                  <span className="flex-shrink-0 text-base">{alert.icon}</span>
                  <span style={{ fontFamily: "var(--font-dm-sans)" }}>{alert.text}</span>
                </div>
              ))}

              {/* Mini list */}
              {caso.miniListTitle && (
                <>
                  <div className="mb-3 mt-4 flex items-center gap-2">
                    <div className="h-3 w-0.5 rounded-full bg-subtech-blue/40" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtech-light-blue/35">
                      {caso.miniListTitle}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {caso.miniList?.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-subtech-blue/5 bg-black/20 px-4 py-3 text-[12px] transition hover:bg-black/30"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2 w-2 rounded-full ${
                            item.color === "text-green-400" ? "bg-green-400" : "bg-amber-400"
                          }`} />
                          <span className="font-medium text-white">{item.name}</span>
                        </div>
                        <span className={`font-semibold ${item.color}`}>{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Footer alert */}
              {caso.footerAlert && (
                <div
                  className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-[12px] leading-6 ${
                    caso.footerAlert.type === "info"
                      ? "border-subtech-blue/15 bg-subtech-blue/5 text-subtech-light-blue/70"
                      : caso.footerAlert.type === "warning"
                      ? "border-amber-400/20 bg-amber-400/5 text-amber-300/80"
                      : "border-red-400/20 bg-red-400/5 text-red-300/80"
                  }`}
                >
                  <span className="flex-shrink-0 text-base">{caso.footerAlert.icon}</span>
                  <span style={{ fontFamily: "var(--font-dm-sans)" }}>{caso.footerAlert.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
