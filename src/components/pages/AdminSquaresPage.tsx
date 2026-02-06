import {
  Shield,
  ArrowLeft,
  Grid3X3,
  Lock,
  Unlock,
  Settings,
  Trophy,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card, Button } from "../ui";
import type { Square, SquaresScore } from "../../db";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface WinnerInfo {
  quarter: number;
  seahawksLastDigit: number | null;
  patriotsLastDigit: number | null;
  winningSquare: Square | null;
}

interface AdminSquaresPageProps {
  user: User;
  grid: (Square | null)[][];
  rowNumbers: number[];
  colNumbers: number[];
  scores: SquaresScore[];
  winners: WinnerInfo[];
  squaresLocked: boolean;
  maxSquaresPerUser: number;
  totalSquaresClaimed: number;
}

export function AdminSquaresPage({
  user,
  grid,
  rowNumbers,
  colNumbers,
  scores,
  winners,
  squaresLocked,
  maxSquaresPerUser,
  totalSquaresClaimed,
}: AdminSquaresPageProps) {
  // Get score for each quarter
  const getScore = (quarter: number) => {
    return scores.find((s) => s.quarter === quarter);
  };

  return (
    <>
      <Header user={user} />
      <main className="relative min-h-screen pt-24 pb-16">
        <PageBackground variant="simple" />

        <Container size="xl" className="relative z-10">
          {/* Back link */}
          <a
            href="/squares"
            className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Squares
          </a>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Squares Admin</h1>
              <p className="text-primary-400">
                {totalSquaresClaimed} of 100 squares claimed
              </p>
            </div>
          </div>

          {/* Settings Card */}
          <Card variant="bordered" className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">Game Settings</h2>
            </div>

            <div className="space-y-4">
              {/* Lock/Unlock Toggle */}
              <div className="flex items-center justify-between p-4 bg-primary-800/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium">Game Lock</p>
                  <p className="text-sm text-primary-400">
                    {squaresLocked
                      ? "Game is locked. Numbers have been generated. Users can view but not pick squares."
                      : "Game is open. Users can pick and release squares."}
                  </p>
                  {squaresLocked && (
                    <p className="text-xs text-gold-400 mt-1">
                      Note: Unlocking and re-locking will generate NEW random numbers.
                    </p>
                  )}
                </div>
                <form action="/api/admin/squares" method="POST">
                  <input type="hidden" name="action" value="toggle_squares_locked" />
                  <input type="hidden" name="return_to" value="/squares/admin" />
                  <Button
                    type="submit"
                    variant={squaresLocked ? "primary" : "secondary"}
                    size="sm"
                  >
                    {squaresLocked ? (
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

              {/* Max Squares Per User */}
              <div className="flex items-center justify-between p-4 bg-primary-800/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium">Max Squares Per User</p>
                  <p className="text-sm text-primary-400">
                    Currently set to {maxSquaresPerUser} squares per user.
                  </p>
                </div>
                <form action="/api/admin/squares" method="POST" className="flex items-center gap-2">
                  <input type="hidden" name="action" value="set_max_squares" />
                  <input type="hidden" name="return_to" value="/squares/admin" />
                  <input
                    type="number"
                    name="max_squares"
                    min="1"
                    max="100"
                    defaultValue={maxSquaresPerUser}
                    className="w-20 px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white text-center"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Set
                  </Button>
                </form>
              </div>
            </div>
          </Card>

          {/* Scores Card - only show when locked */}
          {squaresLocked && (
            <Card variant="bordered" className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-5 h-5 text-gold-400" />
                <h2 className="text-lg font-semibold text-white">Quarter Scores</h2>
              </div>

              <div className="space-y-4">
                {[1, 2, 3, 4].map((quarter) => {
                  const score = getScore(quarter);
                  const winner = winners.find((w) => w.quarter === quarter);

                  return (
                    <div key={quarter} className="p-4 bg-primary-800/50 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-shrink-0">
                          <span className="text-white font-medium">Quarter {quarter}</span>
                          {winner?.winningSquare && (
                            <div className="text-xs text-gold-400 mt-1">
                              Winner: {winner.winningSquare.userName || winner.winningSquare.userEmail}
                            </div>
                          )}
                        </div>
                        <form
                          action="/api/admin/squares"
                          method="POST"
                          className="flex flex-wrap items-center gap-2 flex-1"
                        >
                          <input type="hidden" name="action" value="set_score" />
                          <input type="hidden" name="quarter" value={quarter} />
                          <input type="hidden" name="return_to" value="/squares/admin" />

                          <div className="flex items-center gap-2">
                            <label className="text-green-400 text-sm font-medium">SEA</label>
                            <input
                              type="number"
                              name="seahawks_score"
                              min="0"
                              defaultValue={score?.seahawksScore ?? ""}
                              placeholder="--"
                              className="w-16 px-2 py-1.5 bg-primary-700 border border-primary-600 rounded text-white text-center"
                            />
                          </div>

                          <span className="text-primary-500">-</span>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              name="patriots_score"
                              min="0"
                              defaultValue={score?.patriotsScore ?? ""}
                              placeholder="--"
                              className="w-16 px-2 py-1.5 bg-primary-700 border border-primary-600 rounded text-white text-center"
                            />
                            <label className="text-red-400 text-sm font-medium">NE</label>
                          </div>

                          <Button type="submit" variant="secondary" size="sm">
                            Save
                          </Button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Axis Numbers - only show when locked */}
          {squaresLocked && (
            <Card variant="bordered" className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Grid3X3 className="w-5 h-5 text-gold-400" />
                <h2 className="text-lg font-semibold text-white">Assigned Numbers</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-green-400 font-medium mb-2">Seahawks (Columns)</p>
                  <div className="flex gap-1">
                    {colNumbers.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded bg-green-600/30 border border-green-500/50 flex items-center justify-center text-green-300 font-bold"
                      >
                        {num >= 0 ? num : "?"}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-red-400 font-medium mb-2">Patriots (Rows)</p>
                  <div className="flex gap-1">
                    {rowNumbers.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-300 font-bold"
                      >
                        {num >= 0 ? num : "?"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Danger Zone */}
          <Card variant="bordered" className="border-red-500/30">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex-1">
                  <p className="text-white font-medium">Clear All Scores</p>
                  <p className="text-sm text-primary-400">
                    Remove all quarter scores. This does not affect square claims.
                  </p>
                </div>
                <form action="/api/admin/squares" method="POST">
                  <input type="hidden" name="action" value="clear_all_scores" />
                  <input type="hidden" name="return_to" value="/squares/admin" />
                  <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20">
                    Clear Scores
                  </Button>
                </form>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex-1">
                  <p className="text-white font-medium">Clear All Squares</p>
                  <p className="text-sm text-primary-400">
                    Remove all square claims. Users will need to pick again.
                  </p>
                </div>
                <form action="/api/admin/squares" method="POST">
                  <input type="hidden" name="action" value="clear_all_squares" />
                  <input type="hidden" name="return_to" value="/squares/admin" />
                  <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20">
                    Clear Squares
                  </Button>
                </form>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex-1">
                  <p className="text-white font-medium">Reset Entire Game</p>
                  <p className="text-sm text-primary-400">
                    Clear all squares, scores, and unlock the game. Start fresh.
                  </p>
                </div>
                <form action="/api/admin/squares" method="POST">
                  <input type="hidden" name="action" value="reset_game" />
                  <input type="hidden" name="return_to" value="/squares/admin" />
                  <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20">
                    <RefreshCw className="w-4 h-4" />
                    Reset Game
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
