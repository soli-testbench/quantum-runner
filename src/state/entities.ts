import { Entity } from '../types';

export function createPlayer(): Entity {
  return { type: 'player', x: 1, y: 8, id: 'player' };
}

export function createEnemies(): Entity[] {
  return [
    { type: 'enemy', x: 5, y: 5, id: 'enemy-1' },
    { type: 'enemy', x: 9, y: 2, id: 'enemy-2' },
  ];
}
