import type { GameState, DifficultySettings, Breakout404Theme, GameEvent, Block } from './types';
import { create404Blocks, checkBlockCollision } from './blocks';

/**
 * Difficulty presets. Keyed by the difficulty union type so that invalid
 * lookups are caught at compile time (no `security/detect-object-injection`
 * suppression needed).
 */
export const DIFFICULTY_SETTINGS: Record<'easy' | 'medium' | 'hard', DifficultySettings> = {
  easy: { ballSpeed: 4, paddleWidth: 120, lives: 5 },
  medium: { ballSpeed: 6, paddleWidth: 100, lives: 3 },
  hard: { ballSpeed: 8, paddleWidth: 80, lives: 2 },
};

export const MAX_CANVAS_DIM = 4096;
export const TARGET_FRAME_MS = 1000 / 60; // ~16.67ms for 60 FPS

/** Resolve a difficulty string to a validated key, defaulting to 'medium'. */
export function resolveDifficulty(difficulty: string | undefined): 'easy' | 'medium' | 'hard' {
  if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
    return difficulty;
  }
  return 'medium';
}

/**
 * Create a fresh game state for the given canvas dimensions and difficulty.
 *
 * This is a **pure function** — it has no side effects and reads no external
 * state, making it trivially testable.
 */
export function createInitialState(
  width: number,
  height: number,
  settings: DifficultySettings,
  theme: Breakout404Theme
): GameState {
  return {
    ball: {
      x: width / 2,
      y: height * 0.7,
      dx: settings.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
      dy: -settings.ballSpeed,
      radius: 8,
    },
    paddle: {
      x: width / 2 - settings.paddleWidth / 2,
      y: height * 0.85,
      width: settings.paddleWidth,
      height: 12,
    },
    blocks: create404Blocks(width, height, theme),
    score: 0,
    lives: settings.lives,
    gameOver: false,
    won: false,
    started: false,
  };
}

/**
 * Handle a start/restart action from user input.
 *
 * - If the game hasn't started yet and isn't over → start it.
 * - If the game is over but not won (player lost all lives) → restart.
 *
 * Mutates `state` in place. Returns a `GameEvent` describing what happened,
 * or `null` if the action had no effect.
 */
export function startOrRestart(
  state: GameState,
  width: number,
  height: number,
  settings: DifficultySettings,
  theme: Breakout404Theme
): GameEvent | null {
  if (!state.started && !state.gameOver) {
    state.started = true;
    return { type: 'started' };
  }

  if (state.gameOver && !state.won) {
    // Re-initialise all mutable fields on the existing object so that
    // external references to `state` remain valid.
    const fresh = createInitialState(width, height, settings, theme);
    state.ball = fresh.ball;
    state.paddle = fresh.paddle;
    state.blocks = fresh.blocks;
    state.score = fresh.score;
    state.lives = fresh.lives;
    state.gameOver = fresh.gameOver;
    state.won = fresh.won;
    state.started = true;
    return { type: 'restarted' };
  }

  return null;
}

/**
 * Advance the game simulation by one frame.
 *
 * This is a **pure domain function**: it mutates `state` (for performance —
 * no per-frame allocation) but has **no I/O side effects** (no DOM access,
 * no `window`, no `setTimeout`, no callback invocation). All observable
 * outcomes are returned as `GameEvent` values for the caller to interpret.
 *
 * @param state     - Mutable game state (mutated in place).
 * @param settings  - Difficulty settings (ball speed, paddle width, lives).
 * @param width     - Logical canvas width in CSS pixels.
 * @param height    - Logical canvas height in CSS pixels.
 * @returns Array of events emitted during this frame.
 */
export function step(
  state: GameState,
  settings: DifficultySettings,
  width: number,
  height: number
): GameEvent[] {
  const events: GameEvent[] = [];

  if (!state.started || state.gameOver) {
    return events;
  }

  const { ball, paddle, blocks } = state;

  // --- Ball movement -------------------------------------------------------
  ball.x += ball.dx;
  ball.y += ball.dy;

  // --- Wall collisions -----------------------------------------------------
  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= width) {
    ball.dx = -ball.dx;
    ball.x = Math.max(ball.radius, Math.min(ball.x, width - ball.radius));
  }
  if (ball.y - ball.radius <= 0) {
    ball.dy = -ball.dy;
    ball.y = ball.radius;
  }

  // --- Paddle collision ----------------------------------------------------
  if (
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    // Bounce angle based on where the ball strikes the paddle.
    const hitPos = (ball.x - paddle.x) / paddle.width;
    const angle = (hitPos - 0.5) * Math.PI * 0.7; // -63° to +63°

    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    ball.dx = speed * Math.sin(angle);
    ball.dy = -Math.abs(speed * Math.cos(angle));
    ball.y = paddle.y - ball.radius;
  }

  // --- Block collisions ----------------------------------------------------
  // Destroy all hit blocks but only reverse direction once (fixes the
  // multi-hit-in-one-frame bug where dx/dy cancellations caused the ball
  // to tunnel through).
  let deflectX = false;
  let deflectY = false;

  // Count remaining active blocks once, then decrement per hit — O(n)
  // instead of re-filtering for every destroyed block.
  let remainingBlocks = countActiveBlocks(blocks);

  blocks.forEach((block: Block) => {
    if (!block.active) return;
    if (!checkBlockCollision(ball.x, ball.y, ball.radius, block)) return;

    block.active = false;
    state.score += 10;
    remainingBlocks--;

    // Determine deflection axis from the first collision only.
    if (!deflectX && !deflectY) {
      const overlapLeft = ball.x + ball.radius - block.x;
      const overlapRight = block.x + block.width - (ball.x - ball.radius);
      const overlapTop = ball.y + ball.radius - block.y;
      const overlapBottom = block.y + block.height - (ball.y - ball.radius);

      const minOverlapX = Math.min(overlapLeft, overlapRight);
      const minOverlapY = Math.min(overlapTop, overlapBottom);

      if (minOverlapX < minOverlapY) {
        deflectX = true;
      } else {
        deflectY = true;
      }
    }

    events.push({
      type: 'blockDestroyed',
      payload: { remaining: remainingBlocks },
    });
  });

  if (deflectX) ball.dx = -ball.dx;
  if (deflectY) ball.dy = -ball.dy;

  // --- Ball lost below paddle ----------------------------------------------
  if (ball.y - ball.radius > height) {
    state.lives--;
    events.push({
      type: 'lifeLost',
      payload: { livesRemaining: state.lives },
    });

    if (state.lives <= 0) {
      state.gameOver = true;
      state.won = false;
      events.push({ type: 'gameOver', payload: { score: state.score } });
    } else {
      // Reset ball for next life
      ball.x = width / 2;
      ball.y = height * 0.7;
      ball.dx = settings.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
      ball.dy = -settings.ballSpeed;
      state.started = false;
      events.push({ type: 'ballReset' });
    }
  }

  // --- Win condition -------------------------------------------------------
  if (blocks.every((b) => !b.active)) {
    state.gameOver = true;
    state.won = true;
    events.push({ type: 'gameWon', payload: { score: state.score } });
  }

  return events;
}

/** Count the number of currently active (non-destroyed) blocks. */
export function countActiveBlocks(blocks: Block[]): number {
  return blocks.reduce((count, block) => (block.active ? count + 1 : count), 0);
}
