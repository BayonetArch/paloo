/** Inline SVG icons, sized by the class name the caller passes in. */

type IconProps = {
  className?: string;
};

function base(className?: string) {
  return {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function PeopleIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M9 11.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" />
      <path d="M3 19.5c0-2.8 2.7-4.75 6-4.75s6 1.95 6 4.75" />
      <path d="M16 6.2a3.25 3.25 0 0 1 0 6.1" />
      <path d="M17.5 14.9c2.1.45 3.5 2 3.5 4.6" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6.5 10a5.5 5.5 0 1 1 11 0c0 3 1 4.5 2 5.5H4.5c1-1 2-2.5 2-5.5Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function DeskIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 9.5h18" />
      <path d="M4.5 9.5V19h15V9.5" />
      <path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3h-15Z" />
      <path d="M9 13.5h6" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4.5 12h15" />
      <path d="M13.5 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6.5 6.5l11 11" />
      <path d="M17.5 6.5l-11 11" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6.5 9.5l5.5 5 5.5-5" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M13 3.5 5.5 13.5H11l-1 7 7.5-10H12l1-7Z" />
    </svg>
  );
}

export function RestartIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5" />
      <path d="M19.5 4.5V9H15" />
    </svg>
  );
}

export function SkipIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 6l8 6-8 6Z" />
      <path d="M17 6v12" />
    </svg>
  );
}
