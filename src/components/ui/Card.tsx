import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "bordered" | "elevated";
}

const variantStyles = {
  default: "bg-primary-900/50 backdrop-blur-sm",
  bordered: "bg-primary-900/50 backdrop-blur-sm border border-primary-700",
  elevated: "bg-primary-800/80 backdrop-blur-sm shadow-xl",
};

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl p-6 md:p-8 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
