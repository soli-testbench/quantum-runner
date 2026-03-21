import { Entity, Position } from '../types';
import { CONFIG } from '../config';

export function renderPlayer(ctx: CanvasRenderingContext2D, player: Entity): void {
  const { CELL_SIZE, COLOR_PLAYER } = CONFIG;
  const cx = player.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = player.y * CELL_SIZE + CELL_SIZE / 2;
  const r = CELL_SIZE * 0.35;

  // Glow
  ctx.shadowColor = COLOR_PLAYER;
  ctx.shadowBlur = 12;

  // Diamond shape for player (the "observer")
  ctx.fillStyle = COLOR_PLAYER;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();

  // Eye symbol in center
  ctx.shadowBlur = 0;
  ctx.fillStyle = CONFIG.COLOR_BG;
  ctx.font = `bold ${CELL_SIZE * 0.3}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('◉', cx, cy);

  ctx.shadowBlur = 0;
}

export function renderEnemy(ctx: CanvasRenderingContext2D, enemy: Entity): void {
  const { CELL_SIZE, COLOR_ENEMY } = CONFIG;
  const cx = enemy.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = enemy.y * CELL_SIZE + CELL_SIZE / 2;
  const r = CELL_SIZE * 0.32;

  // Glow
  ctx.shadowColor = COLOR_ENEMY;
  ctx.shadowBlur = 8;

  // Triangle shape for enemies
  ctx.fillStyle = COLOR_ENEMY;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy + r * 0.8);
  ctx.lineTo(cx - r, cy + r * 0.8);
  ctx.closePath();
  ctx.fill();

  // X symbol
  ctx.shadowBlur = 0;
  ctx.fillStyle = CONFIG.COLOR_BG;
  ctx.font = `bold ${CELL_SIZE * 0.25}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✕', cx, cy + 2);

  ctx.shadowBlur = 0;
}

export function renderGoalMarker(ctx: CanvasRenderingContext2D, goal: Position): void {
  const { CELL_SIZE, COLOR_GOAL } = CONFIG;
  const cx = goal.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = goal.y * CELL_SIZE + CELL_SIZE / 2;

  // Pulsing ring
  const time = Date.now() / 1000;
  const pulse = 0.4 + 0.2 * Math.sin(time * 3);
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = COLOR_GOAL;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, CELL_SIZE * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
