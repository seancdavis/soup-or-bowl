import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../lib/auth";
import { upsertPrediction } from "../../lib/squares";
import { getSquaresLockedSetting } from "../../lib/settings";
import { logger } from "../../lib/logger";

const log = logger.scope("PREDICTIONS");

export const POST: APIRoute = async ({ request, redirect }) => {
  // Verify authentication and approval
  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated prediction request");
    return redirect("/login", 302);
  }
  if (!auth.isApproved) {
    log.warn("Unapproved user tried to submit prediction:", auth.user.email);
    return redirect("/unauthorized", 302);
  }

  // Check if the game is locked - predictions are locked with the squares game
  const squaresLocked = await getSquaresLockedSetting();
  if (squaresLocked) {
    log.warn("Prediction rejected - game is locked:", auth.user.email);
    return redirect("/squares?message=game_locked", 302);
  }

  // Parse form data
  const formData = await request.formData();
  const seahawksStr = formData.get("prediction_seahawks")?.toString();
  const patriotsStr = formData.get("prediction_patriots")?.toString();

  if (!seahawksStr || !patriotsStr) {
    log.warn("Incomplete prediction submission:", auth.user.email);
    return redirect("/squares?message=incomplete_prediction", 302);
  }

  const seahawksScore = parseInt(seahawksStr, 10);
  const patriotsScore = parseInt(patriotsStr, 10);

  if (isNaN(seahawksScore) || isNaN(patriotsScore) || seahawksScore < 0 || patriotsScore < 0) {
    log.warn("Invalid prediction scores:", auth.user.email);
    return redirect("/squares?message=invalid_prediction", 302);
  }

  try {
    await upsertPrediction({
      userEmail: auth.user.email,
      userName: auth.user.name || auth.user.email,
      seahawksScore,
      patriotsScore,
    });

    log.info("Prediction saved for:", auth.user.email, `SEA ${seahawksScore} - ${patriotsScore} NE`);
    return redirect("/squares?message=prediction_saved", 302);
  } catch (error) {
    log.error("Failed to save prediction:", error);
    return redirect("/squares?message=prediction_error", 302);
  }
};
