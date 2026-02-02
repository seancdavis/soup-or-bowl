import { Header, Footer } from "../layout";
import { Hero, SaveTheDate } from "../home";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface HomePageProps {
  user: User;
  hasEntry?: boolean;
}

export function HomePage({ user, hasEntry = false }: HomePageProps) {
  return (
    <>
      <Header user={user} />
      <main className="pt-16">
        <Hero hasEntry={hasEntry} />
        <SaveTheDate />
      </main>
      <Footer />
    </>
  );
}
