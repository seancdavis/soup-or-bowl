import type { ReactNode } from "react";

type BadgeVariant = "default" | "outlined" | "pill";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "px-3 py-1.5 text-xs tracking-wider uppercase text-primary-300 bg-primary-800/50 rounded border border-primary-700/50",
  outlined:
    "px-4 py-1 text-xs tracking-[0.2em] uppercase text-gold-400 border border-gold-500/30 rounded-full bg-gold-500/5",
  pill: "px-3 py-1 text-sm tracking-widest uppercase text-gold-400",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span className={`inline-block ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
