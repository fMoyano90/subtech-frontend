/** Íconos de 14px para las tarjetas de resumen. Trazo, sin relleno, heredan currentColor. */

interface IconProps {
  size?: number;
}

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export function ClockIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function PulseIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
  );
}

export function EngineIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 21a9 9 0 1 1 9-9" />
      <path d="M12 12l5-3" />
    </svg>
  );
}

export function FuelIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9Z" />
    </svg>
  );
}

export function LoadIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </svg>
  );
}

export function SpeedIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 18l4-5" />
    </svg>
  );
}
