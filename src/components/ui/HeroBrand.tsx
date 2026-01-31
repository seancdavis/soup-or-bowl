import { Trophy } from "lucide-react";
import { EventBadge } from "./EventBadge";
import { Logo } from "./Logo";
import { Divider } from "./Divider";

type HeroBrandSize = "sm" | "md" | "lg";

interface HeroBrandProps {
  size?: HeroBrandSize;
  showTrophy?: boolean;
  className?: string;
}

const sizeStyles: Record<HeroBrandSize, { logo: "md" | "lg" | "xl"; year: string; gap: string }> = {
  sm: {
    logo: "md",
    year: "text-2xl md:text-3xl",
    gap: "mt-4",
  },
  md: {
    logo: "lg",
    year: "text-3xl md:text-4xl",
    gap: "mt-5",
  },
  lg: {
    logo: "xl",
    year: "text-[clamp(2.5rem,8vw,6rem)]",
    gap: "mt-6",
  },
};

export function HeroBrand({
  size = "lg",
  showTrophy = true,
  className = "",
}: HeroBrandProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`text-center ${className}`}>
      {/* Event badge */}
      <EventBadge />

      {/* Logo */}
      <div className={size === "lg" ? "mt-8" : "mt-6"}>
        {size === "lg" ? (
          <h1 className="relative">
            {/* Glow layer for large size */}
            <span
              className="absolute inset-0 font-display text-[clamp(4rem,15vw,12rem)] leading-[0.85] tracking-tight uppercase text-gold-500 blur-2xl opacity-30"
              aria-hidden="true"
            >
              Soup
              <span className="text-white">or</span>
              Bowl
            </span>
            <span className="relative block">
              <Logo size={styles.logo} withGlow />
            </span>
          </h1>
        ) : (
          <Logo size={styles.logo} withGlow={size === "md"} />
        )}
      </div>

      {/* Year */}
      <div className={styles.gap}>
        <span
          className={`font-display ${styles.year} leading-none tracking-wider text-gold-500 ${size === "lg" ? "text-shadow-year" : ""}`}
        >
          2026
        </span>
      </div>

      {/* Trophy divider */}
      {showTrophy && (
        <div className={size === "lg" ? "my-10" : "my-6"}>
          <Divider>
            <Trophy className={size === "lg" ? "w-8 h-8 text-gold-500" : "w-6 h-6 text-gold-500"} />
          </Divider>
        </div>
      )}
    </div>
  );
}
