import type { ReactNode } from "react";

interface DividerProps {
  children?: ReactNode;
  className?: string;
  lineClassName?: string;
}

export function Divider({
  children,
  className = "",
  lineClassName = "bg-gradient-to-r from-transparent via-gold-500 to-gold-500",
}: DividerProps) {
  if (!children) {
    return <div className={`h-px ${lineClassName} ${className}`} />;
  }

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <span className={`h-px w-16 md:w-24 ${lineClassName}`} />
      {children}
      <span
        className={`h-px w-16 md:w-24 ${lineClassName.replace("to-r", "to-l")}`}
      />
    </div>
  );
}
