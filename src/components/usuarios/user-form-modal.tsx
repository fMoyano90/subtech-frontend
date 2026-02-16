"use client";

import { useState, useEffect } from "react";
import type { UserRow } from "./users-table";

interface UserFormModalProps {
  open: boolean;
  user: UserRow | null; // null = create mode
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => Promise<void>;
}

export function UserFormModal({
  open,
  user,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const isEdit = !!user;

  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rut, setRut] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCompany(user?.company ?? "");
      setName(user?.name ?? "");
      setEmail(user?.email ?? "");
      setRut(user?.rut ?? "");
      setPhone(user?.phone ?? "");
      setOccupation(user?.occupation ?? "");
      setRole(user?.role ?? "user");
      setPassword("");
      setError("");
    }
  }, [open, user]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data: Record<string, string> = {};
      if (!isEdit) {
        // Create: all fields required
        data.company = company;
        data.name = name;
        data.email = email;
        data.rut = rut;
        data.phone = phone;
        data.occupation = occupation;
        data.password = password;
      } else {
        // Edit: only changed fields
        if (company !== user!.company) data.company = company;
        if (name !== user!.name) data.name = name;
        if (phone !== user!.phone) data.phone = phone;
        if (occupation !== user!.occupation) data.occupation = occupation;
        if (role !== user!.role) data.role = role;
        if (password) data.password = password;
      }
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-base font-bold text-subtech-dark-blue">
          {isEdit ? "Editar Usuario" : "Crear Usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Company */}
          <div>
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
              Empresa
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="h-9 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/50 px-3 text-[0.8rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:shadow-[0_0_0_3px_rgba(38,82,145,0.06)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-9 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/50 px-3 text-[0.8rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:shadow-[0_0_0_3px_rgba(38,82,145,0.06)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={isEdit}
              className={`h-9 w-full rounded-lg border border-subtech-light-blue/50 px-3 text-[0.8rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:shadow-[0_0_0_3px_rgba(38,82,145,0.06)] ${
                isEdit
                  ? "cursor-not-allowed bg-subtech-ice/80 text-subtech-dark-blue/50"
                  : "bg-subtech-ice/50"
              }`}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          {/* RUT */}
          <div>
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
              RUT
            </label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              required
              readOnly={isEdit}
              className={`h-9 w-full rounded-lg border border-subtech-light-blue/50 px-3 text-[0.8rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:shadow-[0_0_0_3px_rgba(38,82,145,0.06)] ${
                isEdit
                  ? "cursor-not-allowed bg-subtech-ice/80 text-subtech-dark-blue/50"
                  : "bg-subtech-ice/50"
              }`}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
              Teléfono
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={!isEdit}
              className="h-9 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/50 px-3 text-[0.8rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:shadow-[0_0_0_3px_rgba(38,82,145,0.06)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          {/* Occupation */}
          <div>
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
              Cargo
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              required={!isEdit}
              className="h-9 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/50 px-3 text-[0.8rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:shadow-[0_0_0_3px_rgba(38,82,145,0.06)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          {/* Role (edit only) */}
          {isEdit && (
            <div>
              <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
                Rol
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/50 px-3 text-[0.8rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:shadow-[0_0_0_3px_rgba(38,82,145,0.06)]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <option value="user">Usuario</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
              Contraseña{isEdit ? " (dejar vacío para no cambiar)" : ""}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              minLength={6}
              className="h-9 w-full rounded-lg border border-subtech-light-blue/50 bg-subtech-ice/50 px-3 text-[0.8rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue focus:shadow-[0_0_0_3px_rgba(38,82,145,0.06)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          {error && (
            <p
              className="text-[0.78rem] text-red-500"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer rounded-lg px-4 py-2 text-[0.8rem] font-medium text-subtech-dark-blue/70 transition-colors hover:bg-subtech-ice disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-lg bg-subtech-dark-blue px-4 py-2 text-[0.8rem] font-medium text-white transition-colors hover:bg-subtech-dark-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {submitting
                ? "Guardando..."
                : isEdit
                  ? "Guardar Cambios"
                  : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
