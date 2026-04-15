"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { getSessionUser, getToken, getTokenPayload } from "@/lib/auth";
import { getMyProfile, updateMyProfile, type ProfileUser } from "@/lib/profile";

interface FormStatus {
  type: "idle" | "success" | "error";
  message: string;
}

function roleLabel(role?: "admin" | "user"): string {
  if (role === "admin") return "Administrador";
  return "Usuario";
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const payload = useMemo(() => getTokenPayload(), []);
  const [sessionUser, setSessionUser] = useState(() => getSessionUser());
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactSaving, setContactSaving] = useState(false);
  const [contactStatus, setContactStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      const me = await getMyProfile();
      setProfile(me);
      setEmail(me.email);
      setPhone(me.phone ?? "");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }
    void loadProfile();
  }, [loadProfile, router]);

  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    setContactStatus({ type: "idle", message: "" });
    const nextEmail = email.trim();
    const nextPhone = phone.trim();

    if (nextEmail === profile.email && nextPhone === profile.phone) {
      setContactStatus({
        type: "success",
        message: "No hay cambios para guardar",
      });
      return;
    }

    setContactSaving(true);
    try {
      const updatedUser = await updateMyProfile({
        email: nextEmail,
        phone: nextPhone,
      });
      setProfile(updatedUser);
      setEmail(updatedUser.email);
      setPhone(updatedUser.phone);
      setSessionUser(getSessionUser());
      setContactStatus({
        type: "success",
        message: "Datos de contacto actualizados",
      });
    } catch (e) {
      setContactStatus({
        type: "error",
        message: e instanceof Error ? e.message : "Error desconocido",
      });
    } finally {
      setContactSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordStatus({ type: "idle", message: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "Completa todos los campos de contraseña",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "La confirmación no coincide con la nueva contraseña",
      });
      return;
    }

    setPasswordSaving(true);
    try {
      const updatedUser = await updateMyProfile({
        currentPassword,
        newPassword,
      });
      setProfile(updatedUser);
      setSessionUser(getSessionUser());
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({
        type: "success",
        message: "Contraseña actualizada correctamente",
      });
    } catch (e) {
      setPasswordStatus({
        type: "error",
        message: e instanceof Error ? e.message : "Error desconocido",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  const displayRole = roleLabel(sessionUser?.role ?? payload?.role);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-subtech-ice">
      <DashboardNavbar title="Perfil" />

      <main className="relative flex-1 overflow-y-auto p-6">
        <div
          className="pointer-events-none fixed inset-0 top-14 z-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(38,82,145,0.04) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1050px]">
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-xl bg-white/70"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-white">
              <div className="text-center">
                <p className="font-semibold text-red-500">Error al cargar perfil</p>
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
              <div className="mb-6 animate-slide-up opacity-0">
                <h1 className="text-lg font-bold tracking-tight text-subtech-dark-blue">
                  Perfil de Usuario
                </h1>
                <p
                  className="mt-0.5 text-[0.82rem] text-subtech-dark-blue/85"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Revisa tus datos de sesión y administra tu información de
                  contacto y seguridad.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
                <section className="animate-slide-up rounded-xl bg-white p-5 opacity-0 shadow-[0_1px_4px_rgba(38,82,145,0.07)]">
                  <div className="mb-4 border-b border-subtech-light-blue/30 pb-3">
                    <h2 className="text-[0.83rem] font-bold uppercase tracking-[0.11em] text-subtech-dark-blue">
                      Datos en sesión
                    </h2>
                  </div>

                  <dl className="grid gap-3 text-[0.82rem] sm:grid-cols-2">
                    <div>
                      <dt className="text-subtech-dark-blue/55">Nombre</dt>
                      <dd className="mt-0.5 font-medium text-subtech-dark-blue">
                        {sessionUser?.name ?? profile?.name ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-subtech-dark-blue/55">Cargo</dt>
                      <dd className="mt-0.5 font-medium text-subtech-dark-blue">
                        {sessionUser?.occupation ?? profile?.occupation ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-subtech-dark-blue/55">Rol</dt>
                      <dd className="mt-0.5 font-medium text-subtech-dark-blue">
                        {displayRole}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-subtech-dark-blue/55">Correo</dt>
                      <dd className="mt-0.5 break-all font-medium text-subtech-dark-blue">
                        {sessionUser?.email ?? profile?.email ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-subtech-dark-blue/55">Teléfono</dt>
                      <dd className="mt-0.5 font-medium text-subtech-dark-blue">
                        {sessionUser?.phone ?? profile?.phone ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-subtech-dark-blue/55">RUT</dt>
                      <dd className="mt-0.5 font-medium text-subtech-dark-blue">
                        {profile?.rut ?? "-"}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="animate-slide-up rounded-xl bg-white p-5 opacity-0 shadow-[0_1px_4px_rgba(38,82,145,0.07)] delay-100">
                  <div className="mb-4 border-b border-subtech-light-blue/30 pb-3">
                    <h2 className="text-[0.83rem] font-bold uppercase tracking-[0.11em] text-subtech-dark-blue">
                      Datos de contacto
                    </h2>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <div>
                      <label
                        htmlFor="perfil-email"
                        className="mb-1 block text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-subtech-dark-blue/60"
                      >
                        Correo
                      </label>
                      <input
                        id="perfil-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 w-full rounded-lg border border-subtech-light-blue/70 bg-white px-3 text-[0.88rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="perfil-phone"
                        className="mb-1 block text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-subtech-dark-blue/60"
                      >
                        Teléfono
                      </label>
                      <input
                        id="perfil-phone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 w-full rounded-lg border border-subtech-light-blue/70 bg-white px-3 text-[0.88rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                        required
                      />
                    </div>

                    {contactStatus.type !== "idle" && (
                      <p
                        className={`text-[0.78rem] ${
                          contactStatus.type === "success"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {contactStatus.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={contactSaving}
                      className="btn-press mt-2 flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-subtech-dark-blue text-[0.82rem] font-semibold text-white transition-colors hover:bg-subtech-dark-blue/90 disabled:cursor-not-allowed disabled:opacity-70"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {contactSaving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </form>
                </section>
              </div>

              <section className="mt-5 animate-slide-up rounded-xl bg-white p-5 opacity-0 shadow-[0_1px_4px_rgba(38,82,145,0.07)] delay-200">
                <div className="mb-4 border-b border-subtech-light-blue/30 pb-3">
                  <h2 className="text-[0.83rem] font-bold uppercase tracking-[0.11em] text-subtech-dark-blue">
                    Cambio de contraseña
                  </h2>
                </div>

                <form
                  onSubmit={handlePasswordSubmit}
                  className="grid gap-3 md:grid-cols-3"
                >
                  <div>
                    <label
                      htmlFor="perfil-current-password"
                      className="mb-1 block text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-subtech-dark-blue/60"
                    >
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        id="perfil-current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-11 w-full rounded-lg border border-subtech-light-blue/70 bg-white px-3 pr-10 text-[0.88rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-subtech-dark-blue/40 hover:text-subtech-dark-blue/70"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showCurrentPassword} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="perfil-new-password"
                      className="mb-1 block text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-subtech-dark-blue/60"
                    >
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="perfil-new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-11 w-full rounded-lg border border-subtech-light-blue/70 bg-white px-3 pr-10 text-[0.88rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-subtech-dark-blue/40 hover:text-subtech-dark-blue/70"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showNewPassword} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="perfil-confirm-password"
                      className="mb-1 block text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-subtech-dark-blue/60"
                    >
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="perfil-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 w-full rounded-lg border border-subtech-light-blue/70 bg-white px-3 pr-10 text-[0.88rem] text-subtech-dark-blue transition-colors focus:border-subtech-dark-blue"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-subtech-dark-blue/40 hover:text-subtech-dark-blue/70"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showConfirmPassword} />
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    {passwordStatus.type !== "idle" && (
                      <p
                        className={`mb-2 text-[0.78rem] ${
                          passwordStatus.type === "success"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {passwordStatus.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="btn-press flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-subtech-dark-blue text-[0.82rem] font-semibold text-white transition-colors hover:bg-subtech-dark-blue/90 disabled:cursor-not-allowed disabled:opacity-70 md:w-[280px]"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {passwordSaving ? "Actualizando..." : "Cambiar contraseña"}
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
