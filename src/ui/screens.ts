import { CONFIG } from '../config';

export function renderTitleScreen(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = CONFIG.COLOR_BG;
  ctx.fillRect(0, 0, width, height);

  // Scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  for (let y = 0; y < height; y += 3) {
    ctx.fillRect(0, y, width, 1);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title
  ctx.shadowColor = CONFIG.COLOR_PLAYER;
  ctx.shadowBlur = 20;
  ctx.fillStyle = CONFIG.COLOR_PLAYER;
  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.fillText('QUANTUM RUNNER', width / 2, height / 3);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = CONFIG.COLOR_UI_TEXT;
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillText('Collapse the future. Reach the exit.', width / 2, height / 3 + 50);

  // Instructions
  ctx.fillStyle = CONFIG.COLOR_ACCENT;
  ctx.font = '14px "JetBrains Mono", monospace';
  const instructions = [
    'You are the Observer ◉ — you don\'t move directly.',
    'Each turn, possible futures are revealed one by one.',
    'Accept a future or pass to see the next.',
    'If you pass all futures, the last one is forced.',
    'Reach the EXIT. Avoid the enemies ✕.',
  ];
  instructions.forEach((line, i) => {
    ctx.fillText(line, width / 2, height / 2 + 20 + i * 26);
  });

  // Start prompt
  const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 500);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = CONFIG.COLOR_GOAL;
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('[ Press ENTER or Click to Start ]', width / 2, height - 60);
  ctx.globalAlpha = 1;
}

export function renderWinScreen(ctx: CanvasRenderingContext2D, width: number, height: number, turns: number): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = CONFIG.COLOR_GOAL;
  ctx.shadowBlur = 20;
  ctx.fillStyle = CONFIG.COLOR_GOAL;
  ctx.font = 'bold 40px "JetBrains Mono", monospace';
  ctx.fillText('COLLAPSED!', width / 2, height / 3);
  ctx.shadowBlur = 0;

  ctx.fillStyle = CONFIG.COLOR_UI_TEXT;
  ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillText('The observer reached the exit.', width / 2, height / 3 + 50);
  ctx.fillText(`Turns taken: ${turns}`, width / 2, height / 3 + 80);

  const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 500);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = CONFIG.COLOR_ACCENT;
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText('[ Press ENTER or Click to Restart ]', width / 2, height - 60);
  ctx.globalAlpha = 1;
}

export function renderLoseScreen(ctx: CanvasRenderingContext2D, width: number, height: number, turns: number): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = CONFIG.COLOR_DANGER;
  ctx.shadowBlur = 20;
  ctx.fillStyle = CONFIG.COLOR_DANGER;
  ctx.font = 'bold 40px "JetBrains Mono", monospace';
  ctx.fillText('DECOHERENCE', width / 2, height / 3);
  ctx.shadowBlur = 0;

  ctx.fillStyle = CONFIG.COLOR_UI_TEXT;
  ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillText('The observer was caught.', width / 2, height / 3 + 50);
  ctx.fillText(`Survived ${turns} turns.`, width / 2, height / 3 + 80);

  const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 500);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = CONFIG.COLOR_ACCENT;
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText('[ Press ENTER or Click to Restart ]', width / 2, height - 60);
  ctx.globalAlpha = 1;
}
