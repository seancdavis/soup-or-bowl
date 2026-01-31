import { Container, Logo } from "../ui";
import { UserMenu } from "../auth";

interface HeaderProps {
  user?: {
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-950/80 backdrop-blur-md border-b border-primary-800/50">
      <Container size="xl">
        <div className="flex items-center justify-between h-16">
          <a
            href="/"
            className="hover:text-gold-400 transition-colors"
          >
            <Logo size="sm" />
          </a>

          {user && <UserMenu user={user} />}
        </div>
      </Container>
    </header>
  );
}
