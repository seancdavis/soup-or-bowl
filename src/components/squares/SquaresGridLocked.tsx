import { Trophy } from "lucide-react";
import type { Square, SquaresScore } from "../../db";
import { Avatar } from "../ui";

interface WinnerInfo {
  quarter: number;
  seahawksLastDigit: number | null;
  patriotsLastDigit: number | null;
  winningSquare: Square | null;
}

interface SquaresGridLockedProps {
  grid: (Square | null)[][];
  rowNumbers: number[];
  colNumbers: number[];
  scores: SquaresScore[];
  winners: WinnerInfo[];
}

export function SquaresGridLocked({
  grid,
  rowNumbers,
  colNumbers,
  scores,
  winners,
}: SquaresGridLockedProps) {
  // Get winning squares for highlighting
  const winningSquaresSet = new Set<string>();
  for (const w of winners) {
    if (w.winningSquare) {
      winningSquaresSet.add(`${w.winningSquare.row}-${w.winningSquare.col}`);
    }
  }

  // Get score for each quarter
  const getScore = (quarter: number) => {
    return scores.find((s) => s.quarter === quarter);
  };

  return (
    <div className="w-full">
      {/* Scores section */}
      <div className="mb-6 p-4 bg-primary-800/50 rounded-lg">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold-400" />
          Quarter Scores
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((quarter) => {
            const score = getScore(quarter);
            const winner = winners.find((w) => w.quarter === quarter);
            const hasWinner = winner?.winningSquare;

            return (
              <div
                key={quarter}
                className={`p-3 rounded-lg border ${
                  hasWinner
                    ? "bg-gold-500/10 border-gold-500/50"
                    : "bg-primary-900/50 border-primary-700"
                }`}
              >
                <div className="text-xs text-primary-400 mb-1">Q{quarter}</div>
                {score && score.seahawksScore !== null && score.patriotsScore !== null ? (
                  <>
                    <div className="text-white font-medium">
                      SEA {score.seahawksScore} - {score.patriotsScore} NE
                    </div>
                    {hasWinner && (
                      <div className="text-xs text-gold-400 mt-1">
                        Winner: {winner?.winningSquare?.userName || winner?.winningSquare?.userEmail}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-primary-500 text-sm">No score</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team labels */}
      <div className="flex items-center gap-4 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-600/30 border border-green-500/50"></div>
          <span className="text-green-400 font-bold text-sm">SEAHAWKS</span>
          <span className="text-primary-500 text-xs">(columns)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-600/30 border border-red-500/50"></div>
          <span className="text-red-400 font-bold text-sm">PATRIOTS</span>
          <span className="text-primary-500 text-xs">(rows)</span>
        </div>
      </div>

      {/* Grid with axis numbers */}
      <div className="w-full overflow-x-auto -mx-2 px-2">
        <div className="min-w-[320px] max-w-[650px] mx-auto">
          {/* Column numbers header */}
          <div className="grid gap-0.5 sm:gap-1 mb-0.5 sm:mb-1" style={{ gridTemplateColumns: "minmax(24px, 1fr) repeat(10, minmax(0, 1fr))" }}>
            {/* Corner spacer */}
            <div></div>
            {colNumbers.map((num, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-sm sm:rounded-md bg-green-600/30 border border-green-500/50 flex items-center justify-center text-green-300 font-bold text-xs sm:text-base"
              >
                {num >= 0 ? num : "?"}
              </div>
            ))}
          </div>

          {/* Grid rows with row numbers */}
          {grid.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-0.5 sm:gap-1 mb-0.5 sm:mb-1"
              style={{ gridTemplateColumns: "minmax(24px, 1fr) repeat(10, minmax(0, 1fr))" }}
            >
              {/* Row number */}
              <div className="aspect-square rounded-sm sm:rounded-md bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-300 font-bold text-xs sm:text-base">
                {rowNumbers[rowIndex] >= 0 ? rowNumbers[rowIndex] : "?"}
              </div>

              {/* Grid cells */}
              {row.map((cell, colIndex) => {
                const isWinner = winningSquaresSet.has(`${rowIndex}-${colIndex}`);
                const winningQuarters = winners
                  .filter(
                    (w) =>
                      w.winningSquare?.row === rowIndex &&
                      w.winningSquare?.col === colIndex
                  )
                  .map((w) => w.quarter);

                return (
                  <div
                    key={colIndex}
                    className={`
                      aspect-square rounded-sm sm:rounded-md
                      flex items-center justify-center
                      relative
                      ${
                        isWinner
                          ? "bg-gold-500 border-2 border-gold-400 ring-2 ring-gold-500/50"
                          : cell
                            ? "bg-primary-700 border border-primary-600"
                            : "bg-primary-800/50 border border-primary-700"
                      }
                    `}
                    title={
                      cell
                        ? `${cell.userName || cell.userEmail}${isWinner ? ` - Won Q${winningQuarters.join(", Q")}` : ""}`
                        : "Unclaimed"
                    }
                  >
                    {cell ? (
                      cell.userImage ? (
                        <Avatar
                          src={cell.userImage}
                          name={cell.userName}
                          email={cell.userEmail}
                          size="sm"
                          className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8"
                        />
                      ) : (
                        <div
                          className={`
                            w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full
                            flex items-center justify-center
                            text-[8px] sm:text-xs font-bold
                            ${isWinner ? "bg-primary-950 text-gold-400" : "bg-primary-600 text-white"}
                          `}
                        >
                          {(cell.userName || cell.userEmail || "?")[0].toUpperCase()}
                        </div>
                      )
                    ) : (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary-600/50"></div>
                    )}
                    {/* Winner badge */}
                    {isWinner && (
                      <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gold-400 rounded-full flex items-center justify-center">
                        <Trophy className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary-950" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-primary-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-700 border border-primary-600 rounded"></div>
          <span>Claimed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gold-500 border-2 border-gold-400 rounded relative">
            <Trophy className="w-2 h-2 text-primary-950 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span>Winner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-800/50 border border-primary-700 rounded"></div>
          <span>Unclaimed</span>
        </div>
      </div>
    </div>
  );
}
