import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../../lib/auth";
import { upsertVote } from "../../../lib/votes";
import { getAllEntries } from "../../../lib/entries";
import { logger } from "../../../lib/logger";

const log = logger.scope("ADMIN-VOTES");

export const POST: APIRoute = async ({ request, redirect }) => {
  // Verify authentication, approval, and admin status
  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated proxy vote request");
    return redirect("/login", 302);
  }
  if (!auth.isApproved) {
    log.warn("Unapproved user tried to submit proxy vote:", auth.user.email);
    return redirect("/unauthorized", 302);
  }
  if (!auth.isAdmin) {
    log.warn("Non-admin user tried to submit proxy vote:", auth.user.email);
    return new Response(null, { status: 404 });
  }

  // Parse form data
  const formData = await request.formData();
  const voterName = formData.get("voter_name")?.toString().trim();
  const firstPlaceId = parseInt(formData.get("first_place")?.toString() || "0", 10);
  const secondPlaceId = parseInt(formData.get("second_place")?.toString() || "0", 10);
  const thirdPlaceId = parseInt(formData.get("third_place")?.toString() || "0", 10);

  // Validate voter name
  if (!voterName) {
    log.warn("Proxy vote missing voter name, by:", auth.user.email);
    return redirect("/vote/admin?message=missing_name", 302);
  }

  // Validate that all selections are made
  if (!firstPlaceId || !secondPlaceId || !thirdPlaceId) {
    log.warn("Incomplete proxy vote submission by:", auth.user.email);
    return redirect("/vote/admin?message=incomplete_vote", 302);
  }

  // Validate that selections are unique
  const selectedIds = [firstPlaceId, secondPlaceId, thirdPlaceId];
  if (new Set(selectedIds).size !== 3) {
    log.warn("Duplicate proxy vote selections by:", auth.user.email);
    return redirect("/vote/admin?message=duplicate_selections", 302);
  }

  // Validate that all selected entries exist
  const allEntries = await getAllEntries();
  const entryIds = new Set(allEntries.map((e) => e.id));
  for (const id of selectedIds) {
    if (!entryIds.has(id)) {
      log.warn("Invalid entry ID in proxy vote:", id, "by:", auth.user.email);
      return redirect("/vote/admin?message=invalid_entry", 302);
    }
  }

  // Generate a stable proxy email from the voter name
  const proxyEmail = `proxy-${voterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@proxy.local`;

  // Create or update the proxy vote
  try {
    await upsertVote({
      voterEmail: proxyEmail,
      voterName: voterName,
      firstPlaceEntryId: firstPlaceId,
      secondPlaceEntryId: secondPlaceId,
      thirdPlaceEntryId: thirdPlaceId,
    });

    log.info("Proxy vote recorded for:", voterName, "by admin:", auth.user.email);
    return redirect("/vote/admin?message=proxy_vote_saved", 302);
  } catch (error) {
    log.error("Failed to save proxy vote:", error);
    return redirect("/vote/admin?message=vote_error", 302);
  }
};
