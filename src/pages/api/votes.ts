import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../lib/auth";
import { getVotingActiveSetting, getVotingLockedSetting } from "../../lib/settings";
import { getVoteByEmail, upsertVote } from "../../lib/votes";
import { getEntryByEmail, getAllEntries } from "../../lib/entries";
import { logger } from "../../lib/logger";

const log = logger.scope("VOTES");

export const POST: APIRoute = async ({ request, redirect }) => {
  // Verify authentication and approval
  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated vote request");
    return redirect("/login", 302);
  }
  if (!auth.isApproved) {
    log.warn("Unapproved user tried to vote:", auth.user.email);
    return redirect("/unauthorized", 302);
  }

  // Check if voting is active
  const votingActive = await getVotingActiveSetting();
  if (!votingActive) {
    log.warn("Vote attempted while voting inactive:", auth.user.email);
    return redirect("/vote?message=voting_inactive", 302);
  }

  // Check if voting is locked
  const votingLocked = await getVotingLockedSetting();
  if (votingLocked) {
    // Check if user already has a vote - if so, they can view but not edit
    const existingVote = await getVoteByEmail(auth.user.email);
    if (existingVote) {
      log.warn("Vote edit attempted while voting locked:", auth.user.email);
      return redirect("/vote?message=voting_locked", 302);
    }
    // New votes are also blocked when locked
    log.warn("New vote attempted while voting locked:", auth.user.email);
    return redirect("/vote?message=voting_locked", 302);
  }

  // Parse form data
  const formData = await request.formData();
  const firstPlaceId = parseInt(formData.get("first_place")?.toString() || "0", 10);
  const secondPlaceId = parseInt(formData.get("second_place")?.toString() || "0", 10);
  const thirdPlaceId = parseInt(formData.get("third_place")?.toString() || "0", 10);

  // Validate that all selections are made
  if (!firstPlaceId || !secondPlaceId || !thirdPlaceId) {
    log.warn("Incomplete vote submission:", auth.user.email);
    return redirect("/vote?message=incomplete_vote", 302);
  }

  // Validate that selections are unique
  const selectedIds = [firstPlaceId, secondPlaceId, thirdPlaceId];
  if (new Set(selectedIds).size !== 3) {
    log.warn("Duplicate vote selections:", auth.user.email);
    return redirect("/vote?message=duplicate_selections", 302);
  }

  // Validate that all selected entries exist
  const allEntries = await getAllEntries();
  const entryIds = new Set(allEntries.map((e) => e.id));
  for (const id of selectedIds) {
    if (!entryIds.has(id)) {
      log.warn("Invalid entry ID in vote:", id, "by:", auth.user.email);
      return redirect("/vote?message=invalid_entry", 302);
    }
  }

  // Optionally: prevent voting for own entry
  const userEntry = await getEntryByEmail(auth.user.email);
  if (userEntry && selectedIds.includes(userEntry.id)) {
    log.warn("User tried to vote for own entry:", auth.user.email);
    return redirect("/vote?message=cannot_vote_self", 302);
  }

  // Get display name
  const displayName = auth.user.name || auth.user.email;

  // Create or update the vote
  try {
    await upsertVote({
      voterEmail: auth.user.email,
      voterName: displayName,
      firstPlaceEntryId: firstPlaceId,
      secondPlaceEntryId: secondPlaceId,
      thirdPlaceEntryId: thirdPlaceId,
    });

    log.info("Vote recorded for:", auth.user.email);
    return redirect("/vote?message=vote_saved", 302);
  } catch (error) {
    log.error("Failed to save vote:", error);
    return redirect("/vote?message=vote_error", 302);
  }
};
