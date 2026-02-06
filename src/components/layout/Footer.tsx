import { Container } from "../ui";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-primary-800/50">
      <Container size="xl">
        <p className="text-sm text-primary-400 text-center">
          &copy; {year} SoupOrBowl. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
