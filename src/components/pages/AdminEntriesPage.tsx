import {
  Shield,
  ArrowLeft,
  Eye,
  EyeOff,
  Settings,
  Vote,
  UserPlus,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card, Button } from "../ui";
import { EntryCard } from "../entries";
import type { Entry } from "../../db";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface AdminEntriesPageProps {
  user: User;
  entries: Entry[];
  revealEntries: boolean;
  message: string | null;
}

const MESSAGE_MAP: Record<string, { type: "success" | "error"; text: string }> = {
  proxy_entry_saved: { type: "success", text: "Proxy entry has been created." },
  proxy_entry_deleted: { type: "success", text: "Proxy entry has been deleted." },
  proxy_entry_exists: { type: "error", text: "A proxy entry for that name already exists." },
  missing_entrant_name: { type: "error", text: "Please enter a name for the entrant." },
  missing_fields: { type: "error", text: "Please fill in the entry title and description." },
  entry_error: { type: "error", text: "Failed to save entry. Please try again." },
  entry_not_found: { type: "error", text: "Entry not found." },
  not_proxy_entry: { type: "error", text: "Only proxy entries can be deleted from admin." },
};

export function AdminEntriesPage({ user, entries, revealEntries, message }: AdminEntriesPageProps) {
  const entriesNeedingPower = entries.filter((e) => e.needsPower).length;
  const entriesWithNotes = entries.filter((e) => e.notes).length;
  const proxyEntries = entries.filter((e) => e.userEmail.endsWith("@proxy.local"));
  const messageInfo = message ? MESSAGE_MAP[message] : null;

  return (
    <>
      <Header user={user} />
      <main className="relative min-h-screen pt-24 pb-16">
        <PageBackground variant="simple" />

        <Container size="xl" className="relative z-10">
          {/* Back link */}
          <a
            href="/entries"
            className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Public View
          </a>

          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin View</h1>
                <p className="text-primary-400">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                  {proxyEntries.length > 0 && ` (${proxyEntries.length} proxy)`}
                  {entriesNeedingPower > 0 && ` · ${entriesNeedingPower} need power`}
                  {entriesWithNotes > 0 && ` · ${entriesWithNotes} with notes`}
                </p>
              </div>
            </div>
            <a href="/vote/admin">
              <Button variant="secondary" size="sm">
                <Vote className="w-4 h-4" />
                Voting Admin
              </Button>
            </a>
          </div>

          {/* Settings Card */}
          <Card variant="bordered" className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">Entry Settings</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-medium">Reveal Entry Details</p>
                <p className="text-sm text-primary-400">
                  {revealEntries
                    ? "Entry titles and descriptions are visible to all users."
                    : "Entry titles and descriptions are hidden from other users."}
                </p>
              </div>
              <form action="/api/admin/settings" method="POST">
                <input type="hidden" name="action" value="toggle_reveal_entries" />
                <Button type="submit" variant={revealEntries ? "primary" : "secondary"} size="sm">
                  {revealEntries ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hidden
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {/* Proxy Entry Card */}
          <Card variant="bordered" className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">
                Add Proxy Entry
              </h2>
            </div>

            <p className="text-sm text-primary-400 mb-6">
              Add an entry on behalf of someone competing who isn't using the
              app. This entry will appear in the entries list and be available
              for voting.
            </p>

            {messageInfo && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg mb-6 ${
                  messageInfo.type === "success"
                    ? "bg-green-900/30 text-green-400"
                    : "bg-red-900/30 text-red-400"
                }`}
              >
                {messageInfo.type === "success" ? (
                  <Check className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="text-sm">{messageInfo.text}</span>
              </div>
            )}

            <form action="/api/admin/entries" method="POST">
              <div className="space-y-4">
                {/* Entrant Name */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Entrant Name
                  </label>
                  <input
                    type="text"
                    name="entrant_name"
                    required
                    placeholder="Name of the person entering the competition..."
                    className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                {/* Entry Title */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Entry Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="What are they bringing?"
                    className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    placeholder="Describe the entry..."
                    className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Needs Power */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="needsPower"
                    id="proxy-needs-power"
                    className="w-4 h-4 rounded border-primary-600 bg-primary-800 text-gold-500 focus:ring-gold-500"
                  />
                  <label htmlFor="proxy-needs-power" className="text-white text-sm">
                    Needs power outlet
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Notes <span className="text-primary-500 font-normal">(optional, admin-only)</span>
                  </label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="Any notes for organizers..."
                    className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" variant="primary" size="sm">
                  <Check className="w-4 h-4" />
                  Add Proxy Entry
                </Button>
              </div>
            </form>
          </Card>

          {/* Entry list with private details */}
          {entries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-primary-400">No entries yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <div key={entry.id} className="relative">
                  <EntryCard
                    entry={entry}
                    showPrivateDetails
                  />
                  {entry.userEmail.endsWith("@proxy.local") && (
                    <div className="mt-2">
                      <details className="relative">
                        <summary className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-red-400 transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          <Trash2 className="w-4 h-4" />
                          Remove Proxy Entry
                        </summary>
                        <div className="absolute left-0 bottom-full mb-2 p-4 bg-primary-800 border border-primary-600 rounded-lg shadow-xl w-64 z-10">
                          <p className="text-sm text-primary-200 mb-3">
                            Delete this proxy entry? Any votes for it will reference a missing entry.
                          </p>
                          <form action="/api/admin/entries" method="POST" className="flex gap-2">
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
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
