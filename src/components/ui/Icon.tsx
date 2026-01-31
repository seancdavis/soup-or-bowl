type IconName = "trophy" | "warning" | "football";

interface IconProps {
  name: IconName;
  className?: string;
}

const icons: Record<IconName, JSX.Element> = {
  trophy: (
    <path d="M5 3h14c.55 0 1 .45 1 1v2c0 2.55-1.92 4.63-4.39 4.94.63 1.05 1.39 1.94 2.39 2.56V15h-4v2h2v2H8v-2h2v-2H6v-1.5c1-.62 1.76-1.51 2.39-2.56C5.92 10.63 4 8.55 4 6V4c0-.55.45-1 1-1zm1 3v2c0 1.38.81 2.56 2 3.07V9.5C6.81 9.27 6 8.38 6 7.38V6zm12 0v1.38c0 1-.81 1.89-2 2.12v1.57c1.19-.51 2-1.69 2-3.07V6z" />
  ),
  warning: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  ),
  football: (
    <path d="M20.31 3.69a2.5 2.5 0 00-3.54 0L3.69 16.77a2.5 2.5 0 000 3.54 2.5 2.5 0 003.54 0L20.31 7.23a2.5 2.5 0 000-3.54zM12 12l-1.5-1.5M15 9l-1.5-1.5M9 15l-1.5-1.5" />
  ),
};

const iconStyles: Record<IconName, { fill?: string; stroke?: string }> = {
  trophy: { fill: "currentColor" },
  warning: { fill: "none", stroke: "currentColor" },
  football: { fill: "none", stroke: "currentColor" },
};

export function Icon({ name, className = "w-6 h-6" }: IconProps) {
  const style = iconStyles[name];

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={style.fill || "none"}
      stroke={style.stroke}
      strokeWidth={style.stroke ? 2 : undefined}
    >
      {icons[name]}
    </svg>
  );
}
