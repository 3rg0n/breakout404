import type { Block, Breakout404Theme } from './types';
import { getBlockColor } from './theme';

// Pixel patterns for digits (5 wide x 7 tall)
const DIGIT_PATTERNS: Record<string, number[][]> = {
  '4': [
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
  ],
  '0': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
};

export function create404Blocks(
  canvasWidth: number,
  canvasHeight: number,
  theme: Breakout404Theme
): Block[] {
  const blocks: Block[] = [];

  // Calculate block size based on canvas
  const digitWidth = 5;
  const digitSpacing = 2; // Space between digits in blocks

  // Total width in "block units": 3 digits + 2 spacings
  const totalBlocksWide = digitWidth * 3 + digitSpacing * 2; // 5*3 + 2*2 = 19

  // Scale to fit ~60% of canvas width
  const blockWidth = Math.floor((canvasWidth * 0.6) / totalBlocksWide);
  const blockHeight = blockWidth; // Square blocks

  // Calculate starting position to center the "404"
  const totalWidth = totalBlocksWide * blockWidth;
  const startX = (canvasWidth - totalWidth) / 2;
  const startY = canvasHeight * 0.1; // Start 10% from top

  const digits = ['4', '0', '4'];
  let offsetX = startX;

  digits.forEach((digit) => {
    const pattern = DIGIT_PATTERNS[digit]; // eslint-disable-line security/detect-object-injection

    pattern.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          blocks.push({
            x: offsetX + colIndex * blockWidth,
            y: startY + rowIndex * blockHeight,
            width: blockWidth - 2, // Small gap between blocks
            height: blockHeight - 2,
            active: true,
            color: getBlockColor(theme, rowIndex),
          });
        }
      });
    });

    offsetX += (digitWidth + digitSpacing) * blockWidth;
  });

  return blocks;
}

export function checkBlockCollision(
  ballX: number,
  ballY: number,
  ballRadius: number,
  block: Block
): boolean {
  if (!block.active) return false;

  // Find closest point on block to ball center
  const closestX = Math.max(block.x, Math.min(ballX, block.x + block.width));
  const closestY = Math.max(block.y, Math.min(ballY, block.y + block.height));

  // Calculate distance from ball center to closest point
  const distanceX = ballX - closestX;
  const distanceY = ballY - closestY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  return distance < ballRadius;
}
