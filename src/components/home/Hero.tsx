export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary-950">
      {/* Stadium lights effect - radial burst from top */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-gold-500) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 0%, var(--color-gold-400) 0%, transparent 40%),
            radial-gradient(ellipse 60% 40% at 80% 0%, var(--color-gold-400) 0%, transparent 40%)
          `,
        }}
      />

      {/* Diagonal stripes - sports field aesthetic */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            var(--color-gold-500) 40px,
            var(--color-gold-500) 42px
          )`,
        }}
      />

      {/* Subtle noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, var(--color-primary-950) 70%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-4 py-20">
        {/* Roman numeral year badge - championship style */}
        <div className="inline-flex items-center gap-3 mb-8 animate-[fadeInDown_0.8s_ease-out]">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
          <span className="text-gold-400 text-sm tracking-[0.3em] uppercase font-semibold">
            Super Bowl LX
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
        </div>

        {/* Main title - THE CHAMPIONSHIP */}
        <h1 className="relative">
          {/* Glow layer */}
          <span
            className="absolute inset-0 font-[family-name:var(--font-family-display)] text-[clamp(4rem,15vw,12rem)] leading-[0.85] tracking-tight uppercase text-gold-500 blur-2xl opacity-30"
            aria-hidden="true"
          >
            Soup
            <span className="text-white">or</span>
            Bowl
          </span>

          {/* Main text with stacked layout */}
          <span className="relative block">
            <span
              className="block font-[family-name:var(--font-family-display)] text-[clamp(4rem,15vw,12rem)] leading-[0.85] tracking-tight uppercase text-white animate-[fadeInUp_0.6s_ease-out]"
              style={{
                textShadow: `
                  0 0 80px rgba(212, 165, 0, 0.3),
                  4px 4px 0 var(--color-primary-900),
                  8px 8px 0 var(--color-primary-950)
                `,
              }}
            >
              Soup
              <span
                className="text-gold-500 mx-2 md:mx-4 text-[0.5em] align-middle"
                style={{
                  textShadow: "0 0 40px var(--color-gold-500)",
                }}
              >
                or
              </span>
              Bowl
            </span>
          </span>
        </h1>

        {/* Year - large and bold */}
        <div className="mt-6 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
          <span
            className="font-[family-name:var(--font-family-display)] text-[clamp(2.5rem,8vw,6rem)] leading-none tracking-wider text-gold-500"
            style={{
              textShadow: `
                0 0 60px var(--color-gold-500),
                2px 2px 0 var(--color-primary-900)
              `,
            }}
          >
            2026
          </span>
        </div>

        {/* Divider with trophy icon */}
        <div className="flex items-center justify-center gap-4 my-10 animate-[fadeIn_0.8s_ease-out_0.4s_both]">
          <span className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gold-500 to-gold-500" />
          <svg
            className="w-8 h-8 text-gold-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M5 3h14c.55 0 1 .45 1 1v2c0 2.55-1.92 4.63-4.39 4.94.63 1.05 1.39 1.94 2.39 2.56V15h-4v2h2v2H8v-2h2v-2H6v-1.5c1-.62 1.76-1.51 2.39-2.56C5.92 10.63 4 8.55 4 6V4c0-.55.45-1 1-1zm1 3v2c0 1.38.81 2.56 2 3.07V9.5C6.81 9.27 6 8.38 6 7.38V6zm12 0v1.38c0 1-.81 1.89-2 2.12v1.57c1.19-.51 2-1.69 2-3.07V6z" />
          </svg>
          <span className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent via-gold-500 to-gold-500" />
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-primary-200 font-light tracking-wide animate-[fadeInUp_0.6s_ease-out_0.5s_both]">
          The Ultimate Championship Showdown
        </p>

        {/* Subtitle with soup + football */}
        <p className="mt-3 text-primary-400 text-sm md:text-base tracking-widest uppercase animate-[fadeInUp_0.6s_ease-out_0.6s_both]">
          Where Culinary Champions Are Crowned
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-950 to-transparent" />

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
