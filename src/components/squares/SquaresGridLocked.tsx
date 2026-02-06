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
                {score?.seahawksScore !== null && score?.patriotsScore !== null ? (
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

      {/* Grid with labels */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            {/* Top axis header - Seahawks */}
            <thead>
              <tr>
                {/* Corner cell */}
                <th className="p-1 w-12 h-12 sm:w-14 sm:h-14"></th>
                {/* Team label spanning columns */}
                <th colSpan={10} className="p-2 text-center">
                  <div className="text-green-400 font-bold text-lg">SEAHAWKS</div>
                </th>
              </tr>
              <tr>
                {/* Corner cell for side label */}
                <th className="p-1 w-12 h-12 sm:w-14 sm:h-14"></th>
                {/* Column numbers */}
                {colNumbers.map((num, idx) => (
                  <th
                    key={idx}
                    className="p-1 w-10 h-10 sm:w-12 sm:h-12 text-center"
                  >
                    <div className="w-full h-full rounded-md bg-green-600/30 border border-green-500/50 flex items-center justify-center text-green-300 font-bold text-lg">
                      {num >= 0 ? num : "?"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Side axis number - Patriots */}
                  <td className="p-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-300 font-bold text-lg">
                      {rowNumbers[rowIndex] >= 0 ? rowNumbers[rowIndex] : "?"}
                    </div>
                  </td>
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
                      <td key={colIndex} className="p-0.5">
                        <div
                          className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-md
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
                                className="w-7 h-7 sm:w-8 sm:h-8"
                              />
                            ) : (
                              <div
                                className={`
                                  w-7 h-7 sm:w-8 sm:h-8 rounded-full
                                  flex items-center justify-center
                                  text-xs font-bold
                                  ${isWinner ? "bg-primary-950 text-gold-400" : "bg-primary-600 text-white"}
                                `}
                              >
                                {(cell.userName || cell.userEmail || "?")[0].toUpperCase()}
                              </div>
                            )
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-primary-600/50"></div>
                          )}
                          {/* Winner badge */}
                          {isWinner && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 rounded-full flex items-center justify-center">
                              <Trophy className="w-2.5 h-2.5 text-primary-950" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Side label - Patriots */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-red-400 font-bold text-lg hidden lg:block" style={{ marginLeft: "-3rem" }}>
            PATRIOTS
          </div>
        </div>
      </div>

      {/* Mobile Patriots label */}
      <div className="mt-2 text-center lg:hidden">
        <span className="text-red-400 font-bold">PATRIOTS</span>
        <span className="text-primary-500 mx-2">|</span>
        <span className="text-primary-400">Side Axis</span>
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
