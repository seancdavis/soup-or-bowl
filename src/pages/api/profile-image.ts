import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../lib/auth";
import { updateUserCustomImage } from "../../lib/profile";
import { logger } from "../../lib/logger";

const log = logger.scope("PROFILE-IMAGE");

export const POST: APIRoute = async ({ request, redirect }) => {
  // Verify authentication and approval
  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated request");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!auth.isApproved) {
    log.warn("Unapproved user:", auth.user.email);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { user } = auth;

  try {
    const data = await request.json();
    const imageKey = data.key;

    if (!imageKey || typeof imageKey !== "string") {
      log.warn("Missing image key");
      return new Response(JSON.stringify({ error: "Missing image key" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedUser = await updateUserCustomImage(user.email, imageKey);

    if (!updatedUser) {
      log.warn("Failed to update user image:", user.email);
      return new Response(JSON.stringify({ error: "Update failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    log.info("Profile image updated for:", user.email);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    log.error("Failed to update profile image:", error);
    return new Response(JSON.stringify({ error: "Update failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
