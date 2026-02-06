import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../lib/auth";
import {
  getSquaresLockedSetting,
  getMaxSquaresPerUserSetting,
} from "../../lib/settings";
import {
  getAllSquares,
  getSquare,
  claimSquare,
  releaseSquare,
  countSquaresByUser,
  buildGrid,
} from "../../lib/squares";
import { logger } from "../../lib/logger";

const log = logger.scope("SQUARES");

/**
 * GET /api/squares
 * Returns the current grid state for polling.
 * Returns 423 if the game is locked (signal to client to refresh).
 */
export const GET: APIRoute = async ({ request }) => {
  // Verify authentication and approval
  const auth = await getUserWithApproval(request);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!auth.isApproved) {
    return new Response(JSON.stringify({ error: "Not approved" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if game is locked
  const squaresLocked = await getSquaresLockedSetting();
  if (squaresLocked) {
    return new Response(JSON.stringify({ error: "Game locked", locked: true }), {
      status: 423,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get grid data
  const [allSquares, userSquareCount, maxSquaresPerUser] = await Promise.all([
    getAllSquares(),
    countSquaresByUser(auth.user.email),
    getMaxSquaresPerUserSetting(),
  ]);

  const grid = buildGrid(allSquares);

  return new Response(
    JSON.stringify({
      grid,
      userSquareCount,
      maxSquaresPerUser,
      userEmail: auth.user.email,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

/**
 * POST /api/squares
 * Claim or release a square.
 * Body: { action: "claim" | "release", row: number, col: number }
 */
export const POST: APIRoute = async ({ request }) => {
  // Verify authentication and approval
  const auth = await getUserWithApproval(request);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!auth.isApproved) {
    return new Response(JSON.stringify({ error: "Not approved" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if game is locked
  const squaresLocked = await getSquaresLockedSetting();
  if (squaresLocked) {
    return new Response(JSON.stringify({ error: "Game locked", locked: true }), {
      status: 423,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse body
  const body = await request.json();
  const { action, row, col } = body;

  // Validate inputs
  if (typeof row !== "number" || typeof col !== "number") {
    return new Response(JSON.stringify({ error: "Invalid coordinates" }), {
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

  if (action === "claim") {
    // Check max squares limit
    const [userSquareCount, maxSquaresPerUser] = await Promise.all([
      countSquaresByUser(auth.user.email),
      getMaxSquaresPerUserSetting(),
    ]);

    if (userSquareCount >= maxSquaresPerUser) {
      return new Response(
        JSON.stringify({
          error: "Maximum squares reached",
          userSquareCount,
          maxSquaresPerUser,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if already taken
    const existing = await getSquare(row, col);
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Square already taken", square: existing }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Claim the square
    const newSquare = await claimSquare(
      row,
      col,
      auth.user.email,
      auth.user.name,
      auth.user.image
    );

    if (!newSquare) {
      return new Response(JSON.stringify({ error: "Failed to claim square" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    log.info("Square claimed:", `(${row},${col})`, "by:", auth.user.email);

    return new Response(
      JSON.stringify({ success: true, square: newSquare }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (action === "release") {
    const released = await releaseSquare(row, col, auth.user.email);

    if (!released) {
      return new Response(
        JSON.stringify({ error: "Cannot release this square" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    log.info("Square released:", `(${row},${col})`, "by:", auth.user.email);

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
