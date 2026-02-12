export interface NavLink {
  href: string;
  label: string;
}

const BASE_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plano", label: "Plano" },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/usuarios", label: "Usuarios" },
];

export function getNavLinks(role?: string): NavLink[] {
  if (role === "admin") return [...BASE_LINKS, ...ADMIN_LINKS];
  return BASE_LINKS;
}
