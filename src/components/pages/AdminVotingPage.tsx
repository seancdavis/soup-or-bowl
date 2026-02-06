import {
  Shield,
  ArrowLeft,
  Vote,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  Users,
  UserPlus,
  Check,
  AlertCircle,
} from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card, Button, ConfirmDialog } from "../ui";
import type { Entry, Vote as VoteType } from "../../db";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface VoteWithEntries {
  vote: VoteType;
  firstPlace: Entry | null;
  secondPlace: Entry | null;
  thirdPlace: Entry | null;
}

interface AdminVotingPageProps {
  user: User;
  votesWithEntries: VoteWithEntries[];
  entries: Entry[];
  votingActive: boolean;
  votingLocked: boolean;
  revealResults: boolean;
  message: string | null;
}

const MESSAGE_MAP: Record<string, { type: "success" | "error"; text: string }> = {
  proxy_vote_saved: { type: "success", text: "Proxy vote has been saved." },
  missing_name: { type: "error", text: "Please enter a name for the voter." },
  incomplete_vote: { type: "error", text: "Please select all three rankings." },
  duplicate_selections: { type: "error", text: "Each ranking must be a different entry." },
  invalid_entry: { type: "error", text: "One of the selected entries is invalid." },
  vote_error: { type: "error", text: "Failed to save vote. Please try again." },
};

