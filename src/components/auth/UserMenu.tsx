import { LogOut, Soup, User } from "lucide-react";
import { Avatar } from "../ui";

interface UserMenuProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <details className="relative">
      <summary className="flex items-center p-0.5 rounded-full ring-2 ring-transparent hover:ring-gold-500/30 transition-all duration-200 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <Avatar src={user.image} name={user.name} email={user.email} />
      </summary>

      {/* Dropdown panel */}
      <div className="absolute right-0 mt-3 w-64 bg-primary-900/95 backdrop-blur-sm border border-primary-700/80 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Gold accent line at top */}
        <div className="h-0.5 bg-gradient-to-r from-gold-500/0 via-gold-500 to-gold-500/0" />

        {/* User info section */}
        <div className="px-5 py-4">
          <p className="font-semibold text-white truncate leading-tight">
            {user.name || "User"}
          </p>
          <p className="text-sm text-primary-400 truncate mt-0.5">{user.email}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-primary-700/60 mx-4" />

        {/* Actions section */}
        <div className="p-2">
          <a
            href="/my-entry"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-300 hover:text-white hover:bg-primary-800/60 rounded-lg transition-all duration-150"
          >
            <Soup className="w-4 h-4 text-primary-500" />
            My Entry
          </a>
          <a
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-300 hover:text-white hover:bg-primary-800/60 rounded-lg transition-all duration-150"
          >
            <User className="w-4 h-4 text-primary-500" />
            Edit Profile
          </a>
          <a
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-300 hover:text-white hover:bg-primary-800/60 rounded-lg transition-all duration-150"
          >
            <LogOut className="w-4 h-4 text-primary-500" />
            Sign out
          </a>
        </div>
      </div>
    </details>
  );
}
