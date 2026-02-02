import { Soup } from "lucide-react";
import { EntryCard } from "./EntryCard";
import type { Entry } from "../../db";

interface EntryListProps {
  entries: Entry[];
  currentUserEmail?: string;
}

export function EntryList({ entries, currentUserEmail }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <Soup className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-primary-300 mb-2">No entries yet</h3>
        <p className="text-primary-400">Be the first to submit your entry!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          isOwner={currentUserEmail === entry.userEmail}
        />
      ))}
    </div>
  );
}
