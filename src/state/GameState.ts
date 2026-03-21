import { GameState, Entity } from '../types';
import { createGrid, getGoalPosition } from './Grid';
import { createPlayer, createEnemies } from './entities';

export function createInitialState(): GameState {
  return {
    grid: createGrid(),
    player: createPlayer(),
    enemies: createEnemies(),
    goalPos: getGoalPosition(),
    turn: 0,
    status: 'playing',
  };
}

export function cloneState(state: GameState): GameState {
  return {
    grid: state.grid.map(row => [...row]),
    player: { ...state.player },
    enemies: state.enemies.map(e => ({ ...e })),
    goalPos: { ...state.goalPos },
    turn: state.turn,
    status: state.status,
  };
}

export function cloneEntity(entity: Entity): Entity {
  return { ...entity };
}
