import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, User, X } from "lucide-react";
import type { Square } from "../../db";

interface SquaresGridPickerProps {
  initialGrid: (Square | null)[][];
  initialUserSquareCount: number;
  maxSquaresPerUser: number;
  userEmail: string;
  userName: string | null;
}

export function SquaresGridPicker({
  initialGrid,
  initialUserSquareCount,
  maxSquaresPerUser,
  userEmail,
  userName,
}: SquaresGridPickerProps) {
  const [grid, setGrid] = useState<(Square | null)[][]>(initialGrid);
  const [userSquareCount, setUserSquareCount] = useState(initialUserSquareCount);
  const [loading, setLoading] = useState<{ row: number; col: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for grid updates
  const fetchGrid = useCallback(async () => {
    try {
      const response = await fetch("/api/squares", {
        credentials: "include",
      });

      if (response.status === 423) {
        // Game locked - stop polling and refresh page
        setPolling(false);
        window.location.reload();
        return;
      }

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setGrid(data.grid);
      setUserSquareCount(data.userSquareCount);
    } catch {
      // Silent fail on polling errors
    }
  }, []);

  // Set up polling
  useEffect(() => {
    if (!polling) return;

    // Initial fetch
    fetchGrid();

    // Poll every 2 seconds
    pollIntervalRef.current = setInterval(fetchGrid, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchGrid, polling]);

  // Claim a square
  const handleClaim = async (row: number, col: number) => {
    if (loading) return;
    if (userSquareCount >= maxSquaresPerUser) {
      setError(`You've reached the maximum of ${maxSquaresPerUser} squares`);
      return;
    }

    setLoading({ row, col });
    setError(null);

    try {
      const response = await fetch("/api/squares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "claim", row, col }),
      });

      if (response.status === 423) {
        setPolling(false);
        window.location.reload();
        return;
      }

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
      setUserSquareCount((prev) => prev + 1);
    } catch {
      setError("Network error - please try again");
    } finally {
      setLoading(null);
    }
  };

  // Release a square
  const handleRelease = async (row: number, col: number) => {
    if (loading) return;

    setLoading({ row, col });
    setError(null);

    try {
      const response = await fetch("/api/squares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "release", row, col }),
      });

      if (response.status === 423) {
        setPolling(false);
        window.location.reload();
        return;
      }

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
      setUserSquareCount((prev) => prev - 1);
    } catch {
      setError("Network error - please try again");
    } finally {
      setLoading(null);
    }
  };

  const canClaimMore = userSquareCount < maxSquaresPerUser;

  return (
    <div className="w-full">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-4 bg-primary-800/50 rounded-lg">
        <div className="flex items-center gap-2 text-primary-300">
          <User className="w-4 h-4" />
          <span>
            Your squares: <span className="text-white font-bold">{userSquareCount}</span> / {maxSquaresPerUser}
          </span>
        </div>
        <div className="flex items-center gap-2 text-primary-400 text-sm">
          <RefreshCw className={`w-4 h-4 ${polling ? "animate-spin" : ""}`} />
          <span>Auto-updating</span>
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
          <span>Click an empty square to claim it. Click your squares again to release them.</span>
        ) : (
          <span>Maximum squares reached. Release a square to claim a different one.</span>
        )}
      </div>

      {/* Grid */}
      <div className="w-full overflow-x-auto -mx-2 px-2">
        <div className="grid grid-cols-10 gap-0.5 sm:gap-1 w-full min-w-[280px] max-w-[600px] mx-auto aspect-square">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isLoading =
                loading?.row === rowIndex && loading?.col === colIndex;
              const isOwned = cell?.userEmail === userEmail;
              const isEmpty = !cell;

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() =>
                    isEmpty
                      ? handleClaim(rowIndex, colIndex)
                      : isOwned
                        ? handleRelease(rowIndex, colIndex)
                        : undefined
                  }
                  disabled={
                    isLoading ||
                    (!isEmpty && !isOwned) ||
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
                        : isOwned
                          ? "bg-gold-500 text-primary-950 border-2 border-gold-400 hover:bg-gold-400 cursor-pointer"
                          : "bg-primary-600 text-primary-300 border border-primary-500 cursor-not-allowed"
                    }
                    ${isLoading ? "opacity-50 animate-pulse" : ""}
                  `}
                  title={
                    cell
                      ? `${cell.userName || cell.userEmail}${isOwned ? " (click to release)" : ""}`
                      : canClaimMore
                        ? "Click to claim"
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
          <span>Your squares</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-600 border border-primary-500 rounded"></div>
          <span>Taken</span>
        </div>
      </div>
    </div>
  );
}
