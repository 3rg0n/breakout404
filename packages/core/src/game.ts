import type {
  Breakout404Options,
  Breakout404Theme,
  Breakout404Logger,
  GameState,
  GameEvent,
} from './types';
import { mergeTheme } from './theme';
import { isValidRedirectUrl } from './security';
import { render } from './renderer';
import {
  DIFFICULTY_SETTINGS,
  MAX_CANVAS_DIM,
  TARGET_FRAME_MS,
  createInitialState,
  startOrRestart,
  step,
  resolveDifficulty,
} from './engine';

const noopLogger: Breakout404Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

const PADDLE_KEYBOARD_SPEED = 12;

export class Breakout404Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private theme: Breakout404Theme;
  private options: Breakout404Options;
  private state: GameState;
  private settings = DIFFICULTY_SETTINGS.medium;
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private lastFrameTime = 0;
  private log: Breakout404Logger;
  private logicalWidth = 800;
  private logicalHeight = 600;

  // Cached keyboard state — updated by event listeners, read by the game loop.
  // Replaces the old separate RAF polling loop.
  private keys: Record<string, boolean> = {};

  // Stored handler references so they can be removed in destroy() (prevents
  // window-level listener leaks across instance create/destroy cycles).
  private boundHandlePointerMove = this.handlePointerMove.bind(this);
  private boundHandleKeydown = this.handleKeydown.bind(this);
  private boundHandleKeyup = this.handleKeyup.bind(this);
  private boundHandleStart = this.handleStart.bind(this);
  private boundHandleResize = this.handleResize.bind(this);

  constructor(container: string | HTMLElement, options: Breakout404Options = {}) {
    this.log = options.logger ?? noopLogger;

    // Get or create container
    const containerEl =
      typeof container === 'string' ? document.querySelector<HTMLElement>(container) : container;

    if (!containerEl) {
      const err = new Error(`Container not found: ${container}`);
      this.log.error('Container not found', err, { container: String(container) });
      throw err;
    }

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    containerEl.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      const err = new Error('Could not get 2D context');
      this.log.error('Canvas 2D context unavailable', err);
      throw err;
    }
    this.ctx = ctx;

    // Setup options
    this.options = options;
    this.theme = mergeTheme(options.theme);

    const difficulty = resolveDifficulty(options.difficulty);
    this.settings = DIFFICULTY_SETTINGS[difficulty]; // eslint-disable-line security/detect-object-injection
    if (options.difficulty !== undefined && options.difficulty !== difficulty) {
      this.log.warn('Invalid difficulty, defaulting to medium', { difficulty: options.difficulty });
    }

    // Validate redirectUrl at construction time
    if (options.redirectUrl && !isValidRedirectUrl(options.redirectUrl)) {
      this.log.warn(
        'Invalid redirectUrl rejected (only http:, https:, or relative paths allowed)',
        { redirectUrl: options.redirectUrl }
      );
      this.options = { ...options, redirectUrl: undefined };
    }

    // Initialize state
    this.state = this.createInitialState();

    // Setup canvas size
    this.resize();

    // Setup event listeners
    this.setupEventListeners();

    this.log.info('Game initialized', {
      difficulty,
      showScore: options.showScore ?? true,
    });

    // Start render loop
    this.gameLoop();
  }

  private createInitialState(): GameState {
    return createInitialState(this.logicalWidth, this.logicalHeight, this.settings, this.theme);
  }

  private resize(): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const dpr = window.devicePixelRatio || 1;
    this.logicalWidth = rect.width;
    this.logicalHeight = rect.height;
    this.canvas.width = Math.min(rect.width * dpr, MAX_CANVAS_DIM);
    this.canvas.height = Math.min(rect.height * dpr, MAX_CANVAS_DIM);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Recreate state with new dimensions, preserving game state flags
    if (this.state) {
      const wasStarted = this.state.started;
      const wasGameOver = this.state.gameOver;
      const wasWon = this.state.won;
      this.state = this.createInitialState();
      this.state.started = wasStarted;
      this.state.gameOver = wasGameOver;
      this.state.won = wasWon;
    }
  }

  private setupEventListeners(): void {
    // Mouse/touch movement
    this.canvas.addEventListener('mousemove', this.boundHandlePointerMove);
    this.canvas.addEventListener('touchmove', this.boundHandlePointerMove, { passive: false });

    // Keyboard movement + start/action
    window.addEventListener('keydown', this.boundHandleKeydown);
    window.addEventListener('keyup', this.boundHandleKeyup);

    // Click/tap to start
    this.canvas.addEventListener('click', this.boundHandleStart);
    this.canvas.addEventListener('touchstart', this.boundHandleStart);

    // Resize observer
    this.resizeObserver = new ResizeObserver(this.boundHandleResize);
    if (this.canvas.parentElement) {
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  private handlePointerMove(e: MouseEvent | TouchEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const maxX = rect.width - this.state.paddle.width;
    this.state.paddle.x = Math.max(0, Math.min(x - this.state.paddle.width / 2, maxX));
  }

  private handleKeydown(e: KeyboardEvent): void {
    this.keys[e.key] = true;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.handleStart();
    }
  }

  private handleKeyup(e: KeyboardEvent): void {
    this.keys[e.key] = false;
  }

  private handleResize(): void {
    this.resize();
  }

  private handleStart(): void {
    const event = startOrRestart(
      this.state,
      this.logicalWidth,
      this.logicalHeight,
      this.settings,
      this.theme
    );

    if (event?.type === 'started') {
      this.log.info('Game started');
    } else if (event?.type === 'restarted') {
      this.log.info('Game restarted');
    }
  }

  /** Move paddle based on cached keyboard state. Called from the game loop. */
  private updatePaddleFromKeys(): void {
    const maxX = this.logicalWidth - this.state.paddle.width;

    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      this.state.paddle.x = Math.max(0, this.state.paddle.x - PADDLE_KEYBOARD_SPEED);
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      this.state.paddle.x = Math.min(maxX, this.state.paddle.x + PADDLE_KEYBOARD_SPEED);
    }
  }

  private update(): void {
    if (!this.state.started || this.state.gameOver) return;

    // Keyboard paddle movement — now part of the single game loop
    // (replaces the separate RAF polling loop).
    this.updatePaddleFromKeys();

    // Pure domain step — no DOM access, returns events for side-effect handling
    const events = step(this.state, this.settings, this.logicalWidth, this.logicalHeight);

    // Interpret events and execute side effects (callbacks, logging, redirect)
    this.handleGameEvents(events);
  }

  /** Interpret engine events and execute side effects. */
  private handleGameEvents(events: GameEvent[]): void {
    for (const event of events) {
      switch (event.type) {
        case 'started':
          this.log.info('Game started');
          break;
        case 'restarted':
          this.log.info('Game restarted');
          break;
        case 'blockDestroyed':
          this.options.onBlockDestroyed?.(event.payload?.remaining as number);
          break;
        case 'lifeLost':
          this.log.info('Life lost', { livesRemaining: event.payload?.livesRemaining });
          break;
        case 'ballReset':
          // Ball reset — no additional side effects needed
          break;
        case 'gameOver':
          this.log.info('Game over', { score: event.payload?.score });
          break;
        case 'gameWon':
          this.log.info('Game won', { score: event.payload?.score });
          this.options.onComplete?.();
          this.scheduleRedirect();
          break;
      }
    }
  }

  private scheduleRedirect(): void {
    if (!this.options.redirectUrl) return;

    this.log.info('Redirecting', { url: this.options.redirectUrl });
    const delay = this.options.redirectDelay ?? 2000;
    const url = this.options.redirectUrl;
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  }

  private gameLoop = (now = 0): void => {
    // Frame rate cap: skip update+render if called too soon
    if (now - this.lastFrameTime >= TARGET_FRAME_MS) {
      this.lastFrameTime = now;
      this.update();
      // Only render when the state actually advanced
      render(
        this.ctx,
        this.state,
        this.theme,
        this.options.showScore ?? true,
        this.logicalWidth,
        this.logicalHeight
      );
    }
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Remove window-level listeners to prevent leaks across instance
    // create/destroy cycles (e.g. HMR, React Strict Mode).
    this.canvas.removeEventListener('mousemove', this.boundHandlePointerMove);
    this.canvas.removeEventListener('touchmove', this.boundHandlePointerMove);
    this.canvas.removeEventListener('click', this.boundHandleStart);
    this.canvas.removeEventListener('touchstart', this.boundHandleStart);
    window.removeEventListener('keydown', this.boundHandleKeydown);
    window.removeEventListener('keyup', this.boundHandleKeyup);

    this.canvas.remove();
    this.log.info('Game destroyed');
  }

  public reset(): void {
    this.state = this.createInitialState();
    this.keys = {};
    this.log.info('Game reset');
  }

  /**
   * Re-apply game options at runtime (e.g. when framework props change).
   *
   * Updates the theme, difficulty settings, callbacks, and redirect config,
   * then resets the game state to apply the new settings. The game restarts
   * from the initial state with the new options.
   */
  public updateOptions(options: Breakout404Options): void {
    this.options = options;
    this.theme = mergeTheme(options.theme);

    const difficulty = resolveDifficulty(options.difficulty);
    this.settings = DIFFICULTY_SETTINGS[difficulty]; // eslint-disable-line security/detect-object-injection
    if (options.difficulty !== undefined && options.difficulty !== difficulty) {
      this.log.warn('Invalid difficulty, defaulting to medium', { difficulty: options.difficulty });
    }

    // Re-validate redirect URL
    if (options.redirectUrl && !isValidRedirectUrl(options.redirectUrl)) {
      this.log.warn(
        'Invalid redirectUrl rejected (only http:, https:, or relative paths allowed)',
        { redirectUrl: options.redirectUrl }
      );
      this.options = { ...options, redirectUrl: undefined };
    }

    // Reset state to pick up new difficulty/theme
    this.state = this.createInitialState();
    this.keys = {};
    this.log.info('Options updated', { difficulty, showScore: options.showScore ?? true });
  }
}
