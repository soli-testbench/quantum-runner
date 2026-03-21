import { GameState, GamePhase, Future } from '../types';
import { createInitialState } from '../state/GameState';
import { Renderer } from '../render/Renderer';
import { TurnManager } from './TurnManager';
import { HUD } from './HUD';
import { renderTitleScreen, renderWinScreen, renderLoseScreen } from './screens';

export class GameController {
  private phase: GamePhase = 'title';
  private state: GameState;
  private renderer: Renderer;
  private turnManager: TurnManager;
  private hud: HUD;
  private canvas: HTMLCanvasElement;
  private controls: HTMLElement;
  private btnAccept: HTMLElement;
  private btnPass: HTMLElement;
  private animFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.turnManager = new TurnManager();
    this.hud = new HUD();
    this.state = createInitialState();
    this.controls = document.getElementById('controls')!;
    this.btnAccept = document.getElementById('btn-accept')!;
    this.btnPass = document.getElementById('btn-pass')!;

    this.turnManager.setCallbacks(
      (future, index, total) => this.onFuturePresented(future, index, total),
      (newState) => this.onTurnResolved(newState),
    );

    this.setupInput();
    this.showTitle();
  }

  private setupInput(): void {
    this.btnAccept.addEventListener('click', () => this.handleAccept());
    this.btnPass.addEventListener('click', () => this.handlePass());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.phase === 'title' || this.phase === 'won' || this.phase === 'lost') {
          this.startGame();
        } else if (this.phase === 'playing') {
          this.handleAccept();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        if (this.phase === 'playing') {
          this.handlePass();
        }
      }
    });

    // Click on canvas for title/end screens
    this.canvas.addEventListener('click', () => {
      if (this.phase === 'title' || this.phase === 'won' || this.phase === 'lost') {
        this.startGame();
      }
    });
  }

  private showTitle(): void {
    this.phase = 'title';
    this.controls.classList.add('hidden');
    this.hud.hide();
    this.startScreenAnimation(() => {
      const ctx = this.canvas.getContext('2d')!;
      renderTitleScreen(ctx, this.canvas.width, this.canvas.height);
    });
  }

  private startGame(): void {
    this.stopAnimation();
    this.phase = 'playing';
    this.state = createInitialState();
    this.controls.classList.remove('hidden');
    this.hud.show();
    this.hud.updateTurn(0);
    this.renderer.renderState(this.state);
    this.startTurn();
  }

  private startTurn(): void {
    this.turnManager.startTurn(this.state);
  }

  private onFuturePresented(future: Future, index: number, total: number): void {
    this.hud.updateFutures(index, total);
    this.hud.updateDescription(future.description);

    // Update pass button text
    if (this.turnManager.isLastFuture()) {
      this.btnPass.textContent = 'Forced [Space]';
      this.btnPass.classList.add('forced');
    } else {
      this.btnPass.textContent = 'Pass [Space]';
      this.btnPass.classList.remove('forced');
    }

    // Animate the current state with future overlay
    this.renderer.startPulseAnimation(this.state, future);
  }

  private onTurnResolved(newState: GameState): void {
    this.renderer.stopAnimation();
    this.state = newState;
    this.hud.updateTurn(this.state.turn);
    this.hud.clearDescription();
    this.renderer.renderState(this.state);

    if (this.state.status === 'won') {
      this.showWin();
    } else if (this.state.status === 'lost') {
      this.showLose();
    } else {
      // Small delay before next turn for readability
      setTimeout(() => this.startTurn(), 300);
    }
  }

  private handleAccept(): void {
    if (this.phase !== 'playing') return;
    this.turnManager.accept();
  }

  private handlePass(): void {
    if (this.phase !== 'playing') return;
    this.turnManager.pass();
  }

  private showWin(): void {
    this.phase = 'won';
    this.controls.classList.add('hidden');
    this.startScreenAnimation(() => {
      // First render the final game state
      this.renderer.renderState(this.state);
      const ctx = this.canvas.getContext('2d')!;
      renderWinScreen(ctx, this.canvas.width, this.canvas.height, this.state.turn);
    });
  }

  private showLose(): void {
    this.phase = 'lost';
    this.controls.classList.add('hidden');
    this.startScreenAnimation(() => {
      this.renderer.renderState(this.state);
      const ctx = this.canvas.getContext('2d')!;
      renderLoseScreen(ctx, this.canvas.width, this.canvas.height, this.state.turn);
    });
  }

  private startScreenAnimation(renderFn: () => void): void {
    this.stopAnimation();
    const animate = () => {
      renderFn();
      this.animFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  private stopAnimation(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.renderer.stopAnimation();
  }
}
