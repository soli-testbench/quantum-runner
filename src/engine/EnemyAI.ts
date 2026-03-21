import { Entity, CellType } from '../types';
import { CONFIG } from '../config';
import { sampleEnemyMove } from './movement';

export function moveEnemy(
  enemy: Entity,
  playerPos: { x: number; y: number },
  grid: CellType[][],
): Entity {
  const newPos = sampleEnemyMove(
    grid,
    enemy,
    playerPos,
    CONFIG.ENEMY_CHASE_BIAS,
    CONFIG.ENEMY_RANDOM_MOVE_CHANCE,
    CONFIG.ENEMY_STAY_CHANCE,
  );
  return { ...enemy, x: newPos.x, y: newPos.y };
}
