import { PageBackground, HeroBrand } from "../ui";
import { LoginButton } from "../auth";

export function LoginPage() {
  return (
    <main className="relative">
      <PageBackground variant="simple" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Hero branding */}
        <HeroBrand size="md" showTrophy={false} className="mb-8" />

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
