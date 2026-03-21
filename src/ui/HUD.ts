export class HUD {
  private turnEl: HTMLElement;
  private futuresEl: HTMLElement;
  private descEl: HTMLElement;

  constructor() {
    this.turnEl = document.getElementById('turn-counter')!;
    this.futuresEl = document.getElementById('futures-counter')!;
    this.descEl = document.getElementById('future-description')!;
  }

  updateTurn(turn: number): void {
    this.turnEl.textContent = `Turn: ${turn}`;
  }

  updateFutures(current: number, total: number): void {
    this.futuresEl.textContent = `Future: ${current + 1}/${total}`;
  }

  updateDescription(text: string): void {
    this.descEl.textContent = text;
  }

  clearDescription(): void {
    this.descEl.textContent = '';
  }

  show(): void {
    this.turnEl.style.display = '';
    this.futuresEl.style.display = '';
  }

  hide(): void {
    this.turnEl.style.display = 'none';
    this.futuresEl.style.display = 'none';
    this.descEl.textContent = '';
  }
}
