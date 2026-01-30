import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth";

/**
 * Handles OAuth callback by detecting the session verifier in URL,
 * finalizing the session, and cleaning up the URL.
 *
 * The Neon Auth SDK automatically includes the verifier from the URL
 * when calling getSession(), which finalizes the OAuth flow.
 */
export function OAuthCallbackHandler() {
  const [isProcessing, setIsProcessing] = useState(() => {
    // Check if we're in a callback state
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has(
      "neon_auth_session_verifier"
    );
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasVerifier = params.has("neon_auth_session_verifier");

    if (hasVerifier) {
      console.log("[OAuthCallback] Processing session verifier...");

      // The SDK automatically reads the verifier from the URL
      authClient
        .getSession()
        .then((result) => {
          console.log("[OAuthCallback] Session result:", result.data?.user?.email || "no user");

          // Clean up URL by removing the verifier
          window.history.replaceState({}, "", window.location.pathname);

          // Reload to let the server middleware handle auth
          window.location.reload();
        })
        .catch((error) => {
          console.error("[OAuthCallback] Error processing callback:", error);
          // Clean up URL anyway
          window.history.replaceState({}, "", window.location.pathname);
          setIsProcessing(false);
        });
    }
  }, []);

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-primary-950 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-primary-300">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return null;
}
