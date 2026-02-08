import { Header, Footer } from "../layout";
import { Hero, SaveTheDate } from "../home";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface AdminGame {
  slug: string;
  name: string;
}

interface HomePageProps {
  user: User;
  hasEntry?: boolean;
  isAdmin?: boolean;
  adminGames?: AdminGame[];
}

export function HomePage({ user, hasEntry = false, isAdmin, adminGames }: HomePageProps) {
  return (
    <>
      <Header user={user} isAdmin={isAdmin} adminGames={adminGames} />
      <main className="pt-16">
        <Hero hasEntry={hasEntry} />
        <SaveTheDate />
      </main>
      <Footer />
    </>
  );
}
