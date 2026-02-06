import { Grid3X3, ArrowLeft, Trophy, Target, Check } from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card, Button } from "../ui";
import { SquaresGridLocked } from "../squares";
import type { Square, SquaresScore, ScorePrediction } from "../../db";

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

interface SquaresLockedPageProps {
  user: User;
  grid: (Square | null)[][];
  rowNumbers: number[];
  colNumbers: number[];
  scores: SquaresScore[];
  winners: WinnerInfo[];
  userPrediction: ScorePrediction | null;
  predictionResults: Array<{
    prediction: ScorePrediction;
    diff: number | null;
  }>;
  actualFinalScore: { seahawks: number | null; patriots: number | null };
}

export function SquaresLockedPage({
  user,
  grid,
  rowNumbers,
  colNumbers,
  scores,
  winners,
  userPrediction,
  predictionResults,
  actualFinalScore,
}: SquaresLockedPageProps) {
  // Count total winners
  const winnerCount = winners.filter((w) => w.winningSquare).length;

  const hasFinalScore = actualFinalScore.seahawks !== null && actualFinalScore.patriots !== null;
  const minDiff = hasFinalScore
    ? Math.min(...predictionResults.filter((r) => r.diff !== null).map((r) => r.diff as number))
    : null;

  return (
    <>
      <Header user={user} />
      <main className="relative min-h-screen pt-24 pb-16">
        <PageBackground variant="simple" />

        <Container size="xl" className="relative z-10">
          {/* Back link */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </a>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
              <Grid3X3 className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Super Bowl Squares</h1>
              <p className="text-primary-400">
                Game is locked! Numbers have been assigned.
              </p>
            </div>
          </div>

          {/* Winner summary */}
          {winnerCount > 0 && (
            <Card variant="bordered" className="mb-6 bg-gold-500/5 border-gold-500/30">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-gold-400" />
                <div>
                  <h3 className="text-white font-semibold">
                    {winnerCount} Quarter{winnerCount !== 1 ? "s" : ""} Won!
                  </h3>
                  <div className="text-sm text-primary-300 mt-1">
                    {winners
                      .filter((w) => w.winningSquare)
                      .map((w) => (
                        <span key={w.quarter} className="mr-3">
                          Q{w.quarter}: <span className="text-gold-400">{w.winningSquare?.userName || w.winningSquare?.userEmail}</span>
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Locked grid */}
          <Card variant="bordered" className="mb-6">
            <SquaresGridLocked
              grid={grid}
              rowNumbers={rowNumbers}
              colNumbers={colNumbers}
              scores={scores}
              winners={winners}
            />
          </Card>

          {/* Score Prediction Section */}
          <Card variant="bordered">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">Score Prediction (5th Prize)</h2>
            </div>

            {/* User's prediction */}
            {userPrediction ? (
              <div className="p-4 bg-primary-800/50 rounded-lg mb-4">
                <p className="text-sm text-primary-400 mb-1">Your prediction:</p>
                <p className="text-white font-medium">
                  SEA {userPrediction.seahawksScore} - {userPrediction.patriotsScore} NE
                </p>
                {hasFinalScore && (
                  <p className="text-xs text-primary-500 mt-1">
                    Difference: {Math.abs(userPrediction.seahawksScore - actualFinalScore.seahawks!) + Math.abs(userPrediction.patriotsScore - actualFinalScore.patriots!)}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-primary-300 mb-3">
                  You haven't submitted a prediction yet. Guess the final score to compete for the 5th prize!
                </p>
                <form action="/api/predictions" method="POST" className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="text-green-400 text-sm font-medium mb-1 block">Seahawks</label>
                    <input
                      type="number"
                      name="prediction_seahawks"
                      min="0"
                      required
                      placeholder="--"
                      className="w-20 px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="text-red-400 text-sm font-medium mb-1 block">Patriots</label>
                    <input
                      type="number"
                      name="prediction_patriots"
                      min="0"
                      required
                      placeholder="--"
                      className="w-20 px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white text-center"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="sm">
                    <Check className="w-4 h-4" />
                    Submit Prediction
                  </Button>
                </form>
              </div>
            )}

            {/* Prediction leaderboard - only show if actual scores are set */}
            {hasFinalScore && predictionResults.length > 0 && (
              <div className="mt-4">
                <p className="text-white font-medium mb-3">Leaderboard</p>
                <div className="space-y-2">
                  {predictionResults.map(({ prediction, diff }, index) => {
                    const isWinner = diff !== null && diff === minDiff;
                    const isCurrentUser = prediction.userEmail === user.email;

                    return (
                      <div
                        key={prediction.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isWinner
                            ? "bg-gold-500/10 border border-gold-500/50"
                            : isCurrentUser
                              ? "bg-primary-700/50 border border-primary-600"
                              : "bg-primary-800/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isWinner ? "bg-gold-500 text-primary-950" : "bg-primary-700 text-primary-400"
                          }`}>
                            {index + 1}
                          </span>
                          <span className={`text-sm ${isCurrentUser ? "text-white font-medium" : "text-primary-300"}`}>
                            {prediction.userName || prediction.userEmail}
                            {isCurrentUser && <span className="text-primary-500 ml-1">(you)</span>}
                            {prediction.isProxy && <span className="text-primary-500 ml-1">(proxy)</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-primary-400">
                            SEA {prediction.seahawksScore} - {prediction.patriotsScore} NE
                          </span>
                          <span className={`font-medium ${isWinner ? "text-gold-400" : "text-primary-300"}`}>
                            {diff !== null ? `+${diff}` : "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If no final score yet, just show all predictions */}
            {!hasFinalScore && predictionResults.length > 0 && (
              <div className="mt-4">
                <p className="text-white font-medium mb-3">
                  All Predictions ({predictionResults.length})
                </p>
                <div className="space-y-2">
                  {predictionResults.map(({ prediction }) => {
                    const isCurrentUser = prediction.userEmail === user.email;

                    return (
                      <div
                        key={prediction.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isCurrentUser
                            ? "bg-primary-700/50 border border-primary-600"
                            : "bg-primary-800/30"
                        }`}
                      >
                        <span className={`text-sm ${isCurrentUser ? "text-white font-medium" : "text-primary-300"}`}>
                          {prediction.userName || prediction.userEmail}
                          {isCurrentUser && <span className="text-primary-500 ml-1">(you)</span>}
                          {prediction.isProxy && <span className="text-primary-500 ml-1">(proxy)</span>}
                        </span>
                        <span className="text-primary-400 text-sm">
                          SEA {prediction.seahawksScore} - {prediction.patriotsScore} NE
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
