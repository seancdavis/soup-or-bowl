type BackgroundVariant = "hero" | "simple" | "minimal";

interface PageBackgroundProps {
  variant?: BackgroundVariant;
}

export function PageBackground({ variant = "hero" }: PageBackgroundProps) {
  if (variant === "minimal") {
    return (
      <div className="absolute inset-0 bg-primary-950 pointer-events-none">
        <div className="absolute inset-0 bg-vignette-subtle" />
      </div>
    );
  }

  if (variant === "simple") {
    return (
      <div className="absolute inset-0 bg-primary-950 pointer-events-none">
        <div className="absolute inset-0 opacity-40 bg-stadium-lights" />
        <div className="absolute inset-0 opacity-[0.03] bg-diagonal-stripes" />
        <div className="absolute inset-0 bg-vignette" />
      </div>
    );
  }

  // Hero variant - full effects
  return (
    <div className="absolute inset-0 bg-primary-950 pointer-events-none">
      <div className="absolute inset-0 opacity-40 bg-stadium-lights" />
      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
}
