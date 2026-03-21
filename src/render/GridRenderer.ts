import { CellType } from '../types';
import { CONFIG } from '../config';

export function renderGrid(ctx: CanvasRenderingContext2D, grid: CellType[][]): void {
  const { CELL_SIZE, COLOR_FLOOR, COLOR_WALL, COLOR_GOAL, COLOR_GRID } = CONFIG;

  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]!;
    for (let x = 0; x < row.length; x++) {
      const cell = row[x]!;
      const px = x * CELL_SIZE;
      const py = y * CELL_SIZE;

      // Fill cell
      if (cell === 'wall') {
        ctx.fillStyle = COLOR_WALL;
      } else if (cell === 'goal') {
        ctx.fillStyle = COLOR_GOAL;
        ctx.globalAlpha = 0.25;
      } else {
        ctx.fillStyle = COLOR_FLOOR;
      }
      ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
      ctx.globalAlpha = 1;

      // Grid lines
      ctx.strokeStyle = COLOR_GRID;
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);

      // Goal marker
      if (cell === 'goal') {
        ctx.fillStyle = CONFIG.COLOR_GOAL;
        ctx.globalAlpha = 0.6;
        const margin = CELL_SIZE * 0.2;
        ctx.fillRect(px + margin, py + margin, CELL_SIZE - margin * 2, CELL_SIZE - margin * 2);
        ctx.globalAlpha = 1;

        // Draw "EXIT" text
        ctx.fillStyle = CONFIG.COLOR_GOAL;
        ctx.font = `bold ${CELL_SIZE * 0.25}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('EXIT', px + CELL_SIZE / 2, py + CELL_SIZE / 2);
      }
    }
  }
}
