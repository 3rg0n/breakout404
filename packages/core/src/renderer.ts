import type { GameState, Breakout404Theme } from './types';

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  theme: Breakout404Theme,
  showScore: boolean
): void {
  const { width, height } = ctx.canvas;

  // Clear canvas
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  // Draw blocks
  state.blocks.forEach((block) => {
    if (block.active) {
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, block.width, block.height);
    }
  });

  // Draw paddle
  ctx.fillStyle = theme.paddle;
  ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height);

  // Draw ball
  ctx.fillStyle = theme.ball;
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw score if enabled
  if (showScore) {
    ctx.fillStyle = theme.text;
    ctx.font = `16px ${theme.font}`;
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${state.score}`, 10, 25);
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${state.lives}`, width - 10, 25);
  }

  // Draw start message
  if (!state.started && !state.gameOver) {
    ctx.fillStyle = theme.text;
    ctx.font = `20px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.fillText('Click or Press Space to Start', width / 2, height * 0.75);
  }

  // Draw game over / win message
  if (state.gameOver) {
    ctx.fillStyle = theme.text;
    ctx.font = `32px ${theme.font}`;
    ctx.textAlign = 'center';

    if (state.won) {
      ctx.fillText('Page Found!', width / 2, height / 2);
      ctx.font = `18px ${theme.font}`;
      ctx.fillText('You destroyed the 404!', width / 2, height / 2 + 35);
    } else {
      ctx.fillText('Game Over', width / 2, height / 2);
      ctx.font = `18px ${theme.font}`;
      ctx.fillText('Click or Press Space to Restart', width / 2, height / 2 + 35);
    }
  }
}
