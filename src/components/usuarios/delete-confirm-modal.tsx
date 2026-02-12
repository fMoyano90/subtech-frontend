"use client";

import { useState } from "react";

interface DeleteConfirmModalProps {
  open: boolean;
  userName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  open,
  userName,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleConfirm() {
    setError("");
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-base font-bold text-subtech-dark-blue">
          Eliminar Usuario
        </h2>
        <p
          className="mt-2 text-[0.82rem] text-subtech-dark-blue/80"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          ¿Estás seguro de que deseas eliminar a{" "}
          <span className="font-semibold">{userName}</span>? Esta acción no se
          puede deshacer.
        </p>

        {error && (
          <p
            className="mt-2 text-[0.78rem] text-red-500"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="cursor-pointer rounded-lg px-4 py-2 text-[0.8rem] font-medium text-subtech-dark-blue/70 transition-colors hover:bg-subtech-ice disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-[0.8rem] font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
