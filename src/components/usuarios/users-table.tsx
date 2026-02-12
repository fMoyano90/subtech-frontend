"use client";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  rut: string;
  phone: string;
  occupation: string;
  role: "admin" | "user";
}

interface UsersTableProps {
  users: UserRow[];
  currentUserId: string;
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
}

export function UsersTable({
  users,
  currentUserId,
  onEdit,
  onDelete,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-white">
        <p
          className="text-sm text-subtech-dark-blue/60"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          No hay usuarios registrados
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(38,82,145,0.07)]">
      <div className="overflow-x-auto">
        <table
          className="w-full text-left text-[0.8rem]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <thead>
            <tr className="border-b border-subtech-light-blue/40 text-[0.7rem] font-bold uppercase tracking-wider text-subtech-dark-blue/70">
              <th className="px-5 py-3 pr-4">Nombre</th>
              <th className="px-5 py-3 pr-4">Email</th>
              <th className="px-5 py-3 pr-4">RUT</th>
              <th className="px-5 py-3 pr-4">Teléfono</th>
              <th className="px-5 py-3 pr-4">Cargo</th>
              <th className="px-5 py-3 pr-4">Rol</th>
              <th className="px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-subtech-ice/80 transition-colors last:border-0 hover:bg-subtech-ice/50"
              >
                <td className="px-5 py-3 pr-4 font-medium text-subtech-dark-blue">
                  {user.name}
                </td>
                <td className="px-5 py-3 pr-4 text-subtech-dark-blue/80">
                  {user.email}
                </td>
                <td className="px-5 py-3 pr-4 tabular-nums text-subtech-dark-blue/80">
                  {user.rut}
                </td>
                <td className="px-5 py-3 pr-4 tabular-nums text-subtech-dark-blue/80">
                  {user.phone}
                </td>
                <td className="px-5 py-3 pr-4 text-subtech-dark-blue/80">
                  {user.occupation}
                </td>
                <td className="px-5 py-3 pr-4">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[0.7rem] font-medium ${
                      user.role === "admin"
                        ? "bg-subtech-dark-blue/10 text-subtech-dark-blue"
                        : "bg-subtech-blue/15 text-subtech-blue"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "Usuario"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="cursor-pointer rounded-lg p-1.5 text-subtech-dark-blue/60 transition-colors hover:bg-subtech-ice hover:text-subtech-dark-blue"
                      title="Editar"
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
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {user.id !== currentUserId && (
                      <button
                        onClick={() => onDelete(user)}
                        className="cursor-pointer rounded-lg p-1.5 text-subtech-dark-blue/60 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Eliminar"
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
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
