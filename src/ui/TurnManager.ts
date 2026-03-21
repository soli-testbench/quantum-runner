import { GameState, Future } from '../types';
import { generateFutures } from '../engine/FuturesEngine';
import { CONFIG } from '../config';

export class TurnManager {
  private futures: Future[] = [];
  private currentIndex = 0;
  private onFuturePresented: ((future: Future, index: number, total: number) => void) | null = null;
  private onTurnResolved: ((state: GameState) => void) | null = null;

  setCallbacks(
    onFuturePresented: (future: Future, index: number, total: number) => void,
    onTurnResolved: (state: GameState) => void,
  ): void {
    this.onFuturePresented = onFuturePresented;
    this.onTurnResolved = onTurnResolved;
  }

  startTurn(state: GameState): void {
    this.futures = generateFutures(state, CONFIG.NUM_FUTURES);
    this.currentIndex = 0;
    this.presentCurrent();
  }

  private presentCurrent(): void {
    const future = this.futures[this.currentIndex];
    if (future && this.onFuturePresented) {
      this.onFuturePresented(future, this.currentIndex, this.futures.length);
    }
  }

  accept(): void {
    const future = this.futures[this.currentIndex];
    if (future && this.onTurnResolved) {
      this.onTurnResolved(future.state);
    }
  }

  pass(): void {
    if (this.currentIndex < this.futures.length - 1) {
      this.currentIndex++;
      this.presentCurrent();
    } else {
      // Last future — auto-accept
      this.accept();
    }
  }

  getCurrentFuture(): Future | null {
    return this.futures[this.currentIndex] ?? null;
  }

  isLastFuture(): boolean {
    return this.currentIndex === this.futures.length - 1;
  }
}
