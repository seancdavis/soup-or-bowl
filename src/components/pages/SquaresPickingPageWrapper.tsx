import { Grid3X3, ArrowLeft, Lock, Target, Check, Settings } from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card, Button } from "../ui";
import { SquaresGridPicker } from "../squares";
import type { Square, ScorePrediction } from "../../db";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface AdminGame {
  slug: string;
  name: string;
}

interface SquaresPickingPageWrapperProps {
  user: User;
  isAdmin?: boolean;
  isPartyUser?: boolean;
  adminGames?: AdminGame[];
  gameSlug: string;
  gameName: string;
  isGameAdmin?: boolean;
  grid: (Square | null)[][];
  userSquareCount: number;
  maxSquaresPerUser: number;
  userPrediction: ScorePrediction | null;
}

export function SquaresPickingPageWrapper({
  user,
  isAdmin,
  isPartyUser = true,
  adminGames,
  gameSlug,
  gameName,
  isGameAdmin,
  grid,
  userSquareCount,
  maxSquaresPerUser,
  userPrediction,
}: SquaresPickingPageWrapperProps) {
  return (
    <>
      <Header user={user} isAdmin={isAdmin} isPartyUser={isPartyUser} adminGames={adminGames} />
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{gameName}</h1>
              <p className="text-primary-400">
                Pick your squares before the game is locked!
              </p>
            </div>
            {isGameAdmin && (
              <a
                href={`/squares/${gameSlug}/admin`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary-300 hover:text-white bg-primary-800/50 hover:bg-primary-700/50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Admin
              </a>
            )}
          </div>

          {/* Info card */}
          <Card variant="bordered" className="mb-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary-300">
                <p className="mb-2">
                  <strong className="text-white">How it works:</strong> Claim squares on the 10x10 grid.
                  Once the admin locks the game, random numbers (0-9) will be assigned to each row and column.
                </p>
                <p>
                  Winners are determined by the last digit of each team's score at the end of each quarter.
                  The person whose square matches those digits wins that quarter!
                </p>
              </div>
            </div>
          </Card>

          {/* Interactive grid */}
          <Card variant="bordered" className="mb-6">
            <SquaresGridPicker
              initialGrid={grid}
              initialUserSquareCount={userSquareCount}
              maxSquaresPerUser={maxSquaresPerUser}
              userEmail={user.email}
              userName={user.name}
              apiBaseUrl={`/api/squares/${gameSlug}`}
            />
          </Card>

          {/* Score Prediction */}
          <Card variant="bordered">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-white">Score Prediction (5th Prize)</h2>
            </div>
            <p className="text-sm text-primary-300 mb-4">
              Guess the final score of the game! The person closest to the actual score wins.
              Your total difference across both teams determines your rank (lower is better).
            </p>

            {userPrediction ? (
              <div className="p-4 bg-primary-800/50 rounded-lg mb-4">
                <p className="text-sm text-primary-400 mb-2">Your current prediction:</p>
                <p className="text-white font-medium">
                  SEA {userPrediction.seahawksScore} - {userPrediction.patriotsScore} NE
                </p>
                <p className="text-xs text-primary-500 mt-1">You can update your prediction below.</p>
              </div>
            ) : null}

            <form action={`/api/predictions/${gameSlug}`} method="POST" className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-green-400 text-sm font-medium mb-1 block">Seahawks</label>
                <input
                  type="number"
                  name="prediction_seahawks"
                  min="0"
                  required
                  defaultValue={userPrediction?.seahawksScore ?? ""}
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
                  defaultValue={userPrediction?.patriotsScore ?? ""}
                  placeholder="--"
                  className="w-20 px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white text-center"
                />
              </div>
              <Button type="submit" variant="primary" size="sm">
                <Check className="w-4 h-4" />
                {userPrediction ? "Update Prediction" : "Submit Prediction"}
              </Button>
            </form>
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
