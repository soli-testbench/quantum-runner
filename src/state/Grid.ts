import { CellType, Position } from '../types';
import { CONFIG } from '../config';

const W: CellType = 'wall';
const F: CellType = 'floor';
const G: CellType = 'goal';

// 12x10 grid — corridors with dead ends for interesting choices
// Row 0 = top, Row 9 = bottom
const LEVEL: CellType[][] = [
  [W, W, W, W, W, W, W, W, W, W, W, W],
  [W, F, F, F, W, F, F, F, F, F, G, W],
  [W, F, W, F, W, F, W, W, W, F, F, W],
  [W, F, W, F, F, F, F, F, W, F, W, W],
  [W, F, W, W, W, F, W, F, F, F, F, W],
  [W, F, F, F, F, F, W, F, W, W, F, W],
  [W, W, W, F, W, W, W, F, F, F, F, W],
  [W, F, F, F, F, F, F, F, W, F, W, W],
  [W, F, W, F, W, F, W, F, F, F, F, W],
  [W, W, W, W, W, W, W, W, W, W, W, W],
];

export function createGrid(): CellType[][] {
  return LEVEL.map(row => [...row]);
}

export function getGoalPosition(): Position {
  for (let y = 0; y < LEVEL.length; y++) {
    const row = LEVEL[y]!;
    for (let x = 0; x < row.length; x++) {
      if (row[x] === 'goal') return { x, y };
    }
  }
  return { x: 10, y: 1 }; // fallback
}

export function isWalkable(grid: CellType[][], x: number, y: number): boolean {
  if (x < 0 || y < 0 || y >= CONFIG.GRID_ROWS || x >= CONFIG.GRID_COLS) return false;
  const cell = grid[y]?.[x];
  return cell === 'floor' || cell === 'goal';
}

export function getWalkableNeighbors(grid: CellType[][], pos: Position): Position[] {
  const dirs = [
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x + 1, y: pos.y },
  ];
  return dirs.filter(p => isWalkable(grid, p.x, p.y));
}

export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
