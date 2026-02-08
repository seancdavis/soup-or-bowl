import { Trophy, Plus, Pencil, Crown } from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Button, Card } from "../ui";
import { EntryList } from "../entries";
import type { Entry } from "../../db";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface Winner {
  entry: Entry;
  score: number;
}

interface AdminGame {
  slug: string;
  name: string;
}

interface EntriesPageProps {
  user: User;
  entries: Entry[];
  revealEntries?: boolean;
  revealResults?: boolean;
  winner?: Winner | null;
  isAdmin?: boolean;
  adminGames?: AdminGame[];
}

export function EntriesPage({
  user,
  entries,
  revealEntries = false,
  revealResults = false,
  winner = null,
  isAdmin,
  adminGames,
}: EntriesPageProps) {
  const hasEntry = entries.some((e) => e.userEmail === user.email);

  return (
    <>
      <Header user={user} isAdmin={isAdmin} adminGames={adminGames} />
      <main className="relative min-h-screen pt-24 pb-16">
        <PageBackground variant="simple" />

        <Container size="xl" className="relative z-10">
          {/* Winner Banner */}
          {revealResults && winner && (
            <Card variant="bordered" className="mb-8 border-gold-500/50 bg-gradient-to-r from-gold-500/10 to-primary-900/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gold-500/30 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-gold-400" />
                </div>
                <div>
                  <p className="text-gold-400 text-sm font-medium uppercase tracking-wide">
                    Competition Winner
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    {winner.entry.userName || winner.entry.userEmail}
                  </h2>
                  <p className="text-primary-400">
                    {winner.entry.title} &middot; {winner.score} points
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">All Entries</h1>
                <p className="text-primary-400">
                  {entries.length === 0
                    ? "No entries yet"
                    : entries.length === 1
                      ? "1 entry"
                      : `${entries.length} entries`}
                </p>
              </div>
            </div>
            <a href="/my-entry/edit">
              <Button variant="primary" size="sm">
                {hasEntry ? (
                  <>
                    <Pencil className="w-4 h-4" />
                    Edit My Entry
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </>
                )}
              </Button>
            </a>
          </div>

          {/* Entry list */}
          <EntryList entries={entries} currentUserEmail={user.email} revealEntries={revealEntries} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
