# Quantum Runner — Implementation Plan

## Overview

Quantum Runner is a turn-based grid game where the player doesn't directly control a character. Instead, each turn generates N stochastic possible futures and the player selects which future to "collapse into" — accept the current proposal or pass to see the next one, with no going back.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript (strict) | Type safety for game state, entity models |
| Build | Vite 6 (`vanilla-ts` template) | Fast HMR, zero-config TS, optimized production build |
| Rendering | HTML5 Canvas 2D | Direct pixel control for grid rendering; no DOM overhead |
| UI Controls | Plain HTML/CSS | Accept/Pass buttons, HUD — minimal DOM, no framework needed |
| Serving (prod) | Nginx alpine | Lightweight static file server for Docker deployment |
| Font | JetBrains Mono (via CDN) | Monospace with character, fits the terminal/quantum aesthetic |

**Why no React/framework?** The game is 95% Canvas rendering. The only DOM elements are a few buttons and text displays. A framework adds bundle size and complexity with zero benefit here.

**Why no Phaser?** Phaser is designed for real-time games with physics, sprite sheets, and animation systems. This is a turn-based game with simple geometric rendering. Raw Canvas API keeps the code simple and the bundle tiny.

Sources:
- [Vite docs](https://vite.dev/guide/) — project scaffolding
- [Canvas game patterns](https://blog.harveydelaney.com/creating-a-game-using-html5-canvas-typescript-and-webpack/) — architecture inspiration
- [Grid game in TypeScript](https://medium.com/swlh/building-a-game-with-typescript-iii-drawing-grid-4-5-398af1dd638d) — grid drawing patterns

## Design Direction: "Terminal Phosphor"

Dark background (#0a0a0f), green/cyan grid lines evoking retro CRT monitors. The protagonist is a bright cyan glyph, enemies are amber/red, the goal is a pulsing green. Future overlays use semi-transparent versions of entity colors with dashed outlines. Monospace typography throughout (JetBrains Mono). Subtle scanline effect on the canvas for atmosphere.

**Palette:**
- Background: `#0a0a0f`
- Grid lines: `#1a3a2a` (subtle dark green)
- Protagonist: `#00ffcc` (cyan)
- Enemy: `#ff6b35` (amber-orange)
- Goal: `#39ff14` (neon green)
- Danger/lose: `#ff1744` (red)
- Future overlay: 40% opacity versions with dashed borders
- UI text: `#b0ffb0` (soft green)
- Accent: `#ffeb3b` (yellow for highlights)

## Architecture

### File Structure

```
quantum-runner/
├── src/
│   ├── main.ts              # Entry point — initialize canvas, start game
│   ├── types.ts             # Shared type definitions
│   ├── config.ts            # Game configuration constants
│   ├── state/
│   │   ├── GameState.ts     # Core game state model
│   │   ├── Grid.ts          # Grid representation + pathfinding helpers
│   │   └── entities.ts      # Entity types (Player, Enemy, Goal, Wall)
│   ├── engine/
│   │   ├── FuturesEngine.ts # Stochastic futures generation
│   │   ├── EnemyAI.ts       # Enemy movement AI (weighted random)
│   │   └── movement.ts      # Movement distributions + sampling
│   ├── render/
│   │   ├── Renderer.ts      # Main canvas renderer
│   │   ├── GridRenderer.ts  # Grid lines, walls, floor tiles
│   │   ├── EntityRenderer.ts# Player, enemies, goal rendering
│   │   └── FutureOverlay.ts # Semi-transparent future state overlay
│   ├── ui/
│   │   ├── GameController.ts# State machine: title → play → win/lose
│   │   ├── TurnManager.ts   # Future streaming + accept/pass logic
│   │   ├── HUD.ts           # Score, turn count, futures remaining
│   │   └── screens.ts       # Title screen, win/lose screen rendering
│   └── style.css            # Minimal CSS for HTML elements
├── index.html               # Canvas + UI container
├── Dockerfile               # Multi-stage: build with Node, serve with Nginx
├── tsconfig.json             # Strict TypeScript config
├── package.json
└── vite.config.ts
```

### Core Data Model

```typescript
// Grid cell types
type CellType = 'floor' | 'wall' | 'goal';

// Entity on the grid
interface Entity {
  type: 'player' | 'enemy';
  x: number;
  y: number;
  id: string;
}

// Complete game state (immutable per turn)
interface GameState {
  grid: CellType[][];        // 2D grid of cells
  player: Entity;
  enemies: Entity[];
  goalPos: { x: number; y: number };
  turn: number;
  status: 'playing' | 'won' | 'lost';
}

// A proposed future state
interface Future {
  state: GameState;
  description: string;       // Brief text describing what happens
  quality: number;           // -1 to 1, how good this future is (for variance)
}
```

### Futures Engine Design

Each turn, the engine generates N futures (configurable, default 3) by:

1. **Player movement**: Sample from adjacent walkable cells. Each direction has a base probability (biased slightly toward the goal via a softmax over Manhattan distance). Sometimes the player stays in place (inertia).

2. **Enemy movement**: Each enemy uses weighted random movement biased toward the player (simple chase AI). Occasionally an enemy moves randomly or stays still, creating variance.

3. **Quality variance**: Futures are sorted/shuffled to ensure meaningful spread. At least one future should be "good" (player moves toward goal, enemies move away) and at least one "bad" (player moves into danger). The engine explicitly ensures this by rejection-sampling or adjusting probabilities if the initial batch is too uniform.

4. **Collision resolution**: If the player and enemy occupy the same cell in a future → player is caught → status becomes 'lost'. If the player reaches the goal cell → status becomes 'won'.

### Turn Flow

```
Current State
    │
    ▼
Generate N Futures
    │
    ▼
Present Future 1 ──── [Accept] ──→ Apply State → Check Win/Lose → Next Turn
    │
  [Pass]
    │
    ▼
Present Future 2 ──── [Accept] ──→ Apply State → Check Win/Lose → Next Turn
    │
  [Pass]
    │
    ▼
  ...
    │
    ▼
Present Future N ──── [Auto-Accept] ──→ Apply State → Check Win/Lose → Next Turn
```

### Game Controller State Machine

```
TITLE ──[Start]──→ PLAYING ──[Win]──→ WIN_SCREEN ──[Restart]──→ TITLE
                      │
                    [Lose]
                      │
                      ▼
                  LOSE_SCREEN ──[Restart]──→ TITLE
```

### Level Design

A single hardcoded level for the prototype:
- 12×10 grid
- Walls forming corridors and a few dead ends
- Player starts bottom-left area
- Goal in top-right area
- 2 enemies: one patrolling near the middle, one near the goal
- Multiple viable paths to create meaningful choices

### Rendering Strategy

1. **Base layer**: Grid floor tiles + walls (drawn once, cached to offscreen canvas)
2. **Entity layer**: Player, enemies, goal (redrawn each state change)
3. **Future overlay**: When presenting a future, draw translucent versions of entities at their proposed positions with dashed connecting lines from current positions. Use color-coded arrows (green = toward goal, red = toward enemy).
4. **UI overlay**: Canvas-rendered HUD (turn counter, futures remaining indicator)

### Key Design Decisions

1. **Immutable game states**: Each `GameState` is a new object. Futures reference new state objects. This makes undo/comparison trivial and prevents mutation bugs.

2. **No animation between turns**: The turn-based nature means we snap between states. The future overlay provides the visual transition. This dramatically simplifies the renderer.

3. **Configurable N**: The number of futures per turn is a constant in `config.ts`, easily adjustable from 2–5.

4. **Keyboard + click support**: Accept = Enter or click button. Pass = Space or click button. Arrow keys could optionally highlight entities.

### Dockerfile

Multi-stage build:
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## Scope Assessment

This is a **single-agent** task. The modules are tightly coupled:
- The renderer needs the state model and entity types
- The futures engine needs the state model and movement logic
- The game controller orchestrates the renderer, futures engine, and UI
- Integration testing requires the full pipeline

Splitting into parallel agents would create more integration overhead than it saves. A single focused agent can build this incrementally: types → state → engine → renderer → controller → screens → Dockerfile.

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Futures too uniform / no meaningful choice | Engine explicitly ensures quality spread via rejection sampling |
| Game too easy/hard | Configurable enemy AI aggressiveness + number of futures |
| Canvas rendering performance | Turn-based = no frame loop; redraw only on state change |
| Level too simple | Corridors + dead ends create tension even in a small grid |
