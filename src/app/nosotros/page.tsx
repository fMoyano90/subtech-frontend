import Image from "next/image";
import Link from "next/link";

const team = [
  {
    initials: "CS",
    name: "Christian Solar Arenas",
    role: "CEO & Founder",
    bio: "Ingeniero Civil de Minas. Fundo Subtech desde su tesis universitaria y lidera la vision tecnologica, clientes y crecimiento.",
  },
  {
    initials: "FM",
    name: "Felipe Moyano",
    role: "CTO & Socio",
    bio: "Responsable de la arquitectura tecnologica, desarrollo de plataforma y escalabilidad del producto para nuevas faenas.",
  },
  {
    initials: "AR",
    name: "Andres Rojas",
    role: "Product Owner & Socio",
    bio: "Responsable de traducir necesidades operacionales en producto y priorizar funcionalidades con impacto en faena.",
  },
];

function SectionTitle({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="max-w-2xl">
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

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-[#020611] text-white">
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-4 px-4 py-4 md:px-10">
        <Link
          href="/"
          aria-label="Subtech Solutions"
          className="flex items-center rounded-full border border-white/10 bg-black/70 px-4 py-2 backdrop-blur-xl"
        >
          <Image src="/SS_LOGO_COLOR_H.png" alt="Subtech Solutions" width={168} height={44} priority className="h-8 w-auto" />
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/65 p-1 backdrop-blur-xl md:flex">
          <Link href="/#problema" className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:text-white">qué resolvemos</Link>
          <Link href="/#tecnologia" className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:text-white">tecnología</Link>
          <Link href="/#red" className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:text-white">red interior mina</Link>
          <Link href="/#plataforma" className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:text-white">plataforma web</Link>
          <Link href="/nosotros" className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:text-white">nosotros</Link>
        </div>

        <Link
          href="/login"
          className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-subtech-light-blue"
        >
          login
        </Link>
      </nav>

      <section className="relative overflow-hidden px-4 pt-32 pb-20 md:px-10 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(38,82,145,0.5),transparent_28%),radial-gradient(circle_at_78%_40%,rgba(111,176,226,0.16),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(111,176,226,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(111,176,226,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.92fr_0.58fr] lg:items-end">
          <div>
            <p className="mb-5 w-fit rounded-full border border-subtech-yellow/25 bg-subtech-yellow/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-subtech-yellow">
              Quiénes somos
            </p>
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.06em] text-white md:text-7xl">
              Ingenieria minera convertida en tecnologia operativa.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-9 text-subtech-light-blue/65" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Somos Subtech Solutions: un equipo técnico que nació para resolver un problema real de la mineria subterranea: saber dónde están las personas, equipos y activos cuando el GPS y el Wifi no existe.
            </p>
          </div>
          <div className="rounded-3xl border border-subtech-blue/15 bg-[#08101f]/85 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-subtech-blue/10 bg-subtech-blue/5 p-5">
                <p className="text-4xl font-bold tracking-[-0.05em] text-subtech-yellow">TRL 7-8</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-subtech-light-blue/45">Tecnologia validada</p>
              </div>
              <div className="rounded-2xl border border-subtech-blue/10 bg-subtech-blue/5 p-5">
                <p className="text-4xl font-bold tracking-[-0.05em] text-white">2024</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-subtech-light-blue/45">Operacion comercial</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-subtech-blue/10 bg-subtech-blue/5 p-5">
                <p className="text-sm leading-7 text-subtech-light-blue/65" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Trabajamos con operaciones mineras reales, datos reales y despliegue en interior mina. Nuestro foco es que la digitalizacion sea práctica, instalable y útil para la operación diaria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-12 px-4 py-24 md:grid-cols-[0.9fr_1.1fr] md:px-10 lg:py-32">
        <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-subtech-blue/15 bg-[#08101f] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <Image
            src="/Instalación 1.jpg"
            alt="Instalación del sistema Subtech en interior mina"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover brightness-105 contrast-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,17,0.1),rgba(2,6,17,0.68)),linear-gradient(135deg,rgba(38,82,145,0.24),rgba(0,0,0,0.08))]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="rounded-sm border border-subtech-yellow/25 bg-subtech-yellow/10 px-4 py-3 text-sm font-semibold text-subtech-yellow w-fit">
              Inicio operacion comercial - 2024
            </div>
            <div>
              <p className="text-7xl font-bold tracking-[-0.06em] text-white">1 - 4</p>
              <p className="mt-3 max-w-xs text-sm uppercase tracking-[0.14em] text-subtech-light-blue/55">de primer portico piloto a red operacional en mina</p>
            </div>
          </div>
        </div>
        <div className="self-center">
          <SectionTitle
            eyebrow="Nuestra historia"
            title="Nacio en una tesis. Vive en la mina."
            lead="Subtech Solutions SpA surgio de investigacion universitaria con un proposito claro: llevar georeferenciacion subterranea a la mineria mediana a un costo accesible."
          />
          <p className="mt-6 text-base leading-8 text-subtech-light-blue/55" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Hoy opera en Mina Don Jaime de Compania Minera La Patagua, con sistema validado, contratos vigentes y una hoja de ruta clara para escalar a nuevas faenas.
          </p>
          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.16em] text-subtech-light-blue/45">
              <span>Madurez tecnologica</span>
              <span className="text-subtech-yellow">TRL 7-8 alcanzado</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-subtech-blue/10">
              <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-subtech-dark-blue to-subtech-yellow" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#08101f]/80 px-4 py-24 md:px-10 lg:py-32">
        <div className="mx-auto max-w-[1180px]">
          <SectionTitle eyebrow="Mina Don Jaime · Bocamina Cota 840" title="El primer pórtico. El primer hito." />
          <div className="mt-12 grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-base leading-8 text-subtech-light-blue/60" style={{ fontFamily: "var(--font-dm-sans)" }}>
                La instalación del primer pórtico de georeferenciación en la bocamina marcó el inicio de la operación comercial. Un sistema que nació como tesis universitaria, hoy detecta en tiempo real cada activo que cruza el umbral de la mina.
              </p>
              <p className="mt-4 text-sm leading-7 text-subtech-light-blue/50" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Desde ese primer pórtico piloto, el sistema escaló a 4 puntos de control, cubriendo los accesos principales y cruces críticos de la operación.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-subtech-blue/10 bg-subtech-blue/5 p-4">
                  <p className="text-2xl font-bold text-subtech-yellow">1→4</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-subtech-light-blue/45">Pórticos instalados</p>
                </div>
                <div className="rounded-lg border border-subtech-blue/10 bg-subtech-blue/5 p-4">
                  <p className="text-2xl font-bold text-subtech-yellow">Cota 840</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-subtech-light-blue/45">Bocamina principal</p>
                </div>
                <div className="rounded-lg border border-subtech-blue/10 bg-subtech-blue/5 p-4">
                  <p className="text-2xl font-bold text-subtech-yellow">3</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-subtech-light-blue/45">Niveles monitoreados</p>
                </div>
                <div className="rounded-lg border border-subtech-blue/10 bg-subtech-blue/5 p-4">
                  <p className="text-2xl font-bold text-subtech-yellow">24/7</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-subtech-light-blue/45">Operación continua</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-subtech-blue/10">
              <Image
                src="/entrada-mina.jpg"
                alt="Primer pórtico instalado en Bocamina Cota 840"
                width={640}
                height={420}
                className="w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                <p className="text-xs text-white/70" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Primer pórtico instalado · Bocamina Cota 840 · Mina Don Jaime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="equipo" className="border-y border-subtech-blue/10 bg-[#07101f]/80 px-4 py-24 md:px-10 lg:py-32">
        <div className="mx-auto max-w-[1180px]">
          <SectionTitle
            eyebrow="El equipo"
            title="Quienes estan detras del sistema"
            lead="Un equipo fundado desde la ingenieria, con experiencia directa en faena y foco en digitalizacion minera."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <article key={member.name} className="rounded-2xl border border-subtech-blue/15 bg-[#08101f] p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-subtech-dark-blue to-subtech-blue text-xl font-bold text-white">
                  {member.initials}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{member.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-subtech-yellow">{member.role}</p>
                <p className="mt-5 text-sm leading-7 text-subtech-light-blue/55" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  {member.bio}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-24 text-center md:px-10 lg:py-32">
        <Image
          src="/Bocamina_MDJ_CSA.jpg"
          alt="Bocamina Mina Don Jaime"
          fill
          className="object-cover object-[center_58%] opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(38,82,145,0.32),transparent_44%),linear-gradient(180deg,#020611_0%,rgba(2,6,17,0.58)_36%,rgba(2,6,17,0.66)_70%,#020611_100%)]" />
        <div className="relative mx-auto max-w-3xl">
          <p className="mx-auto mb-7 w-fit rounded-xl border border-subtech-yellow/25 bg-subtech-yellow/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-subtech-yellow">
            Hablemos de tu operación
          </p>
          <h2 className="text-5xl font-bold leading-[1.02] tracking-[-0.05em] text-white md:text-7xl">
            Si quieren conversar con nosotros, agendemos una reunión.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-subtech-light-blue/60" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Podemos revisar su caso, entender los puntos críticos de la faena y evaluar cómo llevar trazabilidad operacional al interior mina.
          </p>
          <div className="mt-10 flex justify-center">
            <a href="mailto:christian@subtechsolutions.cl" className="rounded-full border border-subtech-yellow/35 bg-subtech-yellow/10 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-subtech-yellow transition hover:bg-subtech-yellow/20">
              agendar reunión
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-subtech-blue/10 bg-black/70 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-[1180px] text-center text-sm text-subtech-light-blue/45">
          <p>Subtech Solutions &copy; 2026</p>
        </div>
      </footer>
    </main>
  );
}
