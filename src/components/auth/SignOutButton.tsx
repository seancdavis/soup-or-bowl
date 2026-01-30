import { Button } from "../ui/Button";
import { authClient } from "../../lib/auth";

interface SignOutButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}

export function SignOutButton({
  className = "",
  variant = "secondary",
}: SignOutButtonProps) {
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("[SignOutButton] Sign out error:", error);
    }
    // Hard redirect to clear all state
    window.location.href = "/login";
  };

  return (
    <Button variant={variant} onClick={handleSignOut} className={className}>
      Sign out
    </Button>
  );
}
