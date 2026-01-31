import { PageBackground, EventBadge, Logo } from "../ui";
import { LoginButton } from "../auth";

export function LoginPage() {
  return (
    <main className="relative">
      <PageBackground variant="simple" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Super Bowl badge at top */}
        <div className="absolute top-8 left-0 right-0">
          <EventBadge />
        </div>

        {/* Logo/Title */}
        <div className="text-center mb-10">
          <h1>
            <Logo size="lg" withGlow />
          </h1>
          <p className="text-gold-500 text-2xl font-bold mt-2">2026</p>
        </div>

        {/* Sign in section */}
        <div className="text-center max-w-md w-full">
          <p className="text-primary-200 text-lg mb-8">
            Sign in to join the competition
          </p>

          <LoginButton className="w-full justify-center" />

          <p className="text-xs text-primary-500 mt-6">
            Only pre-approved participants can access the event
          </p>
        </div>
      </div>
    </main>
  );
}
