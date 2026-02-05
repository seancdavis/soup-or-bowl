import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../../lib/auth";
import {
  getRevealEntriesSetting,
  setRevealEntriesSetting,
  getVotingActiveSetting,
  setVotingActiveSetting,
  getVotingLockedSetting,
  setVotingLockedSetting,
  getRevealResultsSetting,
  setRevealResultsSetting,
} from "../../../lib/settings";
import { logger } from "../../../lib/logger";

const log = logger.scope("SETTINGS");

export const POST: APIRoute = async ({ request, redirect }) => {
  // Verify authentication, approval, and admin status
  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated settings request");
    return redirect("/login", 302);
  }
  if (!auth.isApproved) {
    log.warn("Unapproved user tried to access settings:", auth.user.email);
    return redirect("/unauthorized", 302);
  }
  if (!auth.isAdmin) {
    log.warn("Non-admin user tried to access settings:", auth.user.email);
    return new Response(null, { status: 404 });
  }

  // Parse form data
  const formData = await request.formData();
  const action = formData.get("action")?.toString();
  const returnTo = formData.get("return_to")?.toString() || "/entries/admin";

  if (action === "toggle_reveal_entries") {
    const currentValue = await getRevealEntriesSetting();
    await setRevealEntriesSetting(!currentValue);
    log.info("reveal_entries toggled to:", !currentValue, "by:", auth.user.email);
    return redirect(returnTo, 302);
  }

  if (action === "toggle_voting_active") {
    const currentValue = await getVotingActiveSetting();
    await setVotingActiveSetting(!currentValue);
    log.info("voting_active toggled to:", !currentValue, "by:", auth.user.email);
    return redirect(returnTo, 302);
  }

  if (action === "toggle_voting_locked") {
    const currentValue = await getVotingLockedSetting();
    await setVotingLockedSetting(!currentValue);
    log.info("voting_locked toggled to:", !currentValue, "by:", auth.user.email);
    return redirect(returnTo, 302);
  }

  if (action === "toggle_reveal_results") {
    const currentValue = await getRevealResultsSetting();
    await setRevealResultsSetting(!currentValue);
    log.info("reveal_results toggled to:", !currentValue, "by:", auth.user.email);
    return redirect(returnTo, 302);
  }

  log.warn("Unknown settings action:", action);
  return redirect(returnTo, 302);
};
