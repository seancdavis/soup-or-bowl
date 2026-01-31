interface EventBadgeProps {
  text?: string;
  className?: string;
}

export function EventBadge({
  text = "Super Bowl LX · February 8, 2026",
  className = "",
}: EventBadgeProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
    >
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
      <span className="text-gold-400 text-sm tracking-[0.3em] uppercase font-semibold">
        {text}
      </span>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
    </div>
  );
}
