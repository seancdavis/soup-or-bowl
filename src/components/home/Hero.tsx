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
        <p className="text-xl md:text-2xl text-primary-200 font-light tracking-wide text-center animate-fade-in-up animation-delay-500">
          The Ultimate Championship Showdown
        </p>

        {/* Subtitle */}
        <p className="mt-3 text-primary-400 text-sm md:text-base tracking-widest uppercase text-center animate-fade-in-up animation-delay-600">
          Where Culinary Champions Are Crowned
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-950 to-transparent" />
    </section>
  );
}
