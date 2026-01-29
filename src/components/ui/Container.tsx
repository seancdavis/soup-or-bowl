import type { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeStyles = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function Container({
  size = "lg",
  className = "",
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={`mx-auto px-4 md:px-6 w-full ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