export function AdminVotingPage({
  user,
  votesWithEntries,
  entries,
  votingActive,
  votingLocked,
  revealResults,
  message,
}: AdminVotingPageProps) {
  const messageInfo = message ? MESSAGE_MAP[message] : null;
  return (
    <>
      <Header user={user} isAdmin />
      <main className="relative min-h-screen pt-24 pb-16">
        <PageBackground variant="simple" />

        <Container size="xl" className="relative z-10">
          {/* Back link */}
          <a
            href="/entries/admin"
            className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Entries
          </a>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Voting Admin</h1>
              <p className="text-primary-400">
                {votesWithEntries.length}{" "}
                {votesWithEntries.length === 1 ? "vote" : "votes"} cast
              </p>
            </div>
          </div>

          {/* Settings Card */}
          <Card variant="bordered" className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">Voting Settings</h2>
            </div>

            <div className="space-y-4">
              {/* Voting Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-primary-800/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium">Voting Active</p>
                  <p className="text-sm text-primary-400">
                    {votingActive
                      ? "Voting is open. Users can access the voting page."
                      : "Voting is closed. The voting page is inaccessible."}
                  </p>
                </div>
                <ConfirmDialog
                  title={votingActive ? "Close Voting?" : "Open Voting?"}
                  message={
                    votingActive
                      ? "This will close the voting page. Users will no longer be able to access or submit votes."
                      : "This will open the voting page. Users will be able to access and submit votes."
                  }
                  confirmLabel={votingActive ? "Close Voting" : "Open Voting"}
                  variant="warning"
                >
                  <form action="/api/admin/settings" method="POST">
                    <input type="hidden" name="action" value="toggle_voting_active" />
                    <input type="hidden" name="return_to" value="/vote/admin" />
                    <Button
                      type="submit"
                      variant={votingActive ? "primary" : "secondary"}
                      size="sm"
                    >
                      {votingActive ? (
                        <>
                          <Vote className="w-4 h-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <Vote className="w-4 h-4" />
                          Inactive
                        </>
                      )}
                    </Button>
                  </form>
                </ConfirmDialog>
              </div>

              {/* Voting Locked Toggle */}
              <div className="flex items-center justify-between p-4 bg-primary-800/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium">Voting Locked</p>
                  <p className="text-sm text-primary-400">
                    {votingLocked
                      ? "Votes are locked. Users can view but not change their votes."
                      : "Votes are editable. Users can submit and update their votes."}
                  </p>
                </div>
                <ConfirmDialog
                  title={votingLocked ? "Unlock Votes?" : "Lock Votes?"}
                  message={
                    votingLocked
                      ? "This will allow users to edit or change their votes again."
                      : "This will lock all votes. Users will be able to view their votes but not change them."
                  }
                  confirmLabel={votingLocked ? "Unlock Votes" : "Lock Votes"}
                  variant="warning"
                >
                  <form action="/api/admin/settings" method="POST">
                    <input type="hidden" name="action" value="toggle_voting_locked" />
                    <input type="hidden" name="return_to" value="/vote/admin" />
                    <Button
                      type="submit"
                      variant={votingLocked ? "primary" : "secondary"}
                      size="sm"
                    >
                      {votingLocked ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Locked
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Unlocked
                        </>
                      )}
                    </Button>
                  </form>
                </ConfirmDialog>
              </div>

              {/* Reveal Results Toggle */}
              <div className="flex items-center justify-between p-4 bg-primary-800/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium">Reveal Results</p>
                  <p className="text-sm text-primary-400">
                    {revealResults
                      ? "Winner is displayed on the entries page."
                      : "Results are hidden from users."}
                  </p>
                </div>
                <ConfirmDialog
                  title={revealResults ? "Hide Results?" : "Reveal Results?"}
                  message={
                    revealResults
                      ? "This will hide the voting results from the entries page."
                      : "This will reveal the voting winner on the entries page for all users to see."
                  }
                  confirmLabel={revealResults ? "Hide Results" : "Reveal Results"}
                  variant="warning"
                >
                  <form action="/api/admin/settings" method="POST">
                    <input type="hidden" name="action" value="toggle_reveal_results" />
                    <input type="hidden" name="return_to" value="/vote/admin" />
                    <Button
                      type="submit"
                      variant={revealResults ? "primary" : "secondary"}
                      size="sm"
                    >
                      {revealResults ? (
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
                </ConfirmDialog>
              </div>
            </div>
          </Card>

          {/* Proxy Voting Card */}
          <Card variant="bordered" className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">
                Proxy Voting
              </h2>
            </div>

            <p className="text-sm text-primary-400 mb-6">
              Submit a vote on behalf of someone at the party who isn't using
              the app.
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

            {entries.length < 3 ? (
              <div className="text-center py-8">
                <p className="text-primary-400">
                  There aren't enough entries to vote yet. At least 3 entries
                  are needed.
                </p>
              </div>
            ) : (
              <form action="/api/admin/votes" method="POST">
                <div className="space-y-6">
                  {/* Voter Name */}
                  <div>
                    <label className="block text-white font-medium mb-3">
                      Voter Name
                    </label>
                    <input
                      type="text"
                      name="voter_name"
                      required
                      placeholder="Enter the person's name..."
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>

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
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    >
                      <option value="">Select first place...</option>
                      {entries.map((entry) => (
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
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    >
                      <option value="">Select second place...</option>
                      {entries.map((entry) => (
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
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    >
                      <option value="">Select third place...</option>
                      {entries.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.title} ({entry.userName || entry.userEmail})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button type="submit" variant="primary" size="sm">
                    <Check className="w-4 h-4" />
                    Submit Proxy Vote
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Votes List */}
          <Card variant="bordered">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">All Votes</h2>
            </div>

            {votesWithEntries.length === 0 ? (
              <div className="text-center py-8">
                <Vote className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <p className="text-primary-400">No votes have been cast yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-700">
                      <th className="text-left py-3 px-4 text-primary-400 font-medium">
                        Voter
                      </th>
                      <th className="text-left py-3 px-4 text-primary-400 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-gold-500 inline-flex items-center justify-center text-primary-950 text-xs font-bold">
                            1
                          </span>
                          1st (3pts)
                        </span>
                      </th>
                      <th className="text-left py-3 px-4 text-primary-400 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-primary-400 inline-flex items-center justify-center text-primary-950 text-xs font-bold">
                            2
                          </span>
                          2nd (2pts)
                        </span>
                      </th>
                      <th className="text-left py-3 px-4 text-primary-400 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-amber-700 inline-flex items-center justify-center text-white text-xs font-bold">
                            3
                          </span>
                          3rd (1pt)
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {votesWithEntries.map(({ vote, firstPlace, secondPlace, thirdPlace }) => (
                      <tr
                        key={vote.id}
                        className="border-b border-primary-800 last:border-0"
                      >
                        <td className="py-3 px-4 text-white">
                          {vote.voterName || vote.voterEmail}
                        </td>
                        <td className="py-3 px-4 text-primary-300">
                          {firstPlace?.userName || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-primary-300">
                          {secondPlace?.userName || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-primary-300">
                          {thirdPlace?.userName || "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
