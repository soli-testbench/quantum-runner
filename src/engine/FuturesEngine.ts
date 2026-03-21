import { GameState, Future } from '../types';
import { CONFIG } from '../config';
import { cloneState } from '../state/GameState';
import { samplePlayerMove } from './movement';
import { moveEnemy } from './EnemyAI';
import { manhattanDistance } from '../state/Grid';

function generateOneFuture(state: GameState): Future {
  const next = cloneState(state);
  next.turn = state.turn + 1;

  // Move player
  const playerMove = samplePlayerMove(
    next.grid,
    state.player,
    state.goalPos,
    CONFIG.PLAYER_GOAL_BIAS,
    CONFIG.PLAYER_STAY_CHANCE,
  );
  next.player.x = playerMove.x;
  next.player.y = playerMove.y;

  // Move enemies
  next.enemies = state.enemies.map(e => moveEnemy(e, playerMove, next.grid));

  // Check win/lose
  if (next.player.x === next.goalPos.x && next.player.y === next.goalPos.y) {
    next.status = 'won';
  } else {
    for (const enemy of next.enemies) {
      if (enemy.x === next.player.x && enemy.y === next.player.y) {
        next.status = 'lost';
        break;
      }
    }
  }

  // Compute quality: based on distance to goal and proximity to enemies
  const distToGoal = manhattanDistance(next.player, next.goalPos);
  const prevDistToGoal = manhattanDistance(state.player, state.goalPos);
  const goalImprovement = prevDistToGoal - distToGoal;

  const minEnemyDist = Math.min(...next.enemies.map(e => manhattanDistance(next.player, e)));
  const prevMinEnemyDist = Math.min(...state.enemies.map(e => manhattanDistance(state.player, e)));
  const enemyChange = minEnemyDist - prevMinEnemyDist; // positive = enemies farther

  let quality = 0;
  if (next.status === 'won') quality = 1;
  else if (next.status === 'lost') quality = -1;
  else {
    quality = (goalImprovement * 0.4 + enemyChange * 0.3) / 2;
    quality = Math.max(-1, Math.min(1, quality));
  }

  // Description
  let desc = '';
  if (next.status === 'won') {
    desc = 'You reach the exit! Victory!';
  } else if (next.status === 'lost') {
    desc = 'An enemy catches you! Captured!';
  } else {
    const dirX = playerMove.x - state.player.x;
    const dirY = playerMove.y - state.player.y;
    const moveDir =
      dirX === 0 && dirY === 0 ? 'stays in place' :
      dirX > 0 ? 'moves right' :
      dirX < 0 ? 'moves left' :
      dirY < 0 ? 'moves up' : 'moves down';
    const dangerLevel = minEnemyDist <= 2 ? ' (danger nearby!)' : minEnemyDist <= 4 ? '' : ' (safe zone)';
    desc = `Observer ${moveDir}${dangerLevel}`;
  }

  return { state: next, description: desc, quality };
}

export function generateFutures(state: GameState, count: number = CONFIG.NUM_FUTURES): Future[] {
  const n = Math.max(CONFIG.MIN_FUTURES, Math.min(CONFIG.MAX_FUTURES, count));
  const futures: Future[] = [];

  // Generate candidates — oversample to ensure quality spread
  const candidates: Future[] = [];
  const attempts = n * 4;
  for (let i = 0; i < attempts; i++) {
    candidates.push(generateOneFuture(state));
  }

  // Sort by quality
  candidates.sort((a, b) => b.quality - a.quality);

  // Pick with spread: best, worst, and fill from middle
  if (candidates.length >= n) {
    futures.push(candidates[0]!); // best
    futures.push(candidates[candidates.length - 1]!); // worst
    // Fill remaining from evenly spaced positions
    const remaining = n - 2;
    for (let i = 0; i < remaining; i++) {
      const idx = Math.floor((i + 1) * (candidates.length / (remaining + 1)));
      futures.push(candidates[idx]!);
    }
  } else {
    futures.push(...candidates);
  }

  // Shuffle so the player doesn't know best is always first
  for (let i = futures.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [futures[i], futures[j]] = [futures[j]!, futures[i]!];
  }

  return futures;
}
