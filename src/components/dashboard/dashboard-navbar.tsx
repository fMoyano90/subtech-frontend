"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  SESSION_UPDATED_EVENT,
  getToken,
  getSessionUser,
  removeToken,
} from "@/lib/auth";

interface NavLink {
  href: string;
  label: string;
}

interface DashboardNavbarProps {
  title: string;
  links?: NavLink[];
  onLogout?: () => void;
}

function subscribeSessionToken(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(SESSION_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(SESSION_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSessionTokenSnapshot() {
  return getToken();
}

export function DashboardNavbar({ title, links, onLogout }: DashboardNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sessionToken = useSyncExternalStore(
    subscribeSessionToken,
    getSessionTokenSnapshot,
    () => null,
  );
  const sessionUser = useMemo(
    () => (sessionToken ? getSessionUser() : null),
    [sessionToken],
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = useCallback(() => {
    if (onLogout) {
      onLogout();
      return;
    }
    removeToken();
    router.replace("/");
  }, [onLogout, router]);

  const accountName = sessionUser?.name ?? "Mi cuenta";
  const accountOccupation = sessionUser?.occupation ?? "Usuario";
  const normalizedAccountName = accountName.trim();
  const accountInitial = normalizedAccountName
    ? normalizedAccountName[0].toUpperCase()
    : "U";

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

        {links ? (
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-[0.85rem] font-semibold transition-colors ${
                    isActive
                      ? "bg-subtech-dark-blue text-white"
                      : "text-subtech-dark-blue/60 hover:bg-subtech-ice hover:text-subtech-dark-blue"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ) : (
          <span className="text-[0.85rem] font-semibold text-subtech-dark-blue">
            {title}
          </span>
        )}
      </div>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-subtech-light-blue/55 bg-white px-2.5 py-1.5 text-subtech-dark-blue transition-colors hover:bg-subtech-ice"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-subtech-dark-blue text-[0.82rem] font-semibold text-white">
            {accountInitial}
          </span>
          <span className="hidden min-w-0 flex-col text-left sm:flex">
            <span className="max-w-[10rem] truncate text-[0.82rem] font-semibold text-subtech-dark-blue">
              {accountName}
            </span>
            <span
              className="max-w-[10rem] truncate text-[0.72rem] text-subtech-dark-blue/65"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {accountOccupation}
            </span>
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {menuOpen && (
          <div
            className="animate-fade-in absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-xl border border-subtech-light-blue/70 bg-white shadow-[0_10px_30px_rgba(38,82,145,0.12)]"
            role="menu"
          >
            <Link
              href="/perfil"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 border-b border-subtech-ice px-3.5 py-2.5 text-[0.82rem] font-medium text-subtech-dark-blue/85 transition-colors hover:bg-subtech-ice hover:text-subtech-dark-blue"
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
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Ver perfil
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-left text-[0.82rem] font-medium text-subtech-dark-blue/85 transition-colors hover:bg-subtech-ice hover:text-subtech-dark-blue"
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
          </div>
        )}
      </div>
    </nav>
  );
}
