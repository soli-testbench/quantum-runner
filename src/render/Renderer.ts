import { GameState, Future } from '../types';
import { CONFIG } from '../config';
import { renderGrid } from './GridRenderer';
import { renderPlayer, renderEnemy, renderGoalMarker } from './EntityRenderer';
import { renderFutureOverlay } from './FutureOverlay';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private animFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize(): void {
    this.canvas.width = CONFIG.GRID_COLS * CONFIG.CELL_SIZE;
    this.canvas.height = CONFIG.GRID_ROWS * CONFIG.CELL_SIZE;
  }

  renderState(state: GameState, activeFuture?: Future): void {
    const ctx = this.ctx;

    // Clear
    ctx.fillStyle = CONFIG.COLOR_BG;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid
    renderGrid(ctx, state.grid);

    // Goal pulsing marker
    renderGoalMarker(ctx, state.goalPos);

    // Entities
    for (const enemy of state.enemies) {
      renderEnemy(ctx, enemy);
    }
    renderPlayer(ctx, state.player);

    // Future overlay
    if (activeFuture) {
      renderFutureOverlay(ctx, state, activeFuture);
    }

    // Scanline effect
    this.renderScanlines();
  }

  private renderScanlines(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < this.canvas.height; y += 3) {
      ctx.fillRect(0, y, this.canvas.width, 1);
    }
  }

  startPulseAnimation(state: GameState, activeFuture?: Future): void {
    this.stopAnimation();
    const animate = () => {
      this.renderState(state, activeFuture);
      this.animFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  stopAnimation(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
