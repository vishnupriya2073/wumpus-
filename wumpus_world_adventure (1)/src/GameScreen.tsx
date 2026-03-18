import { useState, useEffect, useCallback } from "react";
import { generateWorld, type WorldState, type Position, getPercepts } from "./gameLogic";

interface Props {
  onBack: () => void;
}

const CELL_CONTENT: Record<string, { icon: string; label: string }> = {
  wumpus: { icon: "🧟", label: "Wumpus" },
  pit: { icon: "🕳️", label: "Pit" },
  gold: { icon: "🏆", label: "Gold" },
};

export default function GameScreen({ onBack }: Props) {
  const [world, setWorld] = useState<WorldState>(() => generateWorld());
  const [revealed, setRevealed] = useState<Set<string>>(new Set(["3,0"]));
  const [flash, setFlash] = useState<"danger" | "win" | null>(null);
  const [moveCount, setMoveCount] = useState(0);

  const posKey = (p: Position) => `${p.row},${p.col}`;

  const triggerFlash = (type: "danger" | "win") => {
    setFlash(type);
    setTimeout(() => setFlash(null), 600);
  };

  const move = useCallback(
    (dr: number, dc: number) => {
      if (world.status !== "playing") return;
      const newRow = world.agent.row + dr;
      const newCol = world.agent.col + dc;
      if (newRow < 0 || newRow > 3 || newCol < 0 || newCol > 3) return;

      const newPos: Position = { row: newRow, col: newCol };
      const key = posKey(newPos);

      setRevealed((prev) => new Set([...prev, key]));
      setMoveCount((c) => c + 1);

      const isWumpus = posKey(world.wumpus) === key;
      const isPit = world.pits.some((p) => posKey(p) === key);

      if (isWumpus || isPit) {
        triggerFlash("danger");
        setWorld((w) => ({ ...w, agent: newPos, status: "lost" }));
      } else {
        setWorld((w) => ({ ...w, agent: newPos }));
      }
    },
    [world]
  );

  const grab = useCallback(() => {
    if (world.status !== "playing") return;
    if (posKey(world.agent) === posKey(world.gold)) {
      triggerFlash("win");
      setWorld((w) => ({ ...w, status: "won" }));
    }
  }, [world]);

  const restart = () => {
    setWorld(generateWorld());
    setRevealed(new Set(["3,0"]));
    setMoveCount(0);
    setFlash(null);
  };

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move(-1, 0);
      else if (e.key === "ArrowDown") move(1, 0);
      else if (e.key === "ArrowLeft") move(0, -1);
      else if (e.key === "ArrowRight") move(0, 1);
      else if (e.key === "g" || e.key === "G") grab();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move, grab]);

  const percepts = getPercepts(world);
  const isRevealed = (r: number, c: number) => revealed.has(`${r},${c}`);

  const flashClass =
    flash === "danger"
      ? "ring-4 ring-red-400"
      : flash === "win"
      ? "ring-4 ring-yellow-400"
      : "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 shadow-sm px-4 h-14 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
        >
          ← Back
        </button>
        <h1 className="font-bold text-slate-800 text-lg">🏔️ Wumpus World</h1>
        <button
          onClick={restart}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          🔄 Restart
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
        {/* Left: Grid */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">The Cave</h2>
            <p className="text-sm text-slate-500">Navigate to find the gold</p>
          </div>

          {/* Grid */}
          <div
            className={`bg-white rounded-3xl shadow-lg p-4 border border-slate-100 transition-all duration-300 ${flashClass}`}
          >
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }, (_, row) =>
                Array.from({ length: 4 }, (_, col) => {
                  const isAgent =
                    world.agent.row === row && world.agent.col === col;
                  const rev = isRevealed(row, col);
                  const key = `${row},${col}`;
                  const isWumpus = posKey(world.wumpus) === key;
                  const isPit = world.pits.some((p) => posKey(p) === key);
                  const isGold = posKey(world.gold) === key;
                  const showContent = rev && world.status !== "playing";
                  const showGold = rev && isGold && world.status === "playing";

                  // Cell percept hints (only for revealed cells)
                  const cellPercepts = rev
                    ? getPercepts({ ...world, agent: { row, col } })
                    : { stench: false, breeze: false, glitter: false };

                  return (
                    <div
                      key={key}
                      className={`
                        relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center
                        border-2 transition-all duration-300 select-none
                        ${isAgent
                          ? world.status === "lost"
                            ? "bg-red-100 border-red-400 shadow-md scale-105"
                            : world.status === "won"
                            ? "bg-yellow-100 border-yellow-400 shadow-md scale-105"
                            : "bg-blue-100 border-blue-400 shadow-md scale-105"
                          : rev
                          ? "bg-slate-50 border-slate-200"
                          : "bg-slate-200/60 border-slate-300/50"
                        }
                      `}
                    >
                      {/* Row/col label */}
                      <span className="absolute top-1 left-1.5 text-[9px] text-slate-400 font-mono">
                        {4 - row},{col + 1}
                      </span>

                      {/* Agent */}
                      {isAgent && (
                        <span className="text-2xl md:text-3xl leading-none">
                          {world.status === "lost" ? "💀" : world.status === "won" ? "🎉" : "🤖"}
                        </span>
                      )}

                      {/* Revealed content after game over */}
                      {!isAgent && showContent && (
                        <span className="text-2xl md:text-3xl leading-none">
                          {isWumpus
                            ? "🧟"
                            : isPit
                            ? "🕳️"
                            : isGold
                            ? "🏆"
                            : ""}
                        </span>
                      )}

                      {/* Gold glitter hint while playing */}
                      {!isAgent && showGold && (
                        <span className="text-2xl md:text-3xl leading-none">✨</span>
                      )}

                      {/* Percept dots for revealed cells */}
                      {rev && !isAgent && world.status === "playing" && (
                        <div className="flex gap-0.5 mt-0.5">
                          {cellPercepts.stench && (
                            <span className="text-[10px]" title="Stench">💨</span>
                          )}
                          {cellPercepts.breeze && (
                            <span className="text-[10px]" title="Breeze">🌬️</span>
                          )}
                        </div>
                      )}

                      {/* Unrevealed fog */}
                      {!rev && (
                        <span className="text-2xl text-slate-400">?</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-3 justify-center text-xs text-slate-500">
              <span>🤖 Agent</span>
              <span>💨 Stench</span>
              <span>🌬️ Breeze</span>
              <span>✨ Gold nearby</span>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 w-full max-w-xs">
            <p className="text-xs text-slate-400 text-center mb-3 uppercase tracking-widest">Controls</p>

            {/* D-pad */}
            <div className="grid grid-cols-3 gap-2 mb-3 w-36 mx-auto">
              <div />
              <ControlBtn onClick={() => move(-1, 0)} disabled={world.status !== "playing"} label="↑" title="Up" />
              <div />
              <ControlBtn onClick={() => move(0, -1)} disabled={world.status !== "playing"} label="←" title="Left" />
              <div className="flex items-center justify-center text-slate-300 text-xs">🤖</div>
              <ControlBtn onClick={() => move(0, 1)} disabled={world.status !== "playing"} label="→" title="Right" />
              <div />
              <ControlBtn onClick={() => move(1, 0)} disabled={world.status !== "playing"} label="↓" title="Down" />
              <div />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={grab}
                disabled={world.status !== "playing"}
                className="flex-1 py-2.5 rounded-xl bg-yellow-100 text-yellow-800 font-semibold text-sm hover:bg-yellow-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 border border-yellow-200"
              >
                🤲 Grab
              </button>
              <button
                onClick={restart}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 border border-slate-200"
              >
                🔄 Restart
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-3">
              Keyboard: Arrow keys + G to grab
            </p>
          </div>
        </div>

        {/* Right: Status Panel */}
        <div className="lg:w-72 flex flex-col gap-4">
          {/* Game Status */}
          <StatusCard world={world} moveCount={moveCount} />

          {/* Current Percepts */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">
              Current Percepts
            </h3>
            <div className="flex flex-col gap-2">
              <PerceptRow
                icon="💨"
                name="Stench"
                active={percepts.stench}
                desc="Wumpus nearby!"
                activeColor="bg-purple-100 border-purple-300 text-purple-800"
              />
              <PerceptRow
                icon="🌬️"
                name="Breeze"
                active={percepts.breeze}
                desc="Pit nearby!"
                activeColor="bg-blue-100 border-blue-300 text-blue-800"
              />
              <PerceptRow
                icon="✨"
                name="Glitter"
                active={percepts.glitter}
                desc="Gold is here!"
                activeColor="bg-yellow-100 border-yellow-300 text-yellow-800"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">
              How to Play
            </h3>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex gap-2">
                <span>🤖</span>
                <span>You start at cell (1,1) — bottom-left</span>
              </li>
              <li className="flex gap-2">
                <span>💨</span>
                <span>Stench means Wumpus is adjacent</span>
              </li>
              <li className="flex gap-2">
                <span>🌬️</span>
                <span>Breeze means a pit is adjacent</span>
              </li>
              <li className="flex gap-2">
                <span>✨</span>
                <span>Glitter means gold is in this cell</span>
              </li>
              <li className="flex gap-2">
                <span>🤲</span>
                <span>Press Grab when on the gold to win!</span>
              </li>
              <li className="flex gap-2">
                <span>☠️</span>
                <span>Avoid the Wumpus and pits!</span>
              </li>
            </ul>
          </div>

          {/* Game over overlay card */}
          {world.status !== "playing" && (
            <div
              className={`rounded-3xl p-6 text-center shadow-lg border-2 ${
                world.status === "won"
                  ? "bg-yellow-50 border-yellow-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="text-5xl mb-3">
                {world.status === "won" ? "🎉" : "💀"}
              </div>
              <h2 className="text-2xl font-bold mb-1">
                {world.status === "won" ? "You Won!" : "Game Over"}
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                {world.status === "won"
                  ? `You found the gold in ${moveCount} moves!`
                  : "You fell into a trap. Better luck next time!"}
              </p>
              <button
                onClick={restart}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold hover:scale-105 transition-all shadow-md"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ControlBtn({
  onClick,
  disabled,
  label,
  title,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-full aspect-square rounded-xl bg-slate-100 text-slate-700 font-bold text-lg hover:bg-blue-100 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-90 border border-slate-200 hover:border-blue-300 shadow-sm"
    >
      {label}
    </button>
  );
}

function StatusCard({
  world,
  moveCount,
}: {
  world: WorldState;
  moveCount: number;
}) {
  const statusConfig = {
    playing: { label: "Playing", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    won: { label: "Won! 🎉", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    lost: { label: "Lost 💀", color: "bg-red-100 text-red-700 border-red-200" },
  };
  const s = statusConfig[world.status];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
      <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">
        Status
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Position</span>
          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-sm">
            ({world.agent.col + 1}, {4 - world.agent.row})
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Moves</span>
          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-sm">
            {moveCount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Game Status</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
            {s.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function PerceptRow({
  icon,
  name,
  active,
  desc,
  activeColor,
}: {
  icon: string;
  name: string;
  active: boolean;
  desc: string;
  activeColor: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 ${
        active ? activeColor : "bg-slate-50 border-slate-200 text-slate-400"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className={`text-sm font-semibold ${active ? "" : "text-slate-400"}`}>{name}</div>
        {active && <div className="text-xs opacity-75">{desc}</div>}
      </div>
      <div
        className={`w-2 h-2 rounded-full transition-all ${
          active ? "bg-current animate-pulse" : "bg-slate-300"
        }`}
      />
    </div>
  );
}
