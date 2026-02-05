import { User, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Header, Footer } from "../layout";
import { Container, PageBackground, Button, Card } from "../ui";

interface ProfilePageUser {
  name: string | null;
  email: string;
  image: string | null;
  googleImage?: string | null;
}

interface ProfilePageProps {
  user: ProfilePageUser;
  displayName: string | null;
  customImage: string | null;
  imageUploadSlot?: boolean;
  children?: ReactNode;
}

export function ProfilePage({ user, displayName, customImage, children }: ProfilePageProps) {
  // Use the custom display name if set, otherwise fall back to OAuth name
  const currentName = displayName ?? user.name ?? "";

  return (
    <>
      <Header user={{ ...user, name: displayName ?? user.name }} />
      <main className="relative min-h-screen pt-24 pb-16">
        <PageBackground variant="simple" />

        <Container size="md" className="relative z-10">
          {/* Back link */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </a>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
              <User className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
              <p className="text-primary-400">
                Update your profile photo and display name
              </p>
            </div>
          </div>

          {/* Profile Image Upload (passed as children for client hydration) */}
          <Card variant="bordered" className="mb-6">
            {children}
          </Card>

          {/* Form */}
          <Card variant="bordered">
            <form action="/api/profile" method="POST" className="space-y-6">
              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-primary-200 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  required
                  maxLength={255}
                  defaultValue={currentName}
                  placeholder="Your name for the competition"
                  className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-primary-400">
                  This is the name that will be shown on your competition entries.
                </p>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Email
                </label>
                <div className="w-full px-4 py-3 bg-primary-800/30 border border-primary-700 rounded-lg text-primary-400">
                  {user.email}
                </div>
                <p className="mt-2 text-sm text-primary-500">
                  Your email is managed through Google sign-in.
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-primary-300 hover:text-white transition-colors"
                >
                  Cancel
                </a>
              </div>
            </form>
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
