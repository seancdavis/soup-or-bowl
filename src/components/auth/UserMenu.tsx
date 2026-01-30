import { useState } from "react";

interface UserMenuProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-9 h-9 rounded-full border-2 border-gold-500/50"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center text-sm font-medium text-white border-2 border-gold-500/50">
            {(user.name || user.email)[0].toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 z-50 bg-primary-800 border border-primary-700 rounded-lg shadow-xl py-2">
            <div className="px-4 py-2 border-b border-primary-700">
              <p className="font-medium text-white truncate">
                {user.name || "User"}
              </p>
              <p className="text-sm text-primary-400 truncate">{user.email}</p>
            </div>

            <div className="px-2 py-2">
              <a
                href="/api/auth/signout"
                className="block w-full px-3 py-1.5 text-sm text-left text-primary-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                Sign out
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
