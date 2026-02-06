import { Grid3X3, ArrowLeft, Trophy } from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card } from "../ui";
import { SquaresGridLocked } from "../squares";
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

interface SquaresLockedPageProps {
  user: User;
  grid: (Square | null)[][];
  rowNumbers: number[];
  colNumbers: number[];
  scores: SquaresScore[];
  winners: WinnerInfo[];
}

export function SquaresLockedPage({
  user,
  grid,
  rowNumbers,
  colNumbers,
  scores,
  winners,
}: SquaresLockedPageProps) {
  // Count total winners
  const winnerCount = winners.filter((w) => w.winningSquare).length;

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
          <Card variant="bordered">
            <SquaresGridLocked
              grid={grid}
              rowNumbers={rowNumbers}
              colNumbers={colNumbers}
              scores={scores}
              winners={winners}
            />
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
