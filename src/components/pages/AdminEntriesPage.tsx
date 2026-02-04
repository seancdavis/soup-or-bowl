import { Shield, ArrowLeft, Eye, EyeOff, Settings } from "lucide-react";
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
}

export function AdminEntriesPage({ user, entries, revealEntries }: AdminEntriesPageProps) {
  const entriesNeedingPower = entries.filter((e) => e.needsPower).length;
  const entriesWithNotes = entries.filter((e) => e.notes).length;

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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin View</h1>
              <p className="text-primary-400">
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
                {entriesNeedingPower > 0 && ` · ${entriesNeedingPower} need power`}
                {entriesWithNotes > 0 && ` · ${entriesWithNotes} with notes`}
              </p>
            </div>
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

          {/* Entry list with private details */}
          {entries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-primary-400">No entries yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  showPrivateDetails
                />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
