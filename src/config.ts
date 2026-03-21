export const CONFIG = {
  // Grid
  GRID_COLS: 12,
  GRID_ROWS: 10,
  CELL_SIZE: 52,

  // Futures
  NUM_FUTURES: 3,
  MIN_FUTURES: 2,
  MAX_FUTURES: 5,

  // Enemy AI
  ENEMY_CHASE_BIAS: 0.6,
  ENEMY_RANDOM_MOVE_CHANCE: 0.25,
  ENEMY_STAY_CHANCE: 0.15,

  // Player movement
  PLAYER_GOAL_BIAS: 0.3,
  PLAYER_STAY_CHANCE: 0.1,

  // Colors
  COLOR_BG: '#0a0a0f',
  COLOR_GRID: '#1a3a2a',
  COLOR_PLAYER: '#00ffcc',
  COLOR_ENEMY: '#ff6b35',
  COLOR_GOAL: '#39ff14',
  COLOR_WALL: '#2a2a3a',
  COLOR_FLOOR: '#12121f',
  COLOR_DANGER: '#ff1744',
  COLOR_UI_TEXT: '#b0ffb0',
  COLOR_ACCENT: '#ffeb3b',
  COLOR_FUTURE_GOOD: 'rgba(0, 255, 204, 0.35)',
  COLOR_FUTURE_BAD: 'rgba(255, 23, 68, 0.35)',
  COLOR_FUTURE_NEUTRAL: 'rgba(255, 235, 59, 0.35)',
} as const;
