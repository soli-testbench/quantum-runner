import { Position, CellType } from '../types';
import { getWalkableNeighbors, manhattanDistance } from '../state/Grid';

/**
 * Weighted random pick from an array of (item, weight) tuples.
 */
export function weightedPick<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const { item, weight } of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1]!.item;
}

/**
 * Sample a player move biased toward a target (goal).
 * Also includes a chance to stay in place.
 */
export function samplePlayerMove(
  grid: CellType[][],
  current: Position,
  target: Position,
  goalBias: number,
  stayChance: number,
): Position {
  if (Math.random() < stayChance) return { ...current };

  const neighbors = getWalkableNeighbors(grid, current);
  if (neighbors.length === 0) return { ...current };

  const currentDist = manhattanDistance(current, target);
  const weighted = neighbors.map(n => {
    const dist = manhattanDistance(n, target);
    const improvement = currentDist - dist; // positive = closer to goal
    const weight = improvement > 0 ? 1 + goalBias : improvement < 0 ? Math.max(0.1, 1 - goalBias) : 0.5;
    return { item: n, weight };
  });

  return weightedPick(weighted);
}

/**
 * Sample an enemy move biased toward chasing the player.
 */
export function sampleEnemyMove(
  grid: CellType[][],
  current: Position,
  playerPos: Position,
  chaseBias: number,
  randomChance: number,
  stayChance: number,
): Position {
  if (Math.random() < stayChance) return { ...current };

  const neighbors = getWalkableNeighbors(grid, current);
  if (neighbors.length === 0) return { ...current };

  // Occasionally move randomly
  if (Math.random() < randomChance) {
    return neighbors[Math.floor(Math.random() * neighbors.length)]!;
  }

  const currentDist = manhattanDistance(current, playerPos);
  const weighted = neighbors.map(n => {
    const dist = manhattanDistance(n, playerPos);
    const closer = currentDist - dist;
    const weight = closer > 0 ? 1 + chaseBias : closer < 0 ? Math.max(0.1, 1 - chaseBias) : 0.5;
    return { item: n, weight };
  });

  return weightedPick(weighted);
}
