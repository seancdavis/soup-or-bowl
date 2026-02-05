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
} from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card, Button } from "../ui";
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
  votingActive: boolean;
  votingLocked: boolean;
  revealResults: boolean;
}

export function AdminVotingPage({
  user,
  votesWithEntries,
  votingActive,
  votingLocked,
  revealResults,
}: AdminVotingPageProps) {
  return (
    <>
      <Header user={user} />
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
              </div>
            </div>
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
