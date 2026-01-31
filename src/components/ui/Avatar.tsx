type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-sm",
  md: "w-9 h-9 text-sm",
  lg: "w-16 h-16 text-xl",
};

export function Avatar({
  src,
  name,
  email,
  size = "md",
  className = "",
}: AvatarProps) {
  const displayName = name || email || "User";
  const initial = displayName[0].toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={displayName}
        className={`rounded-full border-2 border-gold-500/50 ${sizeStyles[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-primary-700 flex items-center justify-center font-medium text-white border-2 border-gold-500/50 ${sizeStyles[size]} ${className}`}
    >
      {initial}
    </div>
  );
}
