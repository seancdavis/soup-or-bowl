import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../../lib/auth";
import { getGameBySlug, getUserGameAccess } from "../../../lib/games";
import { upsertPrediction } from "../../../lib/squares";
import { logger } from "../../../lib/logger";

const log = logger.scope("PREDICTIONS");

export const POST: APIRoute = async ({ request, params, redirect }) => {
  const { slug } = params;

  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated prediction request");
    return redirect("/login", 302);
  }

  const game = await getGameBySlug(slug!);
  if (!game) {
    return new Response(null, { status: 404 });
  }

  const access = await getUserGameAccess(auth.user.email, game.id);
  if (!access) {
    log.warn("User has no access to game:", slug, auth.user.email);
    return redirect("/squares", 302);
  }

  if (game.isLocked) {
    log.warn("Prediction rejected - game is locked:", auth.user.email);
    return redirect(`/squares/${slug}?message=game_locked`, 302);
  }

  const formData = await request.formData();
  const seahawksStr = formData.get("prediction_seahawks")?.toString();
  const patriotsStr = formData.get("prediction_patriots")?.toString();

  if (!seahawksStr || !patriotsStr) {
    log.warn("Incomplete prediction submission:", auth.user.email);
    return redirect(`/squares/${slug}?message=incomplete_prediction`, 302);
  }

  const seahawksScore = parseInt(seahawksStr, 10);
  const patriotsScore = parseInt(patriotsStr, 10);

  if (
    isNaN(seahawksScore) ||
    isNaN(patriotsScore) ||
    seahawksScore < 0 ||
    patriotsScore < 0
  ) {
    log.warn("Invalid prediction scores:", auth.user.email);
    return redirect(`/squares/${slug}?message=invalid_prediction`, 302);
  }

  try {
    await upsertPrediction(game.id, {
      userEmail: auth.user.email,
      userName: auth.user.name || auth.user.email,
      seahawksScore,
      patriotsScore,
    });

    log.info(
      "Prediction saved for:",
      auth.user.email,
      "in:",
      slug,
      `SEA ${seahawksScore} - ${patriotsScore} NE`
    );
    return redirect(`/squares/${slug}?message=prediction_saved`, 302);
  } catch (error) {
    log.error("Failed to save prediction:", error);
    return redirect(`/squares/${slug}?message=prediction_error`, 302);
  }
};
