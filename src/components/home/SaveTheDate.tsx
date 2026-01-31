import { Card, Badge, Divider, FootballIcon } from "../ui";

export function SaveTheDate() {
  // Super Bowl LX is February 8, 2026
  const eventDate = new Date("2026-02-08T17:00:00");
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const featureTags = ["Soup Competition", "Super Bowl Watch Party", "Live Voting"];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Date card - ticket style */}
        <Card
          variant="bordered"
          className="relative overflow-hidden border-gold-500/20 bg-gradient-to-br from-primary-900/80 to-primary-950/80"
        >
          {/* Corner cuts for ticket effect */}
          <TicketCorners />

          {/* Perforated edge effect */}
          <PerforatedEdges />

          {/* Card content */}
          <div className="relative px-8 md:px-16 py-12 text-center">
            {/* Event badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-gold-500 animate-pulse" />
              <Badge variant="pill">Game Day</Badge>
              <span className="w-3 h-3 rounded-full bg-gold-500 animate-pulse" />
            </div>

            {/* Main date display */}
            <div className="space-y-2">
              <p className="text-primary-300 text-lg">Super Bowl Sunday</p>
              <p className="font-display text-3xl md:text-5xl text-white uppercase tracking-wide text-shadow-subtle">
                {formattedDate}
              </p>
            </div>

            {/* Divider */}
            <div className="my-8">
              <Divider lineClassName="bg-gradient-to-r from-transparent to-primary-700">
                <FootballIcon className="w-6 h-6 text-gold-500" />
              </Divider>
            </div>

            {/* Coming soon message */}
            <div className="space-y-3">
              <p className="text-primary-200 text-lg">Details Coming Soon</p>
              <p className="text-primary-400 text-sm max-w-md mx-auto">
                Get ready to compete for culinary glory while watching the
                biggest game of the year.
              </p>
            </div>

            {/* Feature tags */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {featureTags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function TicketCorners() {
  return (
    <>
      <div className="absolute top-0 left-0 w-8 h-8 bg-primary-950 -translate-x-4 -translate-y-4 rotate-45" />
      <div className="absolute top-0 right-0 w-8 h-8 bg-primary-950 translate-x-4 -translate-y-4 rotate-45" />
      <div className="absolute bottom-0 left-0 w-8 h-8 bg-primary-950 -translate-x-4 translate-y-4 rotate-45" />
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-950 translate-x-4 translate-y-4 rotate-45" />
    </>
  );
}

function PerforatedEdges() {
  const dots = Array.from({ length: 12 });

  return (
    <>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-full flex flex-col justify-center gap-2">
        {dots.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-primary-950 -ml-1" />
        ))}
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-full flex flex-col justify-center gap-2">
        {dots.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-primary-950 -mr-1 ml-auto" />
        ))}
      </div>
    </>
  );
}
