import type {
  Breakout404Options,
  Breakout404Theme,
  Breakout404Logger,
  GameState,
  DifficultySettings,
} from './types';
import { mergeTheme } from './theme';
import { create404Blocks, checkBlockCollision } from './blocks';
import { render } from './renderer';
import { isValidRedirectUrl } from './security';

const DIFFICULTY_SETTINGS: Record<string, DifficultySettings> = {
  easy: { ballSpeed: 4, paddleWidth: 120, lives: 5 },
  medium: { ballSpeed: 6, paddleWidth: 100, lives: 3 },
  hard: { ballSpeed: 8, paddleWidth: 80, lives: 2 },
};

const MAX_CANVAS_DIM = 4096;
const TARGET_FRAME_MS = 1000 / 60; // ~16.67ms for 60 FPS

const noopLogger: Breakout404Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

export class Breakout404Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private theme: Breakout404Theme;
  private options: Breakout404Options;
  private state: GameState;
  private settings: DifficultySettings;
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private lastFrameTime = 0;
  private log: Breakout404Logger;
  private logicalWidth = 800;
  private logicalHeight = 600;

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

    const difficulty = options.difficulty || 'medium';
    this.settings = DIFFICULTY_SETTINGS[difficulty] ?? DIFFICULTY_SETTINGS['medium']; // eslint-disable-line security/detect-object-injection
    if (!DIFFICULTY_SETTINGS[difficulty]) { // eslint-disable-line security/detect-object-injection
      this.log.warn('Invalid difficulty, defaulting to medium', { difficulty });
    }

    // Validate redirectUrl at construction time
    if (options.redirectUrl && !isValidRedirectUrl(options.redirectUrl)) {
      this.log.warn('Invalid redirectUrl rejected (only http:, https:, or relative paths allowed)', {
        redirectUrl: options.redirectUrl,
      });
      this.options = { ...options, redirectUrl: undefined };
    }

    // Initialize state
    this.state = this.createInitialState();

    // Setup canvas size
    this.resize();

    // Setup event listeners
    this.setupEventListeners();

    this.log.info('Game initialized', { difficulty, showScore: options.showScore ?? true });

    // Start render loop
    this.gameLoop();
  }

  private createInitialState(): GameState {
    const width = this.logicalWidth;
    const height = this.logicalHeight;

    return {
      ball: {
        x: width / 2,
        y: height * 0.7,
        dx: this.settings.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
        dy: -this.settings.ballSpeed,
        radius: 8,
      },
      paddle: {
        x: width / 2 - this.settings.paddleWidth / 2,
        y: height - 40,
        width: this.settings.paddleWidth,
        height: 12,
      },
      blocks: create404Blocks(width, height, this.theme),
      score: 0,
      lives: this.settings.lives,
      gameOver: false,
      won: false,
      started: false,
    };
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

    // Recreate state with new dimensions
    if (this.state) {
      const wasStarted = this.state.started;
      const wasGameOver = this.state.gameOver;
      this.state = this.createInitialState();
      this.state.started = wasStarted;
      this.state.gameOver = wasGameOver;
    }
  }

  private setupEventListeners(): void {
    // Mouse/touch movement
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const maxX = rect.width - this.state.paddle.width;
      this.state.paddle.x = Math.max(0, Math.min(x - this.state.paddle.width / 2, maxX));
    };

    this.canvas.addEventListener('mousemove', handlePointerMove);
    this.canvas.addEventListener('touchmove', handlePointerMove);

    // Keyboard movement
    const keys: Record<string, boolean> = {};
    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.handleStart();
      }
    });
    window.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });

    // Update paddle position based on keys
    const updatePaddleFromKeys = () => {
      const speed = 12;
      const rect = this.canvas.getBoundingClientRect();
      const maxX = rect.width - this.state.paddle.width;

      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        this.state.paddle.x = Math.max(0, this.state.paddle.x - speed);
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        this.state.paddle.x = Math.min(maxX, this.state.paddle.x + speed);
      }

      requestAnimationFrame(updatePaddleFromKeys);
    };
    updatePaddleFromKeys();

    // Click/tap to start
    this.canvas.addEventListener('click', () => this.handleStart());
    this.canvas.addEventListener('touchstart', () => this.handleStart());

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.resize());
    if (this.canvas.parentElement) {
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  private handleStart(): void {
    if (!this.state.started && !this.state.gameOver) {
      this.state.started = true;
      this.log.info('Game started');
    } else if (this.state.gameOver && !this.state.won) {
      // Restart game
      this.state = this.createInitialState();
      this.state.started = true;
      this.log.info('Game restarted');
    }
  }

  private update(): void {
    if (!this.state.started || this.state.gameOver) return;

    const { ball, paddle, blocks } = this.state;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collisions
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= width) {
      ball.dx = -ball.dx;
      ball.x = Math.max(ball.radius, Math.min(ball.x, width - ball.radius));
    }
    if (ball.y - ball.radius <= 0) {
      ball.dy = -ball.dy;
      ball.y = ball.radius;
    }

    // Paddle collision
    if (
      ball.y + ball.radius >= paddle.y &&
      ball.y - ball.radius <= paddle.y + paddle.height &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width
    ) {
      // Calculate bounce angle based on where ball hit paddle
      const hitPos = (ball.x - paddle.x) / paddle.width;
      const angle = (hitPos - 0.5) * Math.PI * 0.7; // -63 to +63 degrees

      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = speed * Math.sin(angle);
      ball.dy = -Math.abs(speed * Math.cos(angle));
      ball.y = paddle.y - ball.radius;
    }

    // Block collisions
    blocks.forEach((block) => {
      if (checkBlockCollision(ball.x, ball.y, ball.radius, block)) {
        block.active = false;
        this.state.score += 10;
        ball.dy = -ball.dy;

        this.options.onBlockDestroyed?.(blocks.filter((b) => b.active).length);
      }
    });

    // Ball fell below paddle
    if (ball.y - ball.radius > height) {
      this.state.lives--;
      this.log.info('Life lost', { livesRemaining: this.state.lives });

      if (this.state.lives <= 0) {
        this.state.gameOver = true;
        this.state.won = false;
        this.log.info('Game over', { score: this.state.score });
      } else {
        // Reset ball position
        ball.x = width / 2;
        ball.y = height * 0.7;
        ball.dx = this.settings.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -this.settings.ballSpeed;
        this.state.started = false;
      }
    }

    // Check win condition
    if (blocks.every((b) => !b.active)) {
      this.state.gameOver = true;
      this.state.won = true;
      this.log.info('Game won', { score: this.state.score });
      this.options.onComplete?.();

      if (this.options.redirectUrl) {
        this.log.info('Redirecting', { url: this.options.redirectUrl });
        setTimeout(() => {
          window.location.href = this.options.redirectUrl!;
        }, this.options.redirectDelay || 2000);
      }
    }
  }

  private gameLoop = (now = 0): void => {
    // Frame rate cap: skip frame if called too soon
    if (now - this.lastFrameTime >= TARGET_FRAME_MS) {
      this.lastFrameTime = now;
      this.update();
      render(this.ctx, this.state, this.theme, this.options.showScore ?? true, this.logicalWidth, this.logicalHeight);
    }
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.canvas.remove();
    this.log.info('Game destroyed');
  }

  public reset(): void {
    this.state = this.createInitialState();
    this.log.info('Game reset');
  }
}
