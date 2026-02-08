import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../../lib/auth";
import { getGameBySlug, getUserGameAccess } from "../../../lib/games";
import {
  getAllSquares,
  getSquare,
  claimSquare,
  releaseSquare,
  countSquaresByUser,
  buildGrid,
} from "../../../lib/squares";
import { logger } from "../../../lib/logger";

const log = logger.scope("SQUARES");

/**
 * GET /api/squares/:slug
 * Returns the current grid state for polling.
 * Returns 423 if the game is locked (signal to client to refresh).
 */
export const GET: APIRoute = async ({ request, params }) => {
  const { slug } = params;

  const auth = await getUserWithApproval(request);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const game = await getGameBySlug(slug!);
  if (!game) {
    return new Response(JSON.stringify({ error: "Game not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const access = await getUserGameAccess(auth.user.email, game.id);
  if (!access) {
    return new Response(JSON.stringify({ error: "No access to this game" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (game.isLocked) {
    return new Response(
      JSON.stringify({ error: "Game locked", locked: true }),
      {
        status: 423,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const [allSquares, userSquareCount] = await Promise.all([
    getAllSquares(game.id),
    countSquaresByUser(game.id, auth.user.email),
  ]);

  const grid = buildGrid(allSquares);

  return new Response(
    JSON.stringify({
      grid,
      userSquareCount,
      maxSquaresPerUser: game.maxSquaresPerUser,
      userEmail: auth.user.email,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

/**
 * POST /api/squares/:slug
 * Claim or release a square.
 * Body: { action: "claim" | "release", row: number, col: number }
 */
export const POST: APIRoute = async ({ request, params }) => {
  const { slug } = params;

  const auth = await getUserWithApproval(request);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const game = await getGameBySlug(slug!);
  if (!game) {
    return new Response(JSON.stringify({ error: "Game not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const access = await getUserGameAccess(auth.user.email, game.id);
  if (!access) {
    return new Response(JSON.stringify({ error: "No access to this game" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (game.isLocked) {
    return new Response(
      JSON.stringify({ error: "Game locked", locked: true }),
      {
        status: 423,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const body = await request.json();
  const { action, row, col } = body;

  if (typeof row !== "number" || typeof col !== "number") {
    return new Response(JSON.stringify({ error: "Invalid coordinates" }), {
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

  if (action === "claim") {
    const userSquareCount = await countSquaresByUser(
      game.id,
      auth.user.email
    );

    if (userSquareCount >= game.maxSquaresPerUser) {
      return new Response(
        JSON.stringify({
          error: "Maximum squares reached",
          userSquareCount,
          maxSquaresPerUser: game.maxSquaresPerUser,
        }),
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
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newSquare = await claimSquare(
      game.id,
      row,
      col,
      auth.user.email,
      auth.user.name,
      auth.user.image
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
      "Square claimed:",
      `(${row},${col})`,
      "in:",
      slug,
      "by:",
      auth.user.email
    );

    return new Response(
      JSON.stringify({ success: true, square: newSquare }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (action === "release") {
    const released = await releaseSquare(
      game.id,
      row,
      col,
      auth.user.email
    );

    if (!released) {
      return new Response(
        JSON.stringify({ error: "Cannot release this square" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    log.info(
      "Square released:",
      `(${row},${col})`,
      "in:",
      slug,
      "by:",
      auth.user.email
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};
