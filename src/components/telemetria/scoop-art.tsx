/**
 * Silueta vectorial de un LHD (scoop) de interior mina.
 *
 * Es el respaldo de MACHINE_ART: un equipo sin foto cargada igual muestra una carta
 * presentable, en vez de un rectángulo vacío.
 */
export function ScoopArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 100"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* balde */}
      <path
        d="M4 74 L10 48 L56 44 L62 70 L34 82 Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* brazo */}
      <path
        d="M52 48 L96 36 L104 46 L58 60 Z"
        fill="currentColor"
        opacity="0.6"
      />
      {/* chasis */}
      <path
        d="M78 44 Q78 38 86 38 L176 38 Q186 38 186 48 L186 70 Q186 76 178 76 L86 76 Q78 76 78 70 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* cabina */}
      <path
        d="M112 40 L118 20 L146 20 L150 40 Z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* ruedas */}
      <circle cx="98" cy="74" r="17" fill="currentColor" />
      <circle cx="166" cy="74" r="17" fill="currentColor" />
      <circle cx="98" cy="74" r="7" fill="currentColor" opacity="0.35" />
      <circle cx="166" cy="74" r="7" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
