import { Container } from "../ui";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-primary-800/50">
      <Container size="xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-400">
          <p>&copy; {year} Soup or Bowl. All rights reserved.</p>
          <p className="text-primary-500">Super Bowl LX</p>
        </div>
      </Container>
    </footer>
  );
}
