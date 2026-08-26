import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/scroll-reveal";
import Navbar from "@/components/navbar";
import DemoInteractiva from "@/components/demo-interactiva";
import ValorOperacional from "@/components/valor-operacional";

const painPoints = [
  {
    icon: "/icono-tiempo.svg",
    title: "Tiempo perdido buscando",
    body: "Tu equipo pasa horas localizando herramientas, repuestos o equipos mal ubicados. Horas que no suman a la producción.",
  },
  {
    icon: "/icono%20legal.svg",
    title: "El riesgo legal es real",
    body: "Sin trazabilidad digital, no tienes prueba de dónde estaba tu gente en caso de incidente. La ley te pide que controles — y que lo demuestres.",
  },
  {
    icon: "/icono-emergencia.svg",
    title: "¿Quién está adentro?",
    body: "Cuando hay un derrumbe o emergencia a 300 metros de profundidad, necesitas saber exactamente quién está dónde. Las rondas no son suficientes.",
  },
];

const features = [
  {
    number: "01",
    title: "Profundidad garantizada",
    body: "Geolocalizacion operativa hasta 1.700 m bajo superficie con infraestructura propia instalada en interior mina.",
    accent: "1.700 m operativos",
  },
  {
    number: "02",
    title: "Sectorizacion inteligente",
    body: "Division por niveles estrategicos para acelerar respuesta ante emergencias y asignar recursos con mejor criterio.",
    accent: "3 niveles activos",
  },
  {
    number: "03",
    title: "Flota mixta completa",
    body: "Seguimiento de maquinaria, vehiculos y personal en una sola plataforma para ver la operacion completa.",
    accent: "9 equipos + 17 personas",
  },
  {
    number: "04",
    title: "Dashboard propietario",
    body: "Plano de mina, historial de porticos y trazabilidad de activos accesible desde superficie en tiempo real.",
    accent: "12 licencias activas",
  },
  {
    number: "05",
    title: "Porticos TAG robustos",
    body: "Puntos de control de alta resistencia en bocaminas y cruces criticos con arquitectura escalable.",
    accent: "4 porticos instalados",
  },
  {
    number: "06",
    title: "Servicio continuo",
    body: "Instalacion, soporte y mantenimiento para sostener continuidad operacional en faenas subterraneas.",
    accent: "Operacion 24/7",
  },
];

const testimonials = [
  {
    quote: "El sistema nos permite saber en tiempo real donde esta cada activo dentro de la mina.",
    author: "Christian Vidal Roa",
    role: "Jefe de Ingenieria y Proyectos",
  },
  {
    quote: "Pasamos de un portico piloto a cuatro en produccion. La escalabilidad del sistema es real.",
    author: "Gerencia General",
    role: "Compania Minera La Patagua",
  },
  {
    quote: "El historial de maquinaria y personal cambia como planificamos y respondemos ante emergencias.",
    author: "Jefe de Mina",
    role: "Mina Don Jaime",
  },
];

