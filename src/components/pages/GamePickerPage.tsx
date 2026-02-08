import { Grid3X3, ArrowLeft, Shield } from "lucide-react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Card } from "../ui";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface GameInfo {
  slug: string;
  name: string;
  role: string;
}

interface AdminGame {
  slug: string;
  name: string;
}

interface GamePickerPageProps {
  user: User;
  isAdmin?: boolean;
  isPartyUser?: boolean;
  adminGames?: AdminGame[];
  games: GameInfo[];
}

export function GamePickerPage({
  user,
  isAdmin,
  isPartyUser = true,
  adminGames,
  games,
}: GamePickerPageProps) {
  return (
    <>
      <Header user={user} isAdmin={isAdmin} isPartyUser={isPartyUser} adminGames={adminGames} />
      <main className="relative min-h-screen pt-24 pb-16">
        <PageBackground variant="simple" />

        <Container size="lg" className="relative z-10">
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
                Choose a game to play
              </p>
            </div>
          </div>

          {/* Game cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {games.map((game) => (
              <a
                key={game.slug}
                href={`/squares/${game.slug}`}
                className="block group"
              >
                <Card variant="bordered" className="transition-all duration-200 group-hover:border-gold-500/50 group-hover:bg-primary-800/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                      <Grid3X3 className="w-5 h-5 text-gold-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-white group-hover:text-gold-400 transition-colors">
                        {game.name}
                      </h2>
                      {game.role === "admin" && (
                        <div className="flex items-center gap-1 text-xs text-primary-400 mt-1">
                          <Shield className="w-3 h-3" />
                          Admin
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
