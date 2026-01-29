import { Card } from "../ui/Card";

export function SaveTheDate() {
  // Super Bowl LX is February 8, 2026
  const eventDate = new Date("2026-02-08T17:00:00");
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Subtle background pattern - yard lines */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 60px,
              var(--color-gold-500) 60px,
              var(--color-gold-500) 62px
            )
          `,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 mb-4 text-xs tracking-[0.2em] uppercase text-gold-400 border border-gold-500/30 rounded-full bg-gold-500/5">
            Mark Your Calendar
          </span>
          <h2
            className="font-[family-name:var(--font-family-display)] text-4xl md:text-6xl uppercase text-white tracking-tight"
            style={{
              textShadow: "2px 2px 0 var(--color-primary-900)",
            }}
          >
            Save the Date
          </h2>
        </div>

        {/* Date card - ticket style */}
        <Card
          variant="bordered"
          className="relative overflow-hidden border-gold-500/20 bg-gradient-to-br from-primary-900/80 to-primary-950/80"
        >
          {/* Corner cuts for ticket effect */}
          <div className="absolute top-0 left-0 w-8 h-8 bg-primary-950 -translate-x-4 -translate-y-4 rotate-45" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-primary-950 translate-x-4 -translate-y-4 rotate-45" />
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-primary-950 -translate-x-4 translate-y-4 rotate-45" />
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-950 translate-x-4 translate-y-4 rotate-45" />

          {/* Perforated edge effect */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-full flex flex-col justify-center gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-950 -ml-1"
              />
            ))}
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-full flex flex-col justify-center gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-950 -mr-1 ml-auto"
              />
            ))}
          </div>

          {/* Card content */}
          <div className="relative px-8 md:px-16 py-12 text-center">
            {/* Event badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-gold-500 animate-pulse" />
              <span className="text-gold-400 text-sm tracking-widest uppercase">
                Game Day
              </span>
              <span className="w-3 h-3 rounded-full bg-gold-500 animate-pulse" />
            </div>

            {/* Main date display */}
            <div className="space-y-2">
              <p className="text-primary-300 text-lg">Super Bowl Sunday</p>
              <p
                className="font-[family-name:var(--font-family-display)] text-3xl md:text-5xl text-white uppercase tracking-wide"
                style={{
                  textShadow: "0 0 30px rgba(212, 165, 0, 0.2)",
                }}
              >
                {formattedDate}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 my-8">
              <span className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-primary-700" />
              <span className="text-gold-500 text-2xl">🏈</span>
              <span className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-primary-700" />
            </div>

            {/* Coming soon message */}
            <div className="space-y-3">
              <p className="text-primary-200 text-lg">
                Details Coming Soon
              </p>
              <p className="text-primary-400 text-sm max-w-md mx-auto">
                Get ready to compete for culinary glory while watching the
                biggest game of the year.
              </p>
            </div>

            {/* Feature tags */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {["Soup Competition", "Super Bowl Watch Party", "Live Voting"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-xs tracking-wider uppercase text-primary-300 bg-primary-800/50 rounded border border-primary-700/50"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </Card>

        {/* Bottom teaser */}
        <p className="text-center mt-8 text-primary-500 text-sm">
          Invitations will be sent to approved participants
        </p>
      </div>
    </section>
  );
}
