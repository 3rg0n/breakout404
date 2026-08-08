import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DIFFICULTY_SETTINGS,
  createInitialState,
  startOrRestart,
  step,
  countActiveBlocks,
  resolveDifficulty,
} from './engine';
import { defaultTheme } from './theme';
import { create404Blocks } from './blocks';
import type { GameState } from './types';

const TEST_WIDTH = 800;
const TEST_HEIGHT = 600;
const EASY = DIFFICULTY_SETTINGS.easy;
const MEDIUM = DIFFICULTY_SETTINGS.medium;
const HARD = DIFFICULTY_SETTINGS.hard;

/** Helper: create a minimal game state for testing. */
function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    ball: { x: 400, y: 420, dx: 0, dy: -6, radius: 8 },
    paddle: { x: 340, y: 510, width: 120, height: 12 },
    blocks: create404Blocks(TEST_WIDTH, TEST_HEIGHT, defaultTheme),
    score: 0,
    lives: 3,
    gameOver: false,
    won: false,
    started: true,
    ...overrides,
  };
}

describe('engine', () => {
  beforeEach(() => {
    // Deterministic ball direction in createInitialState
    vi.spyOn(Math, 'random').mockReturnValue(0.6);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('DIFFICULTY_SETTINGS', () => {
    it('has correct values for easy', () => {
      expect(EASY.ballSpeed).toBe(4);
      expect(EASY.paddleWidth).toBe(120);
      expect(EASY.lives).toBe(5);
    });

    it('has correct values for medium', () => {
      expect(MEDIUM.ballSpeed).toBe(6);
      expect(MEDIUM.paddleWidth).toBe(100);
      expect(MEDIUM.lives).toBe(3);
    });

    it('has correct values for hard', () => {
      expect(HARD.ballSpeed).toBe(8);
      expect(HARD.paddleWidth).toBe(80);
      expect(HARD.lives).toBe(2);
    });
  });

  describe('resolveDifficulty', () => {
    it('returns the given difficulty for valid inputs', () => {
      expect(resolveDifficulty('easy')).toBe('easy');
      expect(resolveDifficulty('medium')).toBe('medium');
      expect(resolveDifficulty('hard')).toBe('hard');
    });

    it('defaults to medium for undefined', () => {
      expect(resolveDifficulty(undefined)).toBe('medium');
    });

    it('defaults to medium for invalid strings', () => {
      expect(resolveDifficulty('insane')).toBe('medium');
      expect(resolveDifficulty('')).toBe('medium');
      expect(resolveDifficulty('EASY')).toBe('medium');
    });
  });

  describe('createInitialState', () => {
    it('creates a ball at center with upward velocity', () => {
      const state = createInitialState(TEST_WIDTH, TEST_HEIGHT, EASY, defaultTheme);

      expect(state.ball.x).toBe(TEST_WIDTH / 2);
      expect(state.ball.y).toBeCloseTo(TEST_HEIGHT * 0.7);
      expect(state.ball.dy).toBe(-EASY.ballSpeed);
      expect(state.ball.dx).not.toBe(0);
      expect(state.ball.radius).toBe(8);
    });

    it('randomizes ball dx direction (mocked)', () => {
      // random > 0.5 → dx is positive
      const state1 = createInitialState(TEST_WIDTH, TEST_HEIGHT, EASY, defaultTheme);
      expect(state1.ball.dx).toBe(EASY.ballSpeed);

      // random <= 0.5 → dx is negative
      vi.spyOn(Math, 'random').mockReturnValue(0.3);
      const state2 = createInitialState(TEST_WIDTH, TEST_HEIGHT, EASY, defaultTheme);
      expect(state2.ball.dx).toBe(-EASY.ballSpeed);
    });

    it('creates a paddle centered horizontally at 85% height', () => {
      const state = createInitialState(TEST_WIDTH, TEST_HEIGHT, MEDIUM, defaultTheme);

      expect(state.paddle.x).toBe((TEST_WIDTH - MEDIUM.paddleWidth) / 2);
      expect(state.paddle.y).toBeCloseTo(TEST_HEIGHT * 0.85);
      expect(state.paddle.width).toBe(MEDIUM.paddleWidth);
      expect(state.paddle.height).toBe(12);
    });

    it('creates blocks for the "404" pattern', () => {
      const state = createInitialState(TEST_WIDTH, TEST_HEIGHT, MEDIUM, defaultTheme);
      expect(state.blocks.length).toBeGreaterThan(0);
      expect(state.blocks.every((b) => b.active)).toBe(true);
    });

    it('initializes score, lives, and flags correctly', () => {
      const state = createInitialState(TEST_WIDTH, TEST_HEIGHT, HARD, defaultTheme);

      expect(state.score).toBe(0);
      expect(state.lives).toBe(HARD.lives);
      expect(state.gameOver).toBe(false);
      expect(state.won).toBe(false);
      expect(state.started).toBe(false);
    });
  });

  describe('startOrRestart', () => {
    it('starts a not-started game', () => {
      const state = makeState({ started: false });
      const event = startOrRestart(state, TEST_WIDTH, TEST_HEIGHT, MEDIUM, defaultTheme);

      expect(event).toEqual({ type: 'started' });
      expect(state.started).toBe(true);
    });

    it('returns null when game is already started', () => {
      const state = makeState({ started: true });
      const event = startOrRestart(state, TEST_WIDTH, TEST_HEIGHT, MEDIUM, defaultTheme);

      expect(event).toBeNull();
      expect(state.started).toBe(true);
    });

    it('restarts a game-over (lost) game', () => {
      const state = makeState({ started: true, gameOver: true, won: false, lives: 0 });
      const event = startOrRestart(state, TEST_WIDTH, TEST_HEIGHT, MEDIUM, defaultTheme);

      expect(event).toEqual({ type: 'restarted' });
      expect(state.started).toBe(true);
      expect(state.gameOver).toBe(false);
      expect(state.won).toBe(false);
      expect(state.lives).toBe(MEDIUM.lives);
      expect(state.score).toBe(0);
    });

    it('does not restart after a win (won=true, gameOver=true)', () => {
      const state = makeState({ started: true, gameOver: true, won: true, lives: 1 });
      const event = startOrRestart(state, TEST_WIDTH, TEST_HEIGHT, MEDIUM, defaultTheme);

      expect(event).toBeNull();
      expect(state.started).toBe(true); // unchanged
    });

    it('preserves object reference on restart', () => {
      const state = makeState({ started: true, gameOver: true, won: false, lives: 0 });
      const stateRef = state;
      startOrRestart(state, TEST_WIDTH, TEST_HEIGHT, MEDIUM, defaultTheme);

      expect(state).toBe(stateRef); // same object, mutated in place
    });
  });

  describe('countActiveBlocks', () => {
    it('counts all active blocks', () => {
      const state = makeState();
      expect(countActiveBlocks(state.blocks)).toBe(state.blocks.length);
    });

    it('returns 0 when all blocks are inactive', () => {
      const state = makeState();
      state.blocks.forEach((b) => (b.active = false));
      expect(countActiveBlocks(state.blocks)).toBe(0);
    });

    it('counts partial deactivation', () => {
      const state = makeState();
      state.blocks[0].active = false;
      state.blocks[2].active = false;
      expect(countActiveBlocks(state.blocks)).toBe(state.blocks.length - 2);
    });
  });

  describe('step', () => {
    it('returns empty events when game has not started', () => {
      const state = makeState({ started: false });
      const events = step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);
      expect(events).toEqual([]);
    });

    it('returns empty events when game is over', () => {
      const state = makeState({ gameOver: true });
      const events = step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);
      expect(events).toEqual([]);
    });

    it('moves the ball by dx/dy each step', () => {
      const state = makeState({
        ball: { x: 400, y: 420, dx: 5, dy: -6, radius: 8 },
      });
      const events = step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      expect(state.ball.x).toBe(405);
      expect(state.ball.y).toBe(414);
      expect(events).toEqual([]);
    });

    it('reverses dx on side wall collision', () => {
      const state = makeState({
        // Ball starts near left wall moving left; after step it's past the wall
        ball: { x: 2, y: 420, dx: -5, dy: 0, radius: 8 },
        blocks: [], // no blocks to interfere
      });
      step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      expect(state.ball.dx).toBe(5);
    });

    it('reverses dy on top wall collision', () => {
      const state = makeState({
        ball: { x: 400, y: 6, dx: 0, dy: -6, radius: 8 },
        blocks: [],
      });
      step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      expect(state.ball.dy).toBe(6);
      expect(state.ball.y).toBe(8);
    });

    it('destroys a block on collision and awards score', () => {
      const state = makeState({
        ball: { x: 400, y: 200, dx: 0, dy: 10, radius: 8 },
        blocks: [], // will be replaced
      });

      // Create a single block that the ball will hit
      state.blocks = [{ x: 395, y: 195, width: 10, height: 10, active: true, color: '#ff0000' }];

      const events = step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      expect(state.blocks[0].active).toBe(false);
      expect(state.score).toBe(10);

      const destroyEvent = events.find((e) => e.type === 'blockDestroyed');
      expect(destroyEvent).toBeDefined();
      expect(destroyEvent?.payload?.remaining).toBe(0);
    });

    it('emits blockDestroyed with correct remaining count for multiple hits', () => {
      const state = makeState({
        // radius=20 so the ball reach all three stacked blocks in one frame
        ball: { x: 400, y: 200, dx: 0, dy: 10, radius: 20 },
        blocks: [],
      });

      state.blocks = [
        { x: 395, y: 195, width: 10, height: 10, active: true, color: '#f00' },
        { x: 395, y: 210, width: 10, height: 10, active: true, color: '#f00' },
        { x: 395, y: 225, width: 10, height: 10, active: true, color: '#f00' },
      ];

      const events = step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      const destroyEvents = events.filter((e) => e.type === 'blockDestroyed');
      expect(destroyEvents.length).toBe(3);
      expect(destroyEvents[0].payload?.remaining).toBe(2);
      expect(destroyEvents[1].payload?.remaining).toBe(1);
      expect(destroyEvents[2].payload?.remaining).toBe(0);
      expect(state.score).toBe(30);
    });

    it('only reverses direction once for multiple block hits in a single frame', () => {
      const state = makeState({
        // Ball approaches from the left so X-axis deflection is chosen
        ball: { x: 385, y: 200, dx: 5, dy: 8, radius: 10 },
        blocks: [],
      });

      state.blocks = [
        { x: 395, y: 195, width: 10, height: 10, active: true, color: '#f00' },
        { x: 395, y: 210, width: 10, height: 10, active: true, color: '#f00' },
      ];

      step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      // dx is reversed exactly once (not twice, which would cancel out)
      expect(state.ball.dx).toBe(-5);
    });

    it('emits lifeLost when ball falls below paddle', () => {
      const state = makeState({
        ball: { x: 400, y: 600, dx: 0, dy: 10, radius: 8 },
        blocks: [],
        lives: 3,
      });

      const events = step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      const lifeEvent = events.find((e) => e.type === 'lifeLost');
      expect(lifeEvent).toBeDefined();
      expect(lifeEvent?.payload?.livesRemaining).toBe(2);

      // Ball should be reset
      expect(state.ball.x).toBe(TEST_WIDTH / 2);
      expect(state.ball.y).toBeCloseTo(TEST_HEIGHT * 0.7);
      expect(state.started).toBe(false);
    });

    it('emits gameOver when lives reach 0', () => {
      const state = makeState({
        ball: { x: 400, y: 600, dx: 0, dy: 10, radius: 8 },
        // Use an active block so the win condition (all blocks destroyed)
        // does not vacuous-trigger on an empty blocks array.
        blocks: [{ x: 0, y: 0, width: 10, height: 10, active: true, color: '#ff0000' }],
        lives: 1,
      });

      const events = step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      const gameOverEvent = events.find((e) => e.type === 'gameOver');
      expect(gameOverEvent).toBeDefined();
      expect(gameOverEvent?.payload?.score).toBe(0);
      expect(state.gameOver).toBe(true);
      expect(state.won).toBe(false);
    });

    it('emits gameWon when all blocks are destroyed', () => {
      const state = makeState({
        ball: { x: 400, y: 200, dx: 0, dy: 10, radius: 8 },
        blocks: [],
        started: true,
        gameOver: false,
      });

      // No blocks → already all destroyed
      const events = step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      const wonEvent = events.find((e) => e.type === 'gameWon');
      expect(wonEvent).toBeDefined();
      expect(wonEvent?.payload?.score).toBe(0);
      expect(state.gameOver).toBe(true);
      expect(state.won).toBe(true);
    });

    it('increments score by 10 per destroyed block', () => {
      const state = makeState({
        ball: { x: 400, y: 200, dx: 0, dy: 10, radius: 12 },
        blocks: [],
      });

      state.blocks = [
        { x: 395, y: 195, width: 10, height: 10, active: true, color: '#f00' },
        { x: 395, y: 210, width: 10, height: 10, active: true, color: '#f00' },
      ];

      step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      expect(state.score).toBe(20);
    });

    it('ball is clamped to side walls', () => {
      const state = makeState({
        ball: { x: 2, y: 420, dx: -5, dy: 0, radius: 8 },
        blocks: [],
      });

      step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);

      expect(state.ball.x).toBe(8); // at least radius away from wall
      expect(state.ball.dx).toBe(5); // reversed
    });

    it('does not destroy blocks on the first frame if ball does not reach them', () => {
      const state = makeState({
        ball: { x: 400, y: 400, dx: 0, dy: -6, radius: 8 },
      });

      const initialActive = countActiveBlocks(state.blocks);
      step(state, MEDIUM, TEST_WIDTH, TEST_HEIGHT);
      expect(countActiveBlocks(state.blocks)).toBe(initialActive);
      expect(state.score).toBe(0);
    });
  });
});
