import { getToken, removeToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchWithAuth<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();
  if (!token) {
    window.location.href = "/";
    throw new Error("Sin autenticación");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    removeToken();
    window.location.href = "/";
    throw new Error("Sesión expirada");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const rawMessage = body?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage[0]
      : typeof rawMessage === "string"
        ? rawMessage
        : `Error del servidor (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}
