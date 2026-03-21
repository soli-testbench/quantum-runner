import { GameState, Future } from '../types';
import { CONFIG } from '../config';

export function renderFutureOverlay(
  ctx: CanvasRenderingContext2D,
  current: GameState,
  future: Future,
): void {
  const { CELL_SIZE } = CONFIG;
  const next = future.state;

  // Determine overlay color based on quality
  let overlayColor: string;
  if (future.quality > 0.15) {
    overlayColor = CONFIG.COLOR_FUTURE_GOOD;
  } else if (future.quality < -0.15) {
    overlayColor = CONFIG.COLOR_FUTURE_BAD;
  } else {
    overlayColor = CONFIG.COLOR_FUTURE_NEUTRAL;
  }

  // Draw ghost player at future position
  const fpx = next.player.x * CELL_SIZE + CELL_SIZE / 2;
  const fpy = next.player.y * CELL_SIZE + CELL_SIZE / 2;
  const cpx = current.player.x * CELL_SIZE + CELL_SIZE / 2;
  const cpy = current.player.y * CELL_SIZE + CELL_SIZE / 2;

  // Arrow from current to future player position
  if (next.player.x !== current.player.x || next.player.y !== current.player.y) {
    ctx.strokeStyle = CONFIG.COLOR_PLAYER;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(cpx, cpy);
    ctx.lineTo(fpx, fpy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead
    const angle = Math.atan2(fpy - cpy, fpx - cpx);
    const headLen = 10;
    ctx.beginPath();
    ctx.moveTo(fpx, fpy);
    ctx.lineTo(fpx - headLen * Math.cos(angle - 0.4), fpy - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(fpx - headLen * Math.cos(angle + 0.4), fpy - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = CONFIG.COLOR_PLAYER;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Ghost player diamond
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = CONFIG.COLOR_PLAYER;
  const pr = CELL_SIZE * 0.3;
  ctx.beginPath();
  ctx.moveTo(fpx, fpy - pr);
  ctx.lineTo(fpx + pr, fpy);
  ctx.lineTo(fpx, fpy + pr);
  ctx.lineTo(fpx - pr, fpy);
  ctx.closePath();
  ctx.fill();

  // Dashed outline
  ctx.strokeStyle = CONFIG.COLOR_PLAYER;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(fpx, fpy - pr);
  ctx.lineTo(fpx + pr, fpy);
  ctx.lineTo(fpx, fpy + pr);
  ctx.lineTo(fpx - pr, fpy);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // Ghost enemies
  for (let i = 0; i < next.enemies.length; i++) {
    const fe = next.enemies[i]!;
    const ce = current.enemies[i];
    const fex = fe.x * CELL_SIZE + CELL_SIZE / 2;
    const fey = fe.y * CELL_SIZE + CELL_SIZE / 2;

    // Arrow from current to future enemy
    if (ce && (fe.x !== ce.x || fe.y !== ce.y)) {
      const cex = ce.x * CELL_SIZE + CELL_SIZE / 2;
      const cey = ce.y * CELL_SIZE + CELL_SIZE / 2;
      ctx.strokeStyle = CONFIG.COLOR_ENEMY;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cex, cey);
      ctx.lineTo(fex, fey);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Ghost enemy triangle
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = CONFIG.COLOR_ENEMY;
    const er = CELL_SIZE * 0.28;
    ctx.beginPath();
    ctx.moveTo(fex, fey - er);
    ctx.lineTo(fex + er, fey + er * 0.8);
    ctx.lineTo(fex - er, fey + er * 0.8);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = CONFIG.COLOR_ENEMY;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(fex, fey - er);
    ctx.lineTo(fex + er, fey + er * 0.8);
    ctx.lineTo(fex - er, fey + er * 0.8);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // Highlight the future player cell with quality-based overlay
  ctx.fillStyle = overlayColor;
  ctx.fillRect(
    next.player.x * CELL_SIZE + 2,
    next.player.y * CELL_SIZE + 2,
    CELL_SIZE - 4,
    CELL_SIZE - 4,
  );
}
