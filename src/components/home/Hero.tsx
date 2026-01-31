import { PageBackground, HeroBrand } from "../ui";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary-950">
      <PageBackground variant="hero" />

      {/* Main content */}
      <div className="relative z-10 px-4 py-20">
        <div className="animate-fade-in-down">
          <HeroBrand size="lg" />
        </div>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-primary-300 font-light tracking-wide text-center max-w-lg mx-auto animate-fade-in-up animation-delay-500">
          The quest for the Golden Ladle Award and $100 in completely random prize money
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-950 to-transparent" />
    </section>
  );
}
