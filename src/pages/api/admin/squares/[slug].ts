import type { APIRoute } from "astro";
import { getUser } from "../../../../lib/auth";
import {
  getGameBySlug,
  isGameAdmin,
  setGameLocked,
  setGameMaxSquares,
} from "../../../../lib/games";
import { setFinalScoreSetting } from "../../../../lib/settings";
import {
  generateAxisNumbers,
  setScore,
  clearAllSquares,
  clearAllScores,
  claimSquare,
  getSquare,
  adminReleaseSquare,
  releaseSquaresByUser,
  getAllSquares,
  buildGrid,
  countSquaresByUser,
  upsertPrediction,
  deletePrediction,
  clearAllPredictions,
} from "../../../../lib/squares";
import { logger } from "../../../../lib/logger";

const log = logger.scope("SQUARES-ADMIN");

/**
 * Helper to verify game admin auth. Returns game + user or error response.
 */
async function verifyGameAdmin(request: Request, slug: string) {
  const user = await getUser(request);
  if (!user) return { error: "unauthenticated" as const };

  const game = await getGameBySlug(slug);
  if (!game) return { error: "not_found" as const };

  const admin = await isGameAdmin(user.email, game.id);
  if (!admin) return { error: "not_admin" as const };

  return { user, game };
}

/**
 * GET /api/admin/squares/:slug
 * Returns grid state for admin proxy picking (JSON API).
 */
