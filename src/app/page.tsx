"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, saveToken, type AuthError } from "@/lib/auth";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { accessToken } = await login(email, password);
      saveToken(accessToken);
      router.push("/dashboard");
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — Brand */}
      <div className="relative hidden w-[52%] overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center"
        style={{
          background: "linear-gradient(145deg, #1a3f73 0%, #265291 40%, #2d5fa6 70%, #3468b0 100%)",
        }}
      >
        {/* Noise texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* Geometric floating shapes */}
        <div className="pointer-events-none absolute inset-0">
          {/* Large pentagon — top right */}
          <div
            className="animate-float-slow absolute right-[8%] top-[12%] h-28 w-28 opacity-[0.07]"
            style={{
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
              background: "#B6E2FF",
            }}
          />
          {/* Small diamond — bottom left */}
          <div
            className="animate-float-medium absolute bottom-[18%] left-[12%] h-16 w-16 opacity-[0.08]"
            style={{
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background: "#FFF19C",
            }}
          />
          {/* Thin chevron — mid left */}
          <div
            className="animate-float-fast absolute left-[6%] top-[35%] h-20 w-20 opacity-[0.06]"
            style={{
              clipPath: "polygon(0% 0%, 60% 50%, 0% 100%, 15% 50%)",
              background: "#B6E2FF",
            }}
          />
          {/* Triangle — bottom right */}
          <div
            className="animate-float-medium absolute bottom-[25%] right-[15%] h-14 w-14 opacity-[0.05]"
            style={{
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              background: "#6FB0E2",
            }}
          />
          {/* Hexagon — top left */}
          <div
            className="animate-float-slow absolute left-[18%] top-[8%] h-10 w-10 opacity-[0.07]"
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              background: "#F3FFFF",
            }}
          />
          {/* Accent line — diagonal */}
          <div
            className="animate-float-fast absolute right-[30%] top-[60%] h-px w-32 origin-center rotate-[-25deg] opacity-[0.1]"
            style={{ background: "linear-gradient(90deg, transparent, #B6E2FF, transparent)" }}
          />
          {/* Small dot cluster */}
          <div className="animate-float-medium absolute bottom-[40%] left-[30%] flex gap-2 opacity-[0.08]">
            <div className="h-2 w-2 rounded-full bg-subtech-light-blue" />
            <div className="h-1.5 w-1.5 rounded-full bg-subtech-yellow" />
            <div className="h-2.5 w-2.5 rounded-full bg-subtech-ice" />
          </div>
        </div>

        {/* Logo + tagline */}
        <div className="animate-scale-in relative z-10 flex flex-col items-center gap-10 px-12 opacity-0">
          <Image
            src="/SS_LOGO_WHITE_H.png"
            alt="Subtech Solutions"
            width={380}
            height={120}
            priority
            className="drop-shadow-2xl"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="h-px w-16 bg-subtech-light-blue/30" />
            <p
              className="text-center text-base tracking-[0.25em] font-medium uppercase"
              style={{ color: "rgba(182, 226, 255, 0.6)", fontFamily: "var(--font-dm-sans)" }}
            >
              Plataforma de monitoreo
            </p>
          </div>
        </div>

        {/* Bottom edge accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #265291, #6FB0E2, #FFF19C, #6FB0E2, #265291)" }} />
      </div>

      {/* Right panel — Login form */}
      <div className="relative flex flex-1 items-center justify-center bg-subtech-ice px-6 py-12 lg:px-16">
        {/* Subtle background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(38,82,145,0.04) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-10 flex justify-center lg:hidden">
            <Image
              src="/SS_LOGO_WHITE_H.png"
              alt="Subtech Solutions"
              width={240}
              height={75}
              priority
            />
          </div>

          {/* Header */}
          <div className="animate-slide-up mb-10 opacity-0">
            <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-subtech-dark-blue">
              Bienvenido
            </h1>
            <p className="mt-2 text-[0.94rem] text-subtech-dark-blue/70" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="animate-slide-up opacity-0 delay-100">
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-subtech-dark-blue/60"
              >
                Correo electrónico
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtech-blue/50 transition-colors group-focus-within:text-subtech-dark-blue">
                  <MailIcon />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@subtech.cl"
                  required
                  className="h-[52px] w-full rounded-xl border-2 border-subtech-light-blue/60 bg-white pl-11 pr-4 text-[0.94rem] text-subtech-dark-blue placeholder:text-subtech-dark-blue/65 transition-all duration-200 focus:border-subtech-dark-blue focus:shadow-[0_0_0_4px_rgba(38,82,145,0.08)]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="animate-slide-up opacity-0 delay-200">
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-subtech-dark-blue/60"
              >
                Contraseña
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtech-blue/50 transition-colors group-focus-within:text-subtech-dark-blue">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-[52px] w-full rounded-xl border-2 border-subtech-light-blue/60 bg-white pl-11 pr-12 text-[0.94rem] text-subtech-dark-blue placeholder:text-subtech-dark-blue/65 transition-all duration-200 focus:border-subtech-dark-blue focus:shadow-[0_0_0_4px_rgba(38,82,145,0.08)]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-subtech-blue/60 transition-colors hover:text-subtech-dark-blue"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="animate-slide-up flex items-center justify-between opacity-0 delay-300">
              <label className="flex cursor-pointer items-center gap-2.5 select-none">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="h-[18px] w-[18px] rounded-[5px] border-2 border-subtech-light-blue/70 bg-white transition-all peer-checked:border-subtech-dark-blue peer-checked:bg-subtech-dark-blue" />
                  <svg
                    className="absolute left-[3px] top-[3px] hidden h-3 w-3 text-white peer-checked:block"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </div>
                <span className="text-[0.82rem] text-subtech-dark-blue/70" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Recordarme
                </span>
              </label>
              <button
                type="button"
                className="text-[0.82rem] font-medium text-subtech-dark-blue/70 transition-colors hover:text-subtech-dark-blue"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Olvidé mi contraseña
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-[0.85rem] text-red-700" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  {error}
                </span>
              </div>
            )}

            {/* Submit */}
            <div className="animate-slide-up pt-1 opacity-0 delay-400">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-press group relative h-[52px] w-full cursor-pointer overflow-hidden rounded-xl bg-subtech-dark-blue font-semibold text-white shadow-lg shadow-subtech-dark-blue/20 transition-all duration-200 hover:shadow-xl hover:shadow-subtech-dark-blue/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {/* Yellow accent bar on hover */}
                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-subtech-yellow transition-all duration-300 group-hover:w-full" />
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Ingresando...</span>
                  </div>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="animate-slide-up mt-12 opacity-0 delay-500">
            <div className="h-px w-full bg-subtech-light-blue/40" />
            <p className="mt-4 text-center text-[0.78rem] text-subtech-dark-blue/50" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Subtech Solutions &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
