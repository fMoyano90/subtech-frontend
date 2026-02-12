"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { UsersTable, type UserRow } from "@/components/usuarios/users-table";
import { UserFormModal } from "@/components/usuarios/user-form-modal";
import { DeleteConfirmModal } from "@/components/usuarios/delete-confirm-modal";
import { getToken, getTokenPayload } from "@/lib/auth";
import { getNavLinks } from "@/lib/nav-links";
import { fetchWithAuth } from "@/lib/api";

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const payload = useMemo(() => getTokenPayload(), []);
  const navLinks = useMemo(() => getNavLinks(payload?.role), [payload]);

  /* Modal state */
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await fetchWithAuth<UserRow[]>("/users");
      setUsers(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Auth + role guard */
  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }
    const p = getTokenPayload();
    if (p?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    void fetchUsers();
  }, [fetchUsers, router]);

  /* Create */
  function handleOpenCreate() {
    setEditingUser(null);
    setFormOpen(true);
  }

  /* Edit */
  function handleOpenEdit(user: UserRow) {
    setEditingUser(user);
    setFormOpen(true);
  }

  /* Delete */
  function handleOpenDelete(user: UserRow) {
    setDeletingUser(user);
  }

  /* Submit form (create or edit) */
  async function handleFormSubmit(data: Record<string, string>) {
    if (editingUser) {
      // Edit
      if (Object.keys(data).length === 0) {
        setFormOpen(false);
        return;
      }
      await fetchWithAuth(`/users/${editingUser.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      // Create
      await fetchWithAuth("/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }
    setFormOpen(false);
    await fetchUsers();
  }

  /* Confirm delete */
  async function handleDeleteConfirm() {
    if (!deletingUser) return;
    await fetchWithAuth(`/users/${deletingUser.id}`, { method: "DELETE" });
    setDeletingUser(null);
    await fetchUsers();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-subtech-ice">
      <DashboardNavbar title="Usuarios" links={navLinks} />

      <main className="relative flex-1 overflow-y-auto p-6">
        {/* Dot pattern bg */}
        <div
          className="pointer-events-none fixed inset-0 top-14 z-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(38,82,145,0.04) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10">
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-white/70"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-white">
              <div className="text-center">
                <p className="font-semibold text-red-500">
                  Error al cargar datos
                </p>
                <p
                  className="mt-1 text-sm text-subtech-dark-blue/65"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {error}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Page header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-subtech-dark-blue">
                    Gestión de Usuarios
                  </h1>
                  <p
                    className="mt-0.5 text-[0.82rem] text-subtech-dark-blue/85"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    Administra los usuarios de tu empresa
                  </p>
                </div>
                <button
                  onClick={handleOpenCreate}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-subtech-dark-blue px-4 py-2 text-[0.8rem] font-medium text-white transition-colors hover:bg-subtech-dark-blue/90"
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Crear Usuario
                </button>
              </div>

              {/* Table */}
              <div className="animate-slide-up opacity-0">
                <UsersTable
                  users={users}
                  currentUserId={payload?.sub ?? ""}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <UserFormModal
        open={formOpen}
        user={editingUser}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <DeleteConfirmModal
        open={!!deletingUser}
        userName={deletingUser?.name ?? ""}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