function SectionTitle({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="max-w-2xl" data-reveal>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-subtech-yellow">
        {eyebrow}
      </p>
      <h2 className="text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-white md:text-5xl">
        {title}
      </h2>
      {lead ? (
        <p className="mt-5 text-base leading-8 text-subtech-light-blue/60" style={{ fontFamily: "var(--font-dm-sans)" }}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

function PainPointCard({ point }: { point: (typeof painPoints)[number] }) {
  return (
    <article data-reveal className="group rounded-3xl border border-subtech-blue/10 bg-white p-7 text-center shadow-[0_24px_60px_rgba(2,6,17,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(38,82,145,0.16)]">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-subtech-light-blue/10">
        <Image src={point.icon} alt="" width={80} height={80} className="h-20 w-20 object-contain" />
      </div>
      <h3 className="mt-7 text-xl font-bold leading-tight tracking-[-0.02em] text-[#0a1628]">
        {point.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-slate-600 md:text-[15px]" style={{ fontFamily: "var(--font-dm-sans)" }}>
        {point.body}
      </p>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020611] text-white">
      <Navbar />

      <ScrollReveal>
      <section className="relative min-h-screen overflow-hidden bg-black px-4 pt-16 md:px-10 md:pt-28">
        <Image
          src="/entrada-mina.jpg"
          alt="Entrada mina"
          fill
          className="object-cover object-right md:object-center opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(2,6,17,0.95)_0%,rgba(2,6,17,0.7)_40%,rgba(2,6,17,0.2)_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(111,176,226,0.05)_1px,transparent 1px),linear-gradient(90deg,rgba(111,176,226,0.05)_1px,transparent 1px)] bg-[size:70px_70px]" />
        <div className="absolute inset-x-0 top-1/4 h-64 bg-subtech-blue/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1280px] flex-col justify-center">
          <div data-reveal-hero className="mb-8 w-fit rounded-xl border border-subtech-yellow/30 bg-subtech-yellow/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-subtech-yellow">
            TRL 7-8 - Sistema validado en operacion real
          </div>
          <h1 data-reveal-hero className="max-w-6xl text-[clamp(3.5rem,11vw,10rem)] font-semibold leading-[0.84] tracking-[-0.07em] text-white">
            Georeferencia<br />subterranea<br />real
          </h1>
          <p data-reveal-hero className="mt-6 max-w-sm text-base leading-7 text-white/70 md:mt-8 md:text-lg md:leading-8" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Geolocalizacion en tiempo real para mineria subterranea, donde el GPS no existe.
          </p>
          <div data-reveal-hero className="mt-8 flex flex-wrap justify-end gap-4 md:justify-start md:mt-10 md:gap-4">
            <Link href="/login" className="rounded-full border border-subtech-blue bg-subtech-dark-blue px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-subtech-blue md:px-7 md:py-4">
              entrar al sistema
            </Link>
            <a href="#plataforma" className="rounded-full border border-subtech-yellow/35 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-subtech-yellow transition hover:-translate-y-0.5 hover:bg-subtech-yellow/10 md:px-7 md:py-4">
              agenda una reunión
            </a>
          </div>

          <div data-reveal-hero className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 text-right md:block">
            <div className="mb-8">
              <p className="text-6xl font-semibold tracking-[-0.05em]">24/7</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">operación continua</p>
            </div>
            <div className="mb-8">
              <p className="text-6xl font-semibold tracking-[-0.05em]">30</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">activos monitoreados</p>
            </div>
            <div>
              <p className="text-6xl font-semibold tracking-[-0.05em]">+1.700m</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">profundidad operativa</p>
            </div>
          </div>
        </div>
      </section>

      <section id="problema" className="bg-[#f4f8fb] px-4 py-20 text-[#0a1628] md:px-10 lg:py-24">
        <div className="mx-auto max-w-[1280px]">
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-subtech-blue">
              La realidad subterránea
            </p>
            <h2 className="text-4xl font-bold leading-[1.04] tracking-[-0.04em] md:text-5xl">
              El problema de no tener visibilidad.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Estos son dolores diarios en interior mina: tiempo perdido, incertidumbre operacional y responsabilidad sin datos confiables.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {painPoints.map((point) => (
              <PainPointCard key={point.title} point={point} />
            ))}
          </div>
        </div>
      </section>

      <DemoInteractiva />

      <section id="tecnologia" className="border-y border-subtech-blue/10 bg-[#07101f]/80 px-4 py-24 md:px-10 lg:py-32">
        <div className="mx-auto max-w-[1180px]">
          <SectionTitle
            eyebrow="Capacidades del sistema"
            title="Tecnologia que funciona donde otros no llegan"
            lead="Infraestructura de red propia, porticos TAG robustos y plataforma web para visualizar activos en tiempo real bajo tierra."
          />
          <div className="mt-12 grid overflow-hidden rounded-2xl border border-subtech-blue/10 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.number} data-reveal className="group border-b border-r border-subtech-blue/10 bg-[#070d1a] p-7 transition hover:bg-subtech-dark-blue/15">
                <p className="text-5xl font-bold tracking-[-0.06em] text-subtech-blue/10 transition group-hover:text-subtech-blue/20">{feature.number}</p>
                <h3 className="mt-6 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-subtech-light-blue/55" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  {feature.body}
                </p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-subtech-yellow">{feature.accent}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="red" className="mx-auto max-w-[1180px] px-4 py-24 md:px-10 lg:py-32">
        <SectionTitle
          eyebrow="Infraestructura de red · Interior mina"
          title="La red que hace posible el sistema"
          lead="Instalación de red inalámbrica propia en el interior de la mina, diseñada para operar bajo tierra donde ninguna infraestructura estándar funciona. La conectividad que hace posible el monitoreo en tiempo real."
        />
        <div data-reveal className="mt-10 overflow-hidden rounded-xl border border-subtech-blue/15 bg-black shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
          <div className="relative flex min-h-[360px] items-end justify-between overflow-hidden bg-black p-6 md:min-h-[520px]">
            <Image
              src="/instalacion-wifi.jpg"
              alt="Instalación de red Wi-Fi propietaria en interior mina"
              fill
              className="object-cover opacity-80"
              sizes="(min-width: 1180px) 1180px, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
            <p className="relative z-10 max-w-xs text-sm leading-6 text-white/80" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Instalación de red Wi-Fi propietaria en interior mina · Mina Don Jaime
            </p>
            <div className="relative z-10 flex items-center gap-2 rounded-xl border border-subtech-yellow/25 bg-subtech-yellow/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-subtech-yellow backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              instalación en faena
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div data-reveal className="group relative overflow-hidden rounded-2xl border border-subtech-yellow/15 bg-[linear-gradient(135deg,rgba(255,241,156,0.12),rgba(38,82,145,0.16)_38%,rgba(7,18,37,0.96))] p-7 transition duration-300 hover:-translate-y-1 hover:border-subtech-yellow/35 hover:shadow-[0_24px_70px_rgba(255,241,156,0.08)]">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-subtech-yellow/10 blur-3xl transition group-hover:bg-subtech-yellow/20" />
            <div className="relative flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtech-yellow/75">Arquitectura escalable</p>
                <Image src="/icono-arquitectura.svg" alt="" width={88} height={88} className="mt-5 h-20 w-20 text-subtech-yellow" />
              </div>
              <div className="rounded-full border border-subtech-yellow/20 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-subtech-yellow">
                modular
              </div>
            </div>
            <div className="relative mt-8 h-px bg-gradient-to-r from-subtech-yellow/45 via-subtech-blue/25 to-transparent" />
            <p className="relative mt-5 text-sm leading-7 text-subtech-light-blue/72" style={{ fontFamily: "var(--font-dm-sans)" }}>
              El sistema crece con la operación sin rediseñar la arquitectura base: más pórticos, más cobertura, misma lógica operacional.
            </p>
          </div>
          <div data-reveal className="group relative overflow-hidden rounded-2xl border border-subtech-light-blue/15 bg-[linear-gradient(135deg,rgba(111,176,226,0.14),rgba(38,82,145,0.18)_42%,rgba(7,18,37,0.96))] p-7 transition duration-300 hover:-translate-y-1 hover:border-subtech-light-blue/35 hover:shadow-[0_24px_70px_rgba(111,176,226,0.1)]">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-subtech-light-blue/10 blur-3xl transition group-hover:bg-subtech-light-blue/20" />
            <div className="relative flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtech-light-blue/70">Red propietaria</p>
                <Image src="/icono-wifi-red.svg" alt="" width={88} height={88} className="mt-5 h-20 w-20 text-subtech-light-blue" />
              </div>
              <div className="rounded-full border border-subtech-light-blue/20 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-subtech-light-blue">
                interior mina
              </div>
            </div>
            <div className="relative mt-8 h-px bg-gradient-to-r from-subtech-light-blue/45 via-subtech-blue/25 to-transparent" />
            <p className="relative mt-5 text-sm leading-7 text-subtech-light-blue/72" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Infraestructura de conectividad instalada y mantenida por Subtech para operar bajo tierra donde la red estándar no llega.
            </p>
          </div>
        </div>
      </section>

      <section id="plataforma" className="relative overflow-hidden px-4 py-24 md:px-10 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_48%,rgba(111,176,226,0.18),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <SectionTitle
              eyebrow="Plataforma en produccion"
              title="El sistema que ya funciona hoy"
              lead="No es un prototipo: es una plataforma con datos reales, porticos operativos e historial de movimiento para maquinaria, vehiculos y personal."
            />
            <div className="mt-8 grid gap-3 text-sm text-subtech-light-blue/65" style={{ fontFamily: "var(--font-dm-sans)" }}>
              <div className="flex items-center gap-3 rounded-xl border border-subtech-blue/10 bg-subtech-blue/5 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-subtech-yellow" />
                Plano de mina con ubicación de activos en tiempo real.
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-subtech-blue/10 bg-subtech-blue/5 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-subtech-light-blue" />
                Historial de movimiento por pórticos, niveles y usuarios.
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-subtech-blue/10 bg-subtech-blue/5 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-subtech-blue" />
                Acceso web desde superficie para operación y gestión.
              </div>
            </div>
          </div>

          <div data-reveal className="relative">
            <div className="absolute inset-x-8 bottom-4 h-24 rounded-full bg-subtech-blue/25 blur-3xl" />
            <Image
              src="/mockup-web-1.png"
              alt="Mockup de la plataforma web Subtech"
              width={1027}
              height={787}
              className="relative z-10 w-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.45)]"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          </div>
        </div>
      </section>

      <ValorOperacional />

      <section className="mx-auto max-w-[1180px] px-4 py-24 md:px-10 lg:py-32">
        <SectionTitle eyebrow="Validacion de mercado" title="Lo dice quien opera la mina" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.author} data-reveal className="rounded-2xl border border-subtech-blue/10 bg-[#070d1a] p-7">
              <p className="text-base italic leading-8 text-subtech-light-blue/70" style={{ fontFamily: "var(--font-dm-sans)" }}>
                &quot;{testimonial.quote}&quot;
              </p>
              <p className="mt-6 font-semibold text-white">{testimonial.author}</p>
              <p className="mt-1 text-sm text-subtech-light-blue/45">{testimonial.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-28 text-center md:px-10 lg:py-36">
        <Image
          src="/INSP3.jpg"
          alt="Interior mina Subtech"
          fill
          className="object-cover opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(38,82,145,0.34),transparent_42%),linear-gradient(180deg,#020611_0%,rgba(2,6,17,0.55)_35%,rgba(2,6,17,0.62)_65%,#020611_100%)]" />
        <div className="relative mx-auto max-w-3xl">
          <p data-reveal className="mx-auto mb-7 w-fit rounded-xl border border-subtech-yellow/25 bg-subtech-yellow/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-subtech-yellow">
            Sistema listo para operar
          </p>
          <h2 data-reveal className="text-5xl font-bold leading-[1.02] tracking-[-0.05em] text-white md:text-7xl">
            El subsuelo chileno espera ser digitalizado
          </h2>
          <p data-reveal className="mx-auto mt-6 max-w-2xl text-base leading-8 text-subtech-light-blue/60" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Tecnologia validada, cliente real y modelo operacional probado para escalar la trazabilidad subterranea.
          </p>
          <div data-reveal className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/login" className="rounded-full border border-subtech-blue bg-subtech-dark-blue px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-subtech-blue">
              ir al login
            </Link>
            <a href="mailto:christian@subtechsolutions.cl" className="rounded-full border border-subtech-yellow/35 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-subtech-yellow transition hover:bg-subtech-yellow/10">
              agendar reunion
            </a>
          </div>
        </div>
      </section>

      </ScrollReveal>

      <footer className="border-t border-subtech-blue/10 bg-black/70 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-[1180px] text-center text-sm text-subtech-light-blue/45">
          <p>Subtech Solutions &copy; 2026</p>
        </div>
      </footer>
    </main>
  );
}
