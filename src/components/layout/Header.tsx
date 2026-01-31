import { Container, Avatar, Logo } from "../ui";

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

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary-300 hidden sm:block">
                {user.name || user.email}
              </span>
              <Avatar
                src={user.image}
                name={user.name}
                email={user.email}
                size="sm"
              />
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
