type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  className?: string;
  withGlow?: boolean;
}

const sizeStyles: Record<LogoSize, { text: string; or: string }> = {
  sm: { text: "text-xl", or: "text-[0.5em] mx-1" },
  md: { text: "text-3xl md:text-4xl", or: "text-[0.5em] mx-2" },
  lg: { text: "text-5xl md:text-7xl", or: "text-[0.5em] mx-2" },
  xl: {
    text: "text-[clamp(4rem,15vw,12rem)] leading-[0.85]",
    or: "text-[0.5em] mx-2 md:mx-4",
  },
};

export function Logo({ size = "md", className = "", withGlow = false }: LogoProps) {
  const styles = sizeStyles[size];

  return (
    <span
      className={`font-display ${styles.text} text-white uppercase tracking-tight ${withGlow ? "text-shadow-title" : ""} ${className}`}
    >
      Soup
      <span
        className={`text-gold-500 ${styles.or} align-middle ${withGlow ? "text-shadow-gold-glow" : ""}`}
      >
        or
      </span>
      Bowl
    </span>
  );
}
