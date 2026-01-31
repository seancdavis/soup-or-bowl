import { TriangleAlert } from "lucide-react";
import { PageBackground, Card, EventBadge, Logo } from "../ui";
import { SignOutButton } from "../auth";

interface UnauthorizedPageProps {
  email: string;
}

export function UnauthorizedPage({ email }: UnauthorizedPageProps) {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <PageBackground variant="simple" />

      {/* Branding at top */}
      <div className="relative z-10 mb-8 text-center">
        <EventBadge />
        <div className="mt-6">
          <Logo size="md" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <Card variant="bordered" className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <TriangleAlert className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Not on the Guest List
          </h1>

          <p className="text-primary-300 mb-4">
            Sorry, <strong className="text-white">{email}</strong> hasn't been
            approved for this event.
          </p>

          <p className="text-primary-400 text-sm mb-8">
            If you believe this is an error, contact the host to request access.
          </p>

          <SignOutButton className="w-full" />
        </Card>
      </div>
    </main>
  );
}
