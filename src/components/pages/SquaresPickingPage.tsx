import { Grid3X3, ArrowLeft, Lock } from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card } from "../ui";
import { SquaresGridPicker } from "../squares";
import type { Square } from "../../db";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface SquaresPickingPageProps {
  user: User;
  grid: (Square | null)[][];
  userSquareCount: number;
  maxSquaresPerUser: number;
}

export function SquaresPickingPage({
  user,
  grid,
  userSquareCount,
  maxSquaresPerUser,
}: SquaresPickingPageProps) {
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
                Pick your squares before the game is locked!
              </p>
            </div>
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
          <Card variant="bordered">
            <SquaresGridPicker
              initialGrid={grid}
              initialUserSquareCount={userSquareCount}
              maxSquaresPerUser={maxSquaresPerUser}
              userEmail={user.email}
              userName={user.name}
            />
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
