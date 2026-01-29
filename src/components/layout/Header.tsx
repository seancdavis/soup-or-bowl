import { Container } from "../ui/Container";

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
            className="font-[family-name:var(--font-family-display)] text-xl text-white tracking-tight hover:text-gold-400 transition-colors"
          >
            SOUP<span className="text-gold-500">or</span>BOWL
          </a>

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary-300 hidden sm:block">
                {user.name || user.email}
              </span>
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full border-2 border-gold-500/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-sm font-medium text-white">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
