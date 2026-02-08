import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, User, X, UserPlus, Trash2 } from "lucide-react";
import type { Square } from "../../db";
import { Button } from "../ui";

interface AdminProxyGridPickerProps {
  initialGrid: (Square | null)[][];
  maxSquaresPerUser: number;
  apiBaseUrl: string;
}

export function AdminProxyGridPicker({
  initialGrid,
  maxSquaresPerUser,
  apiBaseUrl,
}: AdminProxyGridPickerProps) {
  const [grid, setGrid] = useState<(Square | null)[][]>(initialGrid);
  const [proxyName, setProxyName] = useState("");
  const [pickingMode, setPickingMode] = useState(false);
  const [proxySquareCount, setProxySquareCount] = useState(0);
  const [loading, setLoading] = useState<{ row: number; col: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const proxyEmail = proxyName
    ? `proxy_${proxyName.toLowerCase().replace(/\s+/g, "_")}@proxy.local`
    : "";

  // Count squares for current proxy
  const recountProxy = useCallback(
    (currentGrid: (Square | null)[][]) => {
      if (!proxyEmail) {
        setProxySquareCount(0);
        return;
      }
      let count = 0;
      for (const row of currentGrid) {
        for (const cell of row) {
          if (cell?.userEmail === proxyEmail) count++;
        }
      }
      setProxySquareCount(count);
    },
    [proxyEmail]
  );

  // Fetch grid from admin endpoint
  const fetchGrid = useCallback(async () => {
    try {
      const response = await fetch(apiBaseUrl, {
        credentials: "include",
      });
      if (!response.ok) return;
      const data = await response.json();
      setGrid(data.grid);
      return data.grid;
    } catch {
      // Silent fail on polling errors
    }
    return null;
  }, []);

  // Set up polling
  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(async () => {
      const newGrid = await fetchGrid();
      if (newGrid) recountProxy(newGrid);
    }, 3000);
    pollIntervalRef.current = interval;

    return () => clearInterval(interval);
  }, [fetchGrid, polling, recountProxy]);

  // Recount when proxy name changes
  useEffect(() => {
    recountProxy(grid);
  }, [proxyEmail, grid, recountProxy]);

  // Enter picking mode
  const enterPickingMode = () => {
    if (!proxyName.trim()) {
      setError("Enter a proxy player name first");
      return;
    }
    setPickingMode(true);
    setError(null);
    setSuccessMsg(null);
  };

  // Exit picking mode
  const exitPickingMode = () => {
    setPickingMode(false);
    setError(null);
    setSuccessMsg(null);
  };

  // Claim a square for proxy
  const handleClaim = async (row: number, col: number) => {
    if (loading) return;
    if (proxySquareCount >= maxSquaresPerUser) {
      setError(`${proxyName} has reached the maximum of ${maxSquaresPerUser} squares`);
      return;
    }

    setLoading({ row, col });
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(apiBaseUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "proxy_claim", row, col, proxyName: proxyName.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setError("Square was just taken by someone else");
          await fetchGrid();
        } else {
          setError(data.error || "Failed to claim square");
        }
        return;
      }

      // Update grid optimistically
      setGrid((prev) => {
        const newGrid = prev.map((r) => [...r]);
        newGrid[row][col] = data.square;
        return newGrid;
      });
      setProxySquareCount((prev) => prev + 1);
    } catch {
      setError("Network error - please try again");
    } finally {
      setLoading(null);
    }
  };

  // Release a square (admin can release any proxy square)
  const handleRelease = async (row: number, col: number) => {
    if (loading) return;

    setLoading({ row, col });
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(apiBaseUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "proxy_release", row, col }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to release square");
        return;
      }

      // Update grid optimistically
      setGrid((prev) => {
        const newGrid = prev.map((r) => [...r]);
        newGrid[row][col] = null;
        return newGrid;
      });
      setProxySquareCount((prev) => Math.max(0, prev - 1));
    } catch {
      setError("Network error - please try again");
    } finally {
      setLoading(null);
    }
  };

  // Release all squares for this proxy
  const handleReleaseAll = async () => {
    if (loading || !proxyName.trim()) return;

    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(apiBaseUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "release_all_by_user", proxyName: proxyName.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to release squares");
        return;
      }

      setSuccessMsg(`Released ${data.releasedCount} square(s) for ${proxyName}`);
      setProxySquareCount(0);

      // Refresh the grid
      const newGrid = await fetchGrid();
      if (newGrid) recountProxy(newGrid);
    } catch {
      setError("Network error - please try again");
    }
  };

  const canClaimMore = proxySquareCount < maxSquaresPerUser;

  if (!pickingMode) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-primary-400">
          Enter a proxy player's name, then click squares on the grid to pick on their behalf.
          You can also remove all picks for a proxy player.
        </p>

        <div>
          <label className="text-white text-sm font-medium mb-1 block">
            Player Name
          </label>
          <input
            type="text"
            value={proxyName}
            onChange={(e) => setProxyName(e.target.value)}
            placeholder="e.g. Uncle Dave"
            className="w-full max-w-xs px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {successMsg}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm" onClick={enterPickingMode}>
            <UserPlus className="w-4 h-4" />
            Enter Picking Mode
          </Button>

          {proxyName.trim() && proxySquareCount > 0 && (
            <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20" onClick={handleReleaseAll}>
              <Trash2 className="w-4 h-4" />
              Remove All Picks for {proxyName} ({proxySquareCount})
            </Button>
          )}
        </div>

        {proxyName.trim() && proxySquareCount > 0 && (
          <p className="text-sm text-primary-400">
            {proxyName} currently has <span className="text-white font-bold">{proxySquareCount}</span> square(s).
          </p>
        )}
      </div>
    );
  }

  // Picking mode - show the interactive grid
  return (
    <div className="w-full">
      {/* Proxy info bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
        <div className="flex items-center gap-3">
          <UserPlus className="w-5 h-5 text-gold-400" />
          <div>
            <p className="text-white font-medium">Picking for: <span className="text-gold-400">{proxyName}</span></p>
            <p className="text-sm text-primary-400">
              Squares: <span className="text-white font-bold">{proxySquareCount}</span> / {maxSquaresPerUser}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary-400 text-sm">
            <RefreshCw className={`w-4 h-4 ${polling ? "animate-spin" : ""}`} />
            <span>Auto-updating</span>
          </div>
          <Button variant="secondary" size="sm" onClick={exitPickingMode}>
            Done
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="mb-4 text-sm text-primary-400">
        {canClaimMore ? (
          <span>Click an empty square to claim it for {proxyName}. Click {proxyName}'s squares to release them.</span>
        ) : (
          <span>Maximum squares reached for {proxyName}. Release a square to claim a different one.</span>
        )}
      </div>

      {/* Grid */}
      <div className="w-full overflow-x-auto -mx-2 px-2">
        <div className="grid grid-cols-10 gap-0.5 sm:gap-1 w-full min-w-[280px] max-w-[600px] mx-auto aspect-square">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isLoading =
                loading?.row === rowIndex && loading?.col === colIndex;
              const isProxyOwned = cell?.userEmail === proxyEmail;
              const isEmpty = !cell;

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() =>
                    isEmpty
                      ? handleClaim(rowIndex, colIndex)
                      : isProxyOwned
                        ? handleRelease(rowIndex, colIndex)
                        : undefined
                  }
                  disabled={
                    isLoading ||
                    (!isEmpty && !isProxyOwned) ||
                    (isEmpty && !canClaimMore)
                  }
                  className={`
                    aspect-square rounded-sm sm:rounded-md
                    flex items-center justify-center
                    text-[10px] sm:text-xs font-medium
                    transition-all duration-150
                    ${
                      isEmpty
                        ? canClaimMore
                          ? "bg-primary-700 hover:bg-gold-500/30 hover:border-gold-500 border border-primary-600 cursor-pointer"
                          : "bg-primary-800 border border-primary-700 cursor-not-allowed opacity-50"
                        : isProxyOwned
                          ? "bg-gold-500 text-primary-950 border-2 border-gold-400 hover:bg-gold-400 cursor-pointer"
                          : "bg-primary-600 text-primary-300 border border-primary-500 cursor-not-allowed"
                    }
                    ${isLoading ? "opacity-50 animate-pulse" : ""}
                  `}
                  title={
                    cell
                      ? `${cell.userName || cell.userEmail}${isProxyOwned ? " (click to release)" : ""}`
                      : canClaimMore
                        ? `Click to claim for ${proxyName}`
                        : "Maximum squares reached"
                  }
                >
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : cell ? (
                    <span className="truncate px-0.5">
                      {(cell.userName || cell.userEmail || "?")[0].toUpperCase()}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-primary-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-700 border border-primary-600 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gold-500 border-2 border-gold-400 rounded"></div>
          <span>{proxyName}'s squares</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-600 border border-primary-500 rounded"></div>
          <span>Taken</span>
        </div>
      </div>

      {/* Actions at bottom */}
      <div className="mt-4 flex flex-wrap gap-3">
        {proxySquareCount > 0 && (
          <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20" onClick={handleReleaseAll}>
            <Trash2 className="w-4 h-4" />
            Remove All Picks for {proxyName} ({proxySquareCount})
          </Button>
        )}
      </div>
    </div>
  );
}
