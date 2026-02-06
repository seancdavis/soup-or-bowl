import { Soup, ArrowLeft, Plus } from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Button } from "../ui";
import { EntryForm, EntryCard } from "../entries";
import type { Entry } from "../../db";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface MyEntryPageProps {
  user: User;
  entry: Entry | null;
  isEditing?: boolean;
  isAdmin?: boolean;
}

export function MyEntryPage({ user, entry, isEditing = false, isAdmin }: MyEntryPageProps) {
  return (
    <>
      <Header user={user} isAdmin={isAdmin} />
      <main className="relative min-h-screen pt-24 pb-16">
        <PageBackground variant="simple" />

        <Container size="md" className="relative z-10">
          {/* Back link */}
          <a
            href="/entries"
            className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All Entries
          </a>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
              <Soup className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {entry ? (isEditing ? "Edit Your Entry" : "Your Entry") : "My Entry"}
              </h1>
              <p className="text-primary-400">
                {entry
                  ? isEditing
                    ? "Update your SoupOrBowl competition entry"
                    : "Manage your SoupOrBowl competition entry"
                  : "Enter the SoupOrBowl competition"}
              </p>
            </div>
          </div>

          {/* Content */}
          {isEditing || entry ? (
            isEditing ? (
              <EntryForm entry={entry} />
            ) : (
              <EntryCard entry={entry!} isOwner />
            )
          ) : (
            <div className="text-center py-16">
              <Soup className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-300 mb-2">No entry yet</h3>
              <p className="text-primary-400 mb-6">You haven't submitted an entry to the competition.</p>
              <a href="/my-entry/edit">
                <Button variant="primary">
                  <Plus className="w-5 h-5" />
                  Submit Your Entry
                </Button>
              </a>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
