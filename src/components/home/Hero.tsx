import { PageBackground, EventBadge, Logo, Divider, Icon } from "../ui";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary-950">
      <PageBackground variant="hero" />

      {/* Main content */}
      <div className="relative z-10 text-center px-4 py-20">
        {/* Roman numeral year badge - championship style */}
        <div className="inline-flex animate-fade-in-down">
          <EventBadge text="Super Bowl LX" />
        </div>

        {/* Main title - THE CHAMPIONSHIP */}
        <h1 className="relative mt-8">
          {/* Glow layer */}
          <span
            className="absolute inset-0 font-display text-[clamp(4rem,15vw,12rem)] leading-[0.85] tracking-tight uppercase text-gold-500 blur-2xl opacity-30"
            aria-hidden="true"
          >
            Soup
            <span className="text-white">or</span>
            Bowl
          </span>

          {/* Main text */}
          <span className="relative block animate-fade-in-up">
            <Logo size="xl" withGlow />
          </span>
        </h1>

        {/* Year - large and bold */}
        <div className="mt-6 animate-fade-in-up animation-delay-200">
          <span className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-none tracking-wider text-gold-500 text-shadow-year">
            2026
          </span>
        </div>

        {/* Divider with trophy icon */}
        <div className="my-10 animate-fade-in animation-delay-400">
          <Divider>
            <Icon name="trophy" className="w-8 h-8 text-gold-500" />
          </Divider>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-primary-200 font-light tracking-wide animate-fade-in-up animation-delay-500">
          The Ultimate Championship Showdown
        </p>

        {/* Subtitle with soup + football */}
        <p className="mt-3 text-primary-400 text-sm md:text-base tracking-widest uppercase animate-fade-in-up animation-delay-600">
          Where Culinary Champions Are Crowned
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-950 to-transparent" />
    </section>
  );
}
