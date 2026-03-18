/**
 * Wumpus World Game Logic
 * Classic AI problem: 4x4 grid with Wumpus, pits, and gold
 * Agent starts at bottom-left (row=3, col=0) in 0-indexed grid
 */

export interface Position {
  row: number; // 0 = top, 3 = bottom
  col: number; // 0 = left, 3 = right
}

export interface WorldState {
  agent: Position;
  wumpus: Position;
  pits: Position[];
  gold: Position;
  status: "playing" | "won" | "lost";
}

export interface Percepts {
  stench: boolean;  // Wumpus is adjacent
  breeze: boolean;  // Pit is adjacent
  glitter: boolean; // Gold is in current cell
}

/** Returns adjacent cells (up/down/left/right) within bounds */
function getAdjacent(pos: Position): Position[] {
  const dirs = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];
  return dirs
    .map((d) => ({ row: pos.row + d.row, col: pos.col + d.col }))
    .filter((p) => p.row >= 0 && p.row <= 3 && p.col >= 0 && p.col <= 3);
}

/** Check if two positions are equal */
function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

/** Generate a random position that is not in the excluded list */
function randomPos(excluded: Position[]): Position {
  let pos: Position;
  do {
    pos = { row: Math.floor(Math.random() * 4), col: Math.floor(Math.random() * 4) };
  } while (excluded.some((e) => posEq(e, pos)));
  return pos;
}

/** Generate a fresh world with random placement */
export function generateWorld(): WorldState {
  // Agent always starts at bottom-left (row=3, col=0)
  const agentStart: Position = { row: 3, col: 0 };

  // Also keep cells adjacent to start safe for a fair game
  const safeZone: Position[] = [
    agentStart,
    { row: 2, col: 0 },
    { row: 3, col: 1 },
  ];

  // Place Wumpus
  const wumpus = randomPos(safeZone);

  // Place 2-3 pits
  const pitCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
  const pits: Position[] = [];
  for (let i = 0; i < pitCount; i++) {
    pits.push(randomPos([...safeZone, wumpus, ...pits]));
  }

  // Place gold (not on agent start, not on wumpus)
  const gold = randomPos([agentStart, wumpus, ...pits]);

  return {
    agent: agentStart,
    wumpus,
    pits,
    gold,
    status: "playing",
  };
}

/** Get percepts for the agent's current position */
export function getPercepts(world: WorldState): Percepts {
  const adjacent = getAdjacent(world.agent);

  const stench = adjacent.some((p) => posEq(p, world.wumpus));
  const breeze = adjacent.some((p) => world.pits.some((pit) => posEq(p, pit)));
  const glitter = posEq(world.agent, world.gold);

  return { stench, breeze, glitter };
}