export const GET: APIRoute = async ({ request, params }) => {
  const result = await verifyGameAdmin(request, params.slug!);
  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status:
        result.error === "unauthenticated"
          ? 401
          : result.error === "not_found"
            ? 404
            : 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { game } = result;
  const allSquares = await getAllSquares(game.id);
  const grid = buildGrid(allSquares);

  return new Response(
    JSON.stringify({ grid, maxSquaresPerUser: game.maxSquaresPerUser }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

/**
 * PUT /api/admin/squares/:slug
 * JSON API for admin proxy operations (claim, release, release_all_by_user).
 */
export const PUT: APIRoute = async ({ request, params }) => {
  const result = await verifyGameAdmin(request, params.slug!);
  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status:
        result.error === "unauthenticated"
          ? 401
          : result.error === "not_found"
            ? 404
            : 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { user, game } = result;
  const body = await request.json();
  const { action } = body;

  if (action === "proxy_claim") {
    const { row, col, proxyName } = body;

    if (!proxyName || typeof row !== "number" || typeof col !== "number") {
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (row < 0 || row > 9 || col < 0 || col > 9) {
      return new Response(
        JSON.stringify({ error: "Coordinates out of range" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existing = await getSquare(game.id, row, col);
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Square already taken", square: existing }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const proxyEmail = `proxy_${proxyName.toLowerCase().replace(/\s+/g, "_")}@proxy.local`;

    const proxyCount = await countSquaresByUser(game.id, proxyEmail);
    if (proxyCount >= game.maxSquaresPerUser) {
      return new Response(
        JSON.stringify({
          error: `Proxy has reached the maximum of ${game.maxSquaresPerUser} squares`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newSquare = await claimSquare(
      game.id,
      row,
      col,
      proxyEmail,
      proxyName,
      null
    );
    if (!newSquare) {
      return new Response(
        JSON.stringify({ error: "Failed to claim square" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    log.info(
      "Proxy square claimed:",
      `(${row},${col})`,
      "in:",
      game.slug,
      "for:",
      proxyName,
      "by:",
      user.email
    );

    return new Response(
      JSON.stringify({ success: true, square: newSquare }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (action === "proxy_release") {
    const { row, col } = body;

    if (typeof row !== "number" || typeof col !== "number") {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const released = await adminReleaseSquare(game.id, row, col);
    if (!released) {
      return new Response(JSON.stringify({ error: "Square not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    log.info(
      "Admin released square:",
      `(${row},${col})`,
      "in:",
      game.slug,
      "by:",
      user.email
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "release_all_by_user") {
    const { proxyName } = body;

    if (!proxyName) {
      return new Response(
        JSON.stringify({ error: "Proxy name required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const proxyEmail = `proxy_${proxyName.toLowerCase().replace(/\s+/g, "_")}@proxy.local`;
    const count = await releaseSquaresByUser(game.id, proxyEmail);

    log.info(
      "Admin released",
      count,
      "squares for proxy:",
      proxyName,
      "in:",
      game.slug,
      "by:",
      user.email
    );

    return new Response(
      JSON.stringify({ success: true, releasedCount: count }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * POST /api/admin/squares/:slug
 * Form-based admin actions (lock/unlock, set scores, etc.)
 */
export const POST: APIRoute = async ({ request, params, redirect }) => {
  const slug = params.slug!;
  const user = await getUser(request);
  if (!user) {
    log.warn("Unauthenticated squares admin request");
    return redirect("/login", 302);
  }

  const game = await getGameBySlug(slug);
  if (!game) {
    return new Response(null, { status: 404 });
  }

  const admin = await isGameAdmin(user.email, game.id);
  if (!admin) {
    return new Response(null, { status: 404 });
  }

  const formData = await request.formData();
  const action = formData.get("action")?.toString();
  const returnTo =
    formData.get("return_to")?.toString() || `/squares/${slug}/admin`;

  if (action === "toggle_squares_locked") {
    const newValue = !game.isLocked;

    if (newValue) {
      await generateAxisNumbers(game.id);
      log.info("New axis numbers generated for:", slug, "by:", user.email);
    }

    await setGameLocked(game.id, newValue);
    log.info(
      "Game locked toggled to:",
      newValue,
      "for:",
      slug,
      "by:",
      user.email
    );
    return redirect(returnTo, 302);
  }

  if (action === "set_max_squares") {
    const maxSquares = parseInt(
      formData.get("max_squares")?.toString() || "5",
      10
    );
    if (maxSquares > 0 && maxSquares <= 100) {
      await setGameMaxSquares(game.id, maxSquares);
      log.info(
        "max_squares_per_user set to:",
        maxSquares,
        "for:",
        slug,
        "by:",
        user.email
      );
    }
    return redirect(returnTo, 302);
  }

  if (action === "set_score") {
    const quarter = parseInt(
      formData.get("quarter")?.toString() || "0",
      10
    );
    const seahawksScoreStr = formData.get("seahawks_score")?.toString();
    const patriotsScoreStr = formData.get("patriots_score")?.toString();

    if (quarter >= 1 && quarter <= 4) {
      const seahawksScore = seahawksScoreStr
        ? parseInt(seahawksScoreStr, 10)
        : null;
      const patriotsScore = patriotsScoreStr
        ? parseInt(patriotsScoreStr, 10)
        : null;

      await setScore(quarter, seahawksScore, patriotsScore);
      log.info(
        `Q${quarter} score set: Seahawks ${seahawksScore}, Patriots ${patriotsScore}`,
        "by:",
        user.email
      );
    }
    return redirect(returnTo, 302);
  }

  if (action === "set_final_score") {
    const seahawksStr = formData.get("final_seahawks_score")?.toString();
    const patriotsStr = formData.get("final_patriots_score")?.toString();
    const seahawks = seahawksStr ? parseInt(seahawksStr, 10) : null;
    const patriots = patriotsStr ? parseInt(patriotsStr, 10) : null;

    await setFinalScoreSetting(seahawks, patriots);
    log.info(
      "Final score set: Seahawks",
      seahawks,
      "Patriots",
      patriots,
      "by:",
      user.email
    );
    return redirect(returnTo, 302);
  }

  if (action === "proxy_prediction") {
    const predictionName = formData.get("prediction_name")?.toString();
    const seahawksStr = formData.get("prediction_seahawks")?.toString();
    const patriotsStr = formData.get("prediction_patriots")?.toString();

    if (!predictionName || !seahawksStr || !patriotsStr) {
      log.warn("Invalid proxy prediction data");
      return redirect(returnTo, 302);
    }

    const proxyEmail = `proxy_${predictionName.toLowerCase().replace(/\s+/g, "_")}@proxy.local`;
    await upsertPrediction(game.id, {
      userEmail: proxyEmail,
      userName: predictionName,
      seahawksScore: parseInt(seahawksStr, 10),
      patriotsScore: parseInt(patriotsStr, 10),
      isProxy: true,
      createdBy: user.email,
    });
    log.info(
      "Proxy prediction added for:",
      predictionName,
      "in:",
      slug,
      "by:",
      user.email
    );
    return redirect(returnTo, 302);
  }

  if (action === "delete_prediction") {
    const predictionId = parseInt(
      formData.get("prediction_id")?.toString() || "0",
      10
    );
    if (predictionId > 0) {
      await deletePrediction(predictionId);
      log.info("Prediction deleted:", predictionId, "by:", user.email);
    }
    return redirect(returnTo, 302);
  }

  if (action === "clear_all_squares") {
    await clearAllSquares(game.id);
    log.info("All squares cleared for:", slug, "by:", user.email);
    return redirect(returnTo, 302);
  }

  if (action === "clear_all_scores") {
    await clearAllScores();
    log.info("All scores cleared by:", user.email);
    return redirect(returnTo, 302);
  }

  if (action === "reset_game") {
    await Promise.all([
      clearAllSquares(game.id),
      clearAllScores(),
      clearAllPredictions(game.id),
    ]);
    await setGameLocked(game.id, false);
    log.info("Game reset for:", slug, "by:", user.email);
    return redirect(returnTo, 302);
  }

  log.warn("Unknown squares admin action:", action);
  return redirect(returnTo, 302);
};
