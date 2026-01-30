interface SignOutButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}

const variantStyles = {
  primary:
    "bg-gold-500 text-primary-950 hover:bg-gold-400 active:bg-gold-600 shadow-lg",
  secondary:
    "bg-primary-700 text-white hover:bg-primary-600 active:bg-primary-800 border border-primary-500",
  ghost: "bg-transparent text-white hover:bg-white/10 active:bg-white/20",
};

export function SignOutButton({
  className = "",
  variant = "secondary",
}: SignOutButtonProps) {
  return (
    <a
      href="/api/auth/signout"
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-2.5 text-base
        font-semibold rounded-lg
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-primary-950
        ${variantStyles[variant]}
        ${className}
      `}
    >
      Sign out
    </a>
  );
}
