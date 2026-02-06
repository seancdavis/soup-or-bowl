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
  UserPlus,
  Target,
} from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card, Button, ConfirmDialog } from "../ui";
import type { Square, SquaresScore } from "../../db";
import type { ScorePrediction } from "../../lib/squares";

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
  predictions: ScorePrediction[];
  predictionResults: Array<{
    prediction: ScorePrediction;
    diff: number | null;
  }>;
  actualFinalScore: { seahawks: number | null; patriots: number | null };
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
  predictions,
  predictionResults,
  actualFinalScore,
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
                <ConfirmDialog
                  title={squaresLocked ? "Unlock Game?" : "Lock Game?"}
                  message={
                    squaresLocked
                      ? "Unlocking the game will allow users to pick and release squares again. If you re-lock, new random numbers will be generated."
                      : "Locking the game will generate random axis numbers and prevent users from changing their squares. Are you sure?"
                  }
                  confirmLabel={squaresLocked ? "Unlock" : "Lock Game"}
                  variant="warning"
                >
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
                </ConfirmDialog>
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

          {/* Proxy Picks Card */}
          <Card variant="bordered" className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">Proxy Picks</h2>
            </div>
            <p className="text-sm text-primary-400 mb-4">
              Claim squares on behalf of someone who isn't using the app. Enter their name and pick coordinates.
            </p>

            {squaresLocked ? (
              <div className="p-4 bg-primary-800/50 rounded-lg text-primary-400 text-sm">
                Game is locked. Unlock the game to make proxy picks.
              </div>
            ) : (
              <form
                action="/api/admin/squares"
                method="POST"
                className="space-y-4"
              >
                <input type="hidden" name="action" value="proxy_claim" />
                <input type="hidden" name="return_to" value="/squares/admin" />

                <div>
                  <label className="text-white text-sm font-medium mb-1 block">
                    Player Name
                  </label>
                  <input
                    type="text"
                    name="proxy_name"
                    required
                    placeholder="e.g. Uncle Dave"
                    className="w-full max-w-xs px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-500"
                  />
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-1 block">Row (0-9)</label>
                    <input
                      type="number"
                      name="proxy_row"
                      min="0"
                      max="9"
                      required
                      className="w-20 px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-1 block">Col (0-9)</label>
                    <input
                      type="number"
                      name="proxy_col"
                      min="0"
                      max="9"
                      required
                      className="w-20 px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white text-center"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="sm">
                    <UserPlus className="w-4 h-4" />
                    Claim Square
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Score Prediction Admin Card */}
          <Card variant="bordered" className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">Score Predictions (5th Prize)</h2>
            </div>
            <p className="text-sm text-primary-400 mb-4">
              Players guess the final score. The winner is whoever has the lowest combined score difference.
              Set the actual final score to calculate results.
            </p>

            {/* Set Actual Final Score */}
            <div className="p-4 bg-primary-800/50 rounded-lg mb-4">
              <p className="text-white font-medium mb-3">Actual Final Score</p>
              <form
                action="/api/admin/squares"
                method="POST"
                className="flex flex-wrap items-center gap-3"
              >
                <input type="hidden" name="action" value="set_final_score" />
                <input type="hidden" name="return_to" value="/squares/admin" />

                <div className="flex items-center gap-2">
                  <label className="text-green-400 text-sm font-medium">SEA</label>
                  <input
                    type="number"
                    name="final_seahawks_score"
                    min="0"
                    defaultValue={actualFinalScore.seahawks ?? ""}
                    placeholder="--"
                    className="w-16 px-2 py-1.5 bg-primary-700 border border-primary-600 rounded text-white text-center"
                  />
                </div>
                <span className="text-primary-500">-</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="final_patriots_score"
                    min="0"
                    defaultValue={actualFinalScore.patriots ?? ""}
                    placeholder="--"
                    className="w-16 px-2 py-1.5 bg-primary-700 border border-primary-600 rounded text-white text-center"
                  />
                  <label className="text-red-400 text-sm font-medium">NE</label>
                </div>
                <Button type="submit" variant="secondary" size="sm">
                  Save Final Score
                </Button>
              </form>
            </div>

            {/* Proxy Prediction */}
            <div className="p-4 bg-primary-800/50 rounded-lg mb-4">
              <p className="text-white font-medium mb-3">Add Proxy Prediction</p>
              <form
                action="/api/admin/squares"
                method="POST"
                className="space-y-3"
              >
                <input type="hidden" name="action" value="proxy_prediction" />
                <input type="hidden" name="return_to" value="/squares/admin" />

                <div>
                  <label className="text-white text-sm font-medium mb-1 block">Player Name</label>
                  <input
                    type="text"
                    name="prediction_name"
                    required
                    placeholder="e.g. Uncle Dave"
                    className="w-full max-w-xs px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-500"
                  />
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="text-green-400 text-sm font-medium mb-1 block">SEA Score</label>
                    <input
                      type="number"
                      name="prediction_seahawks"
                      min="0"
                      required
                      className="w-20 px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="text-red-400 text-sm font-medium mb-1 block">NE Score</label>
                    <input
                      type="number"
                      name="prediction_patriots"
                      min="0"
                      required
                      className="w-20 px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white text-center"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="sm">
                    <UserPlus className="w-4 h-4" />
                    Add Prediction
                  </Button>
                </div>
              </form>
            </div>

            {/* All Predictions Table */}
            {predictions.length > 0 && (
              <div className="mt-4">
                <p className="text-white font-medium mb-3">
                  All Predictions ({predictions.length})
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-700">
                        <th className="text-left py-2 px-3 text-primary-400 font-medium text-sm">Player</th>
                        <th className="text-center py-2 px-3 text-green-400 font-medium text-sm">SEA</th>
                        <th className="text-center py-2 px-3 text-red-400 font-medium text-sm">NE</th>
                        {actualFinalScore.seahawks !== null && actualFinalScore.patriots !== null && (
                          <th className="text-center py-2 px-3 text-gold-400 font-medium text-sm">Diff</th>
                        )}
                        <th className="text-right py-2 px-3 text-primary-400 font-medium text-sm"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictionResults.map(({ prediction, diff }) => {
                        const isWinner = diff !== null && diff === Math.min(
                          ...predictionResults
                            .filter((r) => r.diff !== null)
                            .map((r) => r.diff as number)
                        );

                        return (
                          <tr
                            key={prediction.id}
                            className={`border-b border-primary-800 last:border-0 ${
                              isWinner ? "bg-gold-500/10" : ""
                            }`}
                          >
                            <td className="py-2 px-3 text-white text-sm">
                              {prediction.userName || prediction.userEmail}
                              {prediction.isProxy && (
                                <span className="ml-2 text-xs text-primary-500">(proxy)</span>
                              )}
                              {isWinner && (
                                <span className="ml-2 text-xs text-gold-400 font-medium">Winner!</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center text-white text-sm">
                              {prediction.seahawksScore}
                            </td>
                            <td className="py-2 px-3 text-center text-white text-sm">
                              {prediction.patriotsScore}
                            </td>
                            {actualFinalScore.seahawks !== null && actualFinalScore.patriots !== null && (
                              <td className={`py-2 px-3 text-center text-sm font-medium ${
                                isWinner ? "text-gold-400" : "text-primary-300"
                              }`}>
                                {diff !== null ? diff : "-"}
                              </td>
                            )}
                            <td className="py-2 px-3 text-right">
                              <ConfirmDialog
                                title="Delete Prediction?"
                                message={`Remove the score prediction from ${prediction.userName || prediction.userEmail}?`}
                                confirmLabel="Delete"
                                variant="danger"
                              >
                                <form action="/api/admin/squares" method="POST">
                                  <input type="hidden" name="action" value="delete_prediction" />
                                  <input type="hidden" name="prediction_id" value={prediction.id} />
                                  <input type="hidden" name="return_to" value="/squares/admin" />
                                  <button
                                    type="submit"
                                    className="text-red-400 hover:text-red-300 text-xs transition-colors"
                                  >
                                    Delete
                                  </button>
                                </form>
                              </ConfirmDialog>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

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
                <ConfirmDialog
                  title="Clear All Scores?"
                  message="This will remove all quarter scores. Square claims will not be affected. This action cannot be undone."
                  confirmLabel="Clear Scores"
                  variant="danger"
                >
                  <form action="/api/admin/squares" method="POST">
                    <input type="hidden" name="action" value="clear_all_scores" />
                    <input type="hidden" name="return_to" value="/squares/admin" />
                    <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20">
                      Clear Scores
                    </Button>
                  </form>
                </ConfirmDialog>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex-1">
                  <p className="text-white font-medium">Clear All Squares</p>
                  <p className="text-sm text-primary-400">
                    Remove all square claims. Users will need to pick again.
                  </p>
                </div>
                <ConfirmDialog
                  title="Clear All Squares?"
                  message="This will remove ALL square claims from all users. Everyone will need to pick their squares again. This action cannot be undone."
                  confirmLabel="Clear All Squares"
                  variant="danger"
                >
                  <form action="/api/admin/squares" method="POST">
                    <input type="hidden" name="action" value="clear_all_squares" />
                    <input type="hidden" name="return_to" value="/squares/admin" />
                    <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20">
                      Clear Squares
                    </Button>
                  </form>
                </ConfirmDialog>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex-1">
                  <p className="text-white font-medium">Reset Entire Game</p>
                  <p className="text-sm text-primary-400">
                    Clear all squares, scores, predictions, and unlock the game. Start fresh.
                  </p>
                </div>
                <ConfirmDialog
                  title="Reset Entire Game?"
                  message="This will clear ALL squares, scores, and predictions, then unlock the game. Everything will be lost. This action cannot be undone."
                  confirmLabel="Reset Everything"
                  variant="danger"
                >
                  <form action="/api/admin/squares" method="POST">
                    <input type="hidden" name="action" value="reset_game" />
                    <input type="hidden" name="return_to" value="/squares/admin" />
                    <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20">
                      <RefreshCw className="w-4 h-4" />
                      Reset Game
                    </Button>
                  </form>
                </ConfirmDialog>
              </div>
            </div>
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
