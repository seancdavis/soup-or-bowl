import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../../lib/auth";
import {
  getSquaresLockedSetting,
  setSquaresLockedSetting,
  setMaxSquaresPerUserSetting,
  setFinalScoreSetting,
  getMaxSquaresPerUserSetting,
} from "../../../lib/settings";
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
} from "../../../lib/squares";
import { logger } from "../../../lib/logger";

const log = logger.scope("SQUARES-ADMIN");

/**
 * Helper to verify admin auth and return user or error response.
 */
async function verifyAdmin(request: Request) {
  const auth = await getUserWithApproval(request);
  if (!auth) return { error: "unauthenticated" as const };
  if (!auth.isApproved) return { error: "unapproved" as const };
  if (!auth.isAdmin) return { error: "not_admin" as const };
  return { user: auth.user };
}

/**
 * GET /api/admin/squares
 * Returns grid state for admin proxy picking (JSON API).
 */
export const GET: APIRoute = async ({ request }) => {
  const result = await verifyAdmin(request);
  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: result.error === "unauthenticated" ? 401 : result.error === "unapproved" ? 403 : 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [allSquares, maxSquaresPerUser] = await Promise.all([
    getAllSquares(),
    getMaxSquaresPerUserSetting(),
  ]);

  const grid = buildGrid(allSquares);

  return new Response(
    JSON.stringify({ grid, maxSquaresPerUser }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

/**
 * PUT /api/admin/squares
 * JSON API for admin proxy operations (claim, release, release_all_by_user).
 */
export const PUT: APIRoute = async ({ request }) => {
  const result = await verifyAdmin(request);
  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: result.error === "unauthenticated" ? 401 : result.error === "unapproved" ? 403 : 404,
      headers: { "Content-Type": "application/json" },
    });
  }

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
      return new Response(JSON.stringify({ error: "Coordinates out of range" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existing = await getSquare(row, col);
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Square already taken", square: existing }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const proxyEmail = `proxy_${proxyName.toLowerCase().replace(/\s+/g, "_")}@proxy.local`;

    // Check max squares for this proxy
    const proxyCount = await countSquaresByUser(proxyEmail);
    const maxSquares = await getMaxSquaresPerUserSetting();
    if (proxyCount >= maxSquares) {
      return new Response(
        JSON.stringify({ error: `Proxy has reached the maximum of ${maxSquares} squares` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newSquare = await claimSquare(row, col, proxyEmail, proxyName, null);
    if (!newSquare) {
      return new Response(JSON.stringify({ error: "Failed to claim square" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    log.info("Proxy square claimed:", `(${row},${col})`, "for:", proxyName, "by:", result.user.email);

    return new Response(
      JSON.stringify({ success: true, square: newSquare }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (action === "proxy_release") {
    const { row, col } = body;

    if (typeof row !== "number" || typeof col !== "number") {
      return new Response(JSON.stringify({ error: "Invalid coordinates" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const released = await adminReleaseSquare(row, col);
    if (!released) {
      return new Response(JSON.stringify({ error: "Square not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    log.info("Admin released square:", `(${row},${col})`, "by:", result.user.email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "release_all_by_user") {
    const { proxyName } = body;

    if (!proxyName) {
      return new Response(JSON.stringify({ error: "Proxy name required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const proxyEmail = `proxy_${proxyName.toLowerCase().replace(/\s+/g, "_")}@proxy.local`;
    const count = await releaseSquaresByUser(proxyEmail);

    log.info("Admin released", count, "squares for proxy:", proxyName, "by:", result.user.email);

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

export const POST: APIRoute = async ({ request, redirect }) => {
  // Verify authentication, approval, and admin status
  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated squares admin request");
    return redirect("/login", 302);
  }
  if (!auth.isApproved) {
    log.warn("Unapproved user tried to access squares admin:", auth.user.email);
    return redirect("/unauthorized", 302);
  }
  if (!auth.isAdmin) {
    log.warn("Non-admin user tried to access squares admin:", auth.user.email);
    return new Response(null, { status: 404 });
  }

  // Parse form data
  const formData = await request.formData();
  const action = formData.get("action")?.toString();
  const returnTo = formData.get("return_to")?.toString() || "/squares/admin";

  if (action === "toggle_squares_locked") {
    const currentValue = await getSquaresLockedSetting();
    const newValue = !currentValue;

    // If locking the game, generate new random numbers
    if (newValue) {
      await generateAxisNumbers();
      log.info("New axis numbers generated by:", auth.user.email);
    }

    await setSquaresLockedSetting(newValue);
    log.info("squares_locked toggled to:", newValue, "by:", auth.user.email);
    return redirect(returnTo, 302);
  }

  if (action === "set_max_squares") {
    const maxSquares = parseInt(formData.get("max_squares")?.toString() || "5", 10);
    if (maxSquares > 0 && maxSquares <= 100) {
      await setMaxSquaresPerUserSetting(maxSquares);
      log.info("max_squares_per_user set to:", maxSquares, "by:", auth.user.email);
    }
    return redirect(returnTo, 302);
  }

  if (action === "set_score") {
    const quarter = parseInt(formData.get("quarter")?.toString() || "0", 10);
    const seahawksScoreStr = formData.get("seahawks_score")?.toString();
    const patriotsScoreStr = formData.get("patriots_score")?.toString();

    if (quarter >= 1 && quarter <= 4) {
      const seahawksScore = seahawksScoreStr ? parseInt(seahawksScoreStr, 10) : null;
      const patriotsScore = patriotsScoreStr ? parseInt(patriotsScoreStr, 10) : null;

      await setScore(quarter, seahawksScore, patriotsScore);
      log.info(
        `Q${quarter} score set: Seahawks ${seahawksScore}, Patriots ${patriotsScore}`,
        "by:",
        auth.user.email
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
    log.info("Final score set: Seahawks", seahawks, "Patriots", patriots, "by:", auth.user.email);
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
    await upsertPrediction({
      userEmail: proxyEmail,
      userName: predictionName,
      seahawksScore: parseInt(seahawksStr, 10),
      patriotsScore: parseInt(patriotsStr, 10),
      isProxy: true,
      createdBy: auth.user.email,
    });
    log.info("Proxy prediction added for:", predictionName, "by:", auth.user.email);
    return redirect(returnTo, 302);
  }

  if (action === "delete_prediction") {
    const predictionId = parseInt(formData.get("prediction_id")?.toString() || "0", 10);
    if (predictionId > 0) {
      await deletePrediction(predictionId);
      log.info("Prediction deleted:", predictionId, "by:", auth.user.email);
    }
    return redirect(returnTo, 302);
  }

  if (action === "clear_all_squares") {
    await clearAllSquares();
    log.info("All squares cleared by:", auth.user.email);
    return redirect(returnTo, 302);
  }

  if (action === "clear_all_scores") {
    await clearAllScores();
    log.info("All scores cleared by:", auth.user.email);
    return redirect(returnTo, 302);
  }

  if (action === "reset_game") {
    await Promise.all([
      clearAllSquares(),
      clearAllScores(),
      clearAllPredictions(),
      setSquaresLockedSetting(false),
    ]);
    log.info("Game reset by:", auth.user.email);
    return redirect(returnTo, 302);
  }

  log.warn("Unknown squares admin action:", action);
  return redirect(returnTo, 302);
};
