import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../lib/auth";
import { updateUserDisplayName } from "../../lib/profile";
import { logger } from "../../lib/logger";

const log = logger.scope("PROFILE");

export const POST: APIRoute = async ({ request, redirect }) => {
  // Verify authentication and approval
  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated request");
    return redirect("/login?message=auth_error", 302);
  }
  if (!auth.isApproved) {
    log.warn("Unapproved user:", auth.user.email);
    return redirect("/unauthorized?message=unauthorized", 302);
  }

  const { user } = auth;

  // Parse form data
  const formData = await request.formData();
  const displayName = formData.get("displayName")?.toString().trim();

  if (!displayName) {
    log.warn("Missing display name");
    return redirect("/profile?message=name_required", 302);
  }

  // Validate name length
  if (displayName.length > 255) {
    log.warn("Display name too long");
    return redirect("/profile?message=name_too_long", 302);
  }

  try {
    const updatedUser = await updateUserDisplayName(user.email, displayName);

    if (!updatedUser) {
      log.warn("Failed to update user profile:", user.email);
      return redirect("/profile?message=update_failed", 302);
    }

    log.info("Profile updated for:", user.email);
    return redirect("/profile?message=profile_updated", 302);
  } catch (error) {
    log.error("Failed to update profile:", error);
    return redirect("/profile?message=update_failed", 302);
  }
};
