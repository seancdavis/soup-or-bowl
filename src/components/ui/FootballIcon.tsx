interface FootballIconProps {
  className?: string;
}

export function FootballIcon({ className = "w-4 h-4" }: FootballIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Football shape - tilted oval */}
      <ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)" />
      {/* Laces */}
      <line x1="12" y1="8" x2="12" y2="16" transform="rotate(-45 12 12)" />
      <line x1="10" y1="10" x2="14" y2="10" transform="rotate(-45 12 12)" />
      <line x1="10" y1="12" x2="14" y2="12" transform="rotate(-45 12 12)" />
      <line x1="10" y1="14" x2="14" y2="14" transform="rotate(-45 12 12)" />
    </svg>
  );
}
