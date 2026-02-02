import { Trophy, Plus, Pencil } from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Button } from "../ui";
import { EntryList } from "../entries";
import type { Entry } from "../../db";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface EntriesPageProps {
  user: User;
  entries: Entry[];
}

export function EntriesPage({ user, entries }: EntriesPageProps) {
  const hasEntry = entries.some((e) => e.userEmail === user.email);

  return (
    <>
      <Header user={user} />
      <main className="relative min-h-screen pt-24 pb-16">
        <PageBackground variant="simple" />

        <Container size="xl" className="relative z-10">
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
          <EntryList entries={entries} currentUserEmail={user.email} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
