import { Vote, ArrowLeft, Lock, Check } from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card, Button } from "../ui";
import type { Entry, Vote as VoteType } from "../../db";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface VotingPageProps {
  user: User;
  entries: Entry[];
  existingVote: VoteType | null;
  votingActive: boolean;
  votingLocked: boolean;
  isAdmin?: boolean;
}

export function VotingPage({
  user,
  entries,
  existingVote,
  votingActive,
  votingLocked,
  isAdmin,
}: VotingPageProps) {
  // Filter out user's own entry from voting options
  const votableEntries = entries.filter((e) => e.userEmail !== user.email);

  // Check if user can edit their vote
  const canEdit = votingActive && !votingLocked;
  const hasVoted = !!existingVote;

  // Get entry details for existing vote display
  const getEntryById = (id: number) => entries.find((e) => e.id === id);

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
              <Vote className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cast Your Vote</h1>
              <p className="text-primary-400">
                {!votingActive
                  ? "Voting is not currently open"
                  : votingLocked && hasVoted
                    ? "Voting is locked - viewing your ballot"
                    : hasVoted
                      ? "Update your ranked choices"
                      : "Select your top 3 favorites"}
              </p>
            </div>
          </div>

          {/* Voting not active message */}
          {!votingActive && (
            <Card variant="bordered" className="text-center py-12">
              <Lock className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-300 mb-2">
                Voting Not Yet Open
              </h3>
              <p className="text-primary-400">
                Check back later when voting begins.
              </p>
            </Card>
          )}

          {/* Voting active but locked - show existing vote */}
          {votingActive && votingLocked && hasVoted && (
            <Card variant="bordered">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-gold-400" />
                <h2 className="text-lg font-semibold text-white">Your Ballot (Locked)</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-primary-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-primary-950 font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {(() => {
                        const entry = getEntryById(existingVote.firstPlaceEntryId);
                        return entry ? `${entry.title} (${entry.userName || entry.userEmail})` : "Unknown";
                      })()}
                    </div>
                    <div className="text-sm text-primary-400">3 points</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-primary-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-primary-950 font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {(() => {
                        const entry = getEntryById(existingVote.secondPlaceEntryId);
                        return entry ? `${entry.title} (${entry.userName || entry.userEmail})` : "Unknown";
                      })()}
                    </div>
                    <div className="text-sm text-primary-400">2 points</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-primary-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {(() => {
                        const entry = getEntryById(existingVote.thirdPlaceEntryId);
                        return entry ? `${entry.title} (${entry.userName || entry.userEmail})` : "Unknown";
                      })()}
                    </div>
                    <div className="text-sm text-primary-400">1 point</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Voting active and not locked - show form */}
          {votingActive && !votingLocked && (
            <Card variant="bordered">
              {votableEntries.length < 3 ? (
                <div className="text-center py-8">
                  <p className="text-primary-400">
                    There aren't enough entries to vote yet. At least 3 entries from other users are needed.
                  </p>
                </div>
              ) : (
                <form action="/api/votes" method="POST">
                  <div className="space-y-6">
                    {/* 1st Place */}
                    <div>
                      <label className="flex items-center gap-2 text-white font-medium mb-3">
                        <span className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center text-primary-950 text-sm font-bold">
                          1
                        </span>
                        First Place (3 points)
                      </label>
                      <select
                        name="first_place"
                        required
                        defaultValue={existingVote?.firstPlaceEntryId || ""}
                        className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      >
                        <option value="">Select your top choice...</option>
                        {votableEntries.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.title} ({entry.userName || entry.userEmail})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2nd Place */}
                    <div>
                      <label className="flex items-center gap-2 text-white font-medium mb-3">
                        <span className="w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center text-primary-950 text-sm font-bold">
                          2
                        </span>
                        Second Place (2 points)
                      </label>
                      <select
                        name="second_place"
                        required
                        defaultValue={existingVote?.secondPlaceEntryId || ""}
                        className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      >
                        <option value="">Select your second choice...</option>
                        {votableEntries.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.title} ({entry.userName || entry.userEmail})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3rd Place */}
                    <div>
                      <label className="flex items-center gap-2 text-white font-medium mb-3">
                        <span className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-white text-sm font-bold">
                          3
                        </span>
                        Third Place (1 point)
                      </label>
                      <select
                        name="third_place"
                        required
                        defaultValue={existingVote?.thirdPlaceEntryId || ""}
                        className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      >
                        <option value="">Select your third choice...</option>
                        {votableEntries.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.title} ({entry.userName || entry.userEmail})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button type="submit" variant="primary">
                      <Check className="w-4 h-4" />
                      {hasVoted ? "Update Vote" : "Submit Vote"}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
