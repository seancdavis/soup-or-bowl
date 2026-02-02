import { Home } from "lucide-react";
import { Container, PageBackground, Button, HeroBrand } from "../ui";

export function NotFoundPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <PageBackground variant="minimal" />

      <Container size="sm" className="relative z-10 text-center py-20">
        <HeroBrand size="sm" className="mb-8" />

        <h1 className="text-6xl font-bold text-primary-300 mb-4">404</h1>
        <p className="text-xl text-primary-400 mb-8">
          This page doesn't exist.
        </p>

        <a href="/">
          <Button variant="primary">
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
        </a>
      </Container>
    </main>
  );
}
