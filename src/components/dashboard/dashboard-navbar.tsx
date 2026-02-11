"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { removeToken } from "@/lib/auth";

interface DashboardNavbarProps {
  title: string;
  onLogout?: () => void;
}

export function DashboardNavbar({ title, onLogout }: DashboardNavbarProps) {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    if (onLogout) {
      onLogout();
      return;
    }
    removeToken();
    router.replace("/");
  }, [onLogout, router]);

  return (
    <nav className="z-30 flex h-[4.5rem] shrink-0 items-center justify-between border-b border-[#265291]/10 bg-white px-5 shadow-[0_1px_4px_rgba(38,82,145,0.06)]">
      <div className="flex items-center gap-5">
        <Image
          src="/SS_LOGO_COLOR_H.png"
          alt="Subtech"
          width={130}
          height={38}
          priority
          className="shrink-0"
        />
        <div className="h-5 w-px bg-subtech-light-blue/50" />
        <span className="text-[0.85rem] font-semibold text-subtech-dark-blue">
          {title}
        </span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[0.8rem] font-medium text-subtech-dark-blue/75 transition-colors hover:bg-subtech-ice hover:text-subtech-dark-blue"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Cerrar sesión
      </button>
    </nav>
  );
}
