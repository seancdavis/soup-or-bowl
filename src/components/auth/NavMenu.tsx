import { Menu, Trophy } from "lucide-react";

export function NavMenu() {
  return (
    <details className="relative">
      <summary className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-800/50 hover:bg-primary-700/50 ring-2 ring-transparent hover:ring-gold-500/30 transition-all duration-200 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <Menu className="w-5 h-5 text-primary-300" />
      </summary>

      {/* Dropdown panel */}
      <div className="absolute right-0 mt-3 w-48 bg-primary-900/95 backdrop-blur-sm border border-primary-700/80 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Gold accent line at top */}
        <div className="h-0.5 bg-gradient-to-r from-gold-500/0 via-gold-500 to-gold-500/0" />

        {/* Navigation links */}
        <div className="p-2">
          <a
            href="/entries"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-300 hover:text-white hover:bg-primary-800/60 rounded-lg transition-all duration-150"
          >
            <Trophy className="w-4 h-4 text-primary-500" />
            All Entries
          </a>
        </div>
      </div>
    </details>
  );
}
