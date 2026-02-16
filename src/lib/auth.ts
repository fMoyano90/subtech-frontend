const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
export const SESSION_UPDATED_EVENT = "subtech-session-updated";

export interface LoginResponse {
  accessToken: string;
}

export interface AuthError {
  message: string;
  statusCode: number;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.message ?? (res.status === 401
        ? "Credenciales inválidas"
        : "Error al iniciar sesión");
    const error: AuthError = { message, statusCode: res.status };
    throw error;
  }

  return res.json();
}

const TOKEN_KEY = "subtech_token";

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

export interface TokenPayload {
  sub: string;
  email: string;
  businessId: string;
  role: "admin" | "user";
  name?: string;
  occupation?: string;
  phone?: string;
}

export function getTokenPayload(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export interface SessionUser {
  id: string;
  businessId: string;
  role: "admin" | "user";
  name: string;
  occupation: string;
  email: string;
  phone: string;
}

export function getSessionUser(): SessionUser | null {
  const payload = getTokenPayload();
  if (!payload) return null;

  const roleLabel = payload.role === "admin" ? "Administrador" : "Usuario";

  return {
    id: payload.sub,
    businessId: payload.businessId,
    role: payload.role,
    name: payload.name?.trim() || payload.email,
    occupation: payload.occupation?.trim() || roleLabel,
    email: payload.email,
    phone: payload.phone?.trim() || "No registrado",
  };
}
