"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-4 py-4 md:px-10">
      {/* Desktop navbar */}
      <div className="hidden items-center justify-between gap-4 md:flex">
        <Link
          href="/"
          aria-label="Subtech Solutions"
          className="flex items-center rounded-full border border-white/10 bg-black/70 px-4 py-2 backdrop-blur-xl"
        >
          <Image src="/SS_LOGO_COLOR_H.png" alt="Subtech Solutions" width={168} height={44} priority className="h-8 w-auto" />
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/65 p-1 backdrop-blur-xl">
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
      </div>

      {/* Mobile navbar */}
      <div className="flex items-center justify-end md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="absolute left-4 right-4 top-20 rounded-2xl border border-white/10 bg-black/90 p-6 backdrop-blur-xl md:hidden">
          <div className="mb-6 flex justify-center">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Image src="/SS_LOGO_COLOR_H.png" alt="Subtech Solutions" width={168} height={44} className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/#problema" onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">qué resolvemos</Link>
            <Link href="/#tecnologia" onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">tecnología</Link>
            <Link href="/#red" onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">red interior mina</Link>
            <Link href="/#plataforma" onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">plataforma web</Link>
            <Link href="/nosotros" onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">nosotros</Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-subtech-light-blue"
            >
              login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
