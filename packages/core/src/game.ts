import type { Pong404Options, Pong404Theme, GameState, DifficultySettings } from './types';
import { mergeTheme } from './theme';
import { create404Blocks, checkBlockCollision } from './blocks';
import { render } from './renderer';

const DIFFICULTY_SETTINGS: Record<string, DifficultySettings> = {
  easy: { ballSpeed: 4, paddleWidth: 120, lives: 5 },
  medium: { ballSpeed: 6, paddleWidth: 100, lives: 3 },
  hard: { ballSpeed: 8, paddleWidth: 80, lives: 2 },
};

export class Pong404Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private theme: Pong404Theme;
  private options: Pong404Options;
  private state: GameState;
  private settings: DifficultySettings;
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: string | HTMLElement, options: Pong404Options = {}) {
    // Get or create container
    const containerEl =
      typeof container === 'string' ? document.querySelector<HTMLElement>(container) : container;

    if (!containerEl) {
      throw new Error(`Container not found: ${container}`);
    }

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    containerEl.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;

    // Setup options
    this.options = options;
    this.theme = mergeTheme(options.theme);
    this.settings = DIFFICULTY_SETTINGS[options.difficulty || 'medium'];

    // Initialize state
    this.state = this.createInitialState();

    // Setup canvas size
    this.resize();

    // Setup event listeners
    this.setupEventListeners();

    // Start render loop
    this.gameLoop();
  }

  private createInitialState(): GameState {
    const width = this.canvas.width || 800;
    const height = this.canvas.height || 600;

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
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

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
    } else if (this.state.gameOver && !this.state.won) {
      // Restart game
      this.state = this.createInitialState();
      this.state.started = true;
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

      if (this.state.lives <= 0) {
        this.state.gameOver = true;
        this.state.won = false;
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
      this.options.onComplete?.();

      if (this.options.redirectUrl) {
        setTimeout(() => {
          window.location.href = this.options.redirectUrl!;
        }, this.options.redirectDelay || 2000);
      }
    }
  }

  private gameLoop = (): void => {
    this.update();
    render(this.ctx, this.state, this.theme, this.options.showScore ?? true);
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
  }

  public reset(): void {
    this.state = this.createInitialState();
  }
}
