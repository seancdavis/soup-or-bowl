import { FootballIcon } from "./FootballIcon";

interface EventBadgeProps {
  className?: string;
}

export function EventBadge({ className = "" }: EventBadgeProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
      <span className="flex items-center gap-2 text-gold-400 text-sm tracking-[0.3em] uppercase font-semibold">
        Super Bowl LX
        <FootballIcon className="w-3 h-3" />
        February 8, 2026
      </span>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
    </div>
  );
}
