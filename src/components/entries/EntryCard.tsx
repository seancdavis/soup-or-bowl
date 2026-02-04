import { Zap, Pencil, Trash2, MessageSquare, HelpCircle } from "lucide-react";
import { Card, Avatar } from "../ui";
import type { Entry } from "../../db";

interface EntryCardProps {
  entry: Entry;
  isOwner?: boolean;
  showPrivateDetails?: boolean;
  revealEntries?: boolean;
}

export function EntryCard({ entry, isOwner = false, showPrivateDetails = false, revealEntries = false }: EntryCardProps) {
  // Show private details (needs power, notes) only for owner or when explicitly requested (admin)
  const showDetails = isOwner || showPrivateDetails;

  // Show entry content (title, description) if owner, or if reveal_entries is enabled
  const showEntryContent = isOwner || revealEntries || showPrivateDetails;

  return (
    <Card variant="bordered" className="relative">
      {/* Header with avatar and name */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar name={entry.userName} email={entry.userEmail} size="lg" />
        <div className="flex-1 min-w-0 pt-1">
          {showEntryContent ? (
            <>
              <h3 className="text-xl font-bold text-white truncate">{entry.title}</h3>
              <p className="text-sm text-primary-400">by {entry.userName || entry.userEmail}</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-bold text-primary-500 italic">Entry Hidden</h3>
              </div>
              <p className="text-sm text-primary-400">by {entry.userName || entry.userEmail}</p>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {showEntryContent ? (
        <p className="text-primary-200 whitespace-pre-wrap">{entry.description}</p>
      ) : (
        <p className="text-primary-500 italic">Entry details will be revealed soon!</p>
      )}

      {/* Private details - only for owner or admin */}
      {showDetails && (entry.needsPower || entry.notes) && (
        <div className="mt-4 pt-4 border-t border-primary-700/50 space-y-3">
          {entry.needsPower && (
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-gold-400" />
              <span className="text-primary-300">Needs power outlet</span>
            </div>
          )}
          {entry.notes && (
            <div className="flex items-start gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-gold-400 mt-0.5" />
              <span className="text-primary-300">{entry.notes}</span>
            </div>
          )}
        </div>
      )}

      {/* Owner actions */}
      {isOwner && (
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-primary-700/50">
          <a
            href="/my-entry/edit"
            className="inline-flex items-center gap-2 h-6 text-sm text-primary-300 hover:text-white transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </a>

          {/* Delete with confirmation */}
          <details className="relative flex items-center">
            <summary className="inline-flex items-center gap-2 h-6 text-sm text-primary-300 hover:text-red-400 transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <Trash2 className="w-4 h-4" />
              Delete
            </summary>
            <div className="absolute left-0 bottom-full mb-2 p-4 bg-primary-800 border border-primary-600 rounded-lg shadow-xl w-64 z-10">
              <p className="text-sm text-primary-200 mb-3">Are you sure you want to delete your entry?</p>
              <form action="/api/entries" method="POST" className="flex gap-2">
                <input type="hidden" name="_method" value="DELETE" />
                <input type="hidden" name="id" value={entry.id} />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Yes, delete
                </button>
              </form>
            </div>
          </details>
        </div>
      )}
    </Card>
  );
}
