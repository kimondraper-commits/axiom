// Inline SVG icons for the maps tool rail. Stroke-based, single-color.
// Sized 18×18 by default; override via `size` prop.

interface IconProps {
  size?: number;
  className?: string;
}

const wrap = (size = 18, className = "") => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
});

export const IconLayers = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export const IconCube = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05" />
    <path d="M12 22.08V12" />
  </svg>
);

export const IconPencil = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const IconRuler = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <path d="M21.3 8.7l-6-6a1 1 0 0 0-1.4 0L2.7 14a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10a1 1 0 0 0 0-1.3z" />
    <path d="M7 17l-1.5-1.5" />
    <path d="M11 13l-1.5-1.5" />
    <path d="M15 9l-1.5-1.5" />
  </svg>
);

export const IconClock = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconGlobe = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const IconCamera = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const IconExpand = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

export const IconLine = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <line x1="5" y1="19" x2="19" y2="5" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="5" r="2" />
  </svg>
);

export const IconPolygon = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <polygon points="12 3 21 9 17 20 7 20 3 9 12 3" />
  </svg>
);

export const IconCircle = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export const IconTrash = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconClose = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconChevronRight = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconSearch = ({ size, className }: IconProps) => (
  <svg {...wrap(size, className)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
