import { Header, Footer } from "../layout";
import { Hero, SaveTheDate } from "../home";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface HomePageProps {
  user: User;
}

export function HomePage({ user }: HomePageProps) {
  return (
    <>
      <Header user={user} />
      <main className="pt-16">
        <Hero />
        <SaveTheDate />
      </main>
      <Footer />
    </>
  );
}
