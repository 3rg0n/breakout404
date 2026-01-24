import { describe, it, expect } from 'vitest';
import { create404Blocks, checkBlockCollision } from './blocks';
import { defaultTheme } from './theme';

describe('blocks', () => {
  describe('create404Blocks', () => {
    it('creates blocks for "404" text', () => {
      const blocks = create404Blocks(800, 600, defaultTheme);
      expect(blocks.length).toBeGreaterThan(0);
    });

    it('all blocks are initially active', () => {
      const blocks = create404Blocks(800, 600, defaultTheme);
      expect(blocks.every((b) => b.active)).toBe(true);
    });

    it('blocks have valid dimensions', () => {
      const blocks = create404Blocks(800, 600, defaultTheme);
      blocks.forEach((block) => {
        expect(block.width).toBeGreaterThan(0);
        expect(block.height).toBeGreaterThan(0);
        expect(block.x).toBeGreaterThanOrEqual(0);
        expect(block.y).toBeGreaterThanOrEqual(0);
      });
    });

    it('blocks are positioned within canvas bounds', () => {
      const width = 800;
      const height = 600;
      const blocks = create404Blocks(width, height, defaultTheme);

      blocks.forEach((block) => {
        expect(block.x + block.width).toBeLessThanOrEqual(width);
        expect(block.y + block.height).toBeLessThanOrEqual(height);
      });
    });

    it('scales blocks based on canvas size', () => {
      const smallBlocks = create404Blocks(400, 300, defaultTheme);
      const largeBlocks = create404Blocks(1600, 1200, defaultTheme);

      const smallBlockWidth = smallBlocks[0].width;
      const largeBlockWidth = largeBlocks[0].width;

      expect(largeBlockWidth).toBeGreaterThan(smallBlockWidth);
    });
  });

  describe('checkBlockCollision', () => {
    const block = {
      x: 100,
      y: 100,
      width: 50,
      height: 20,
      active: true,
      color: '#ff0000',
    };

    it('returns false for inactive blocks', () => {
      const inactiveBlock = { ...block, active: false };
      expect(checkBlockCollision(125, 110, 10, inactiveBlock)).toBe(false);
    });

    it('returns true when ball overlaps block', () => {
      // Ball center at middle of block
      expect(checkBlockCollision(125, 110, 10, block)).toBe(true);
    });

    it('returns true when ball overlaps edge of block', () => {
      // Ball center at 92, radius 10, so edge extends to 102 - overlaps block at 100
      expect(checkBlockCollision(92, 110, 10, block)).toBe(true);
    });

    it('returns false when ball is far from block', () => {
      expect(checkBlockCollision(0, 0, 10, block)).toBe(false);
    });

    it('returns false when ball is close but not touching', () => {
      // Ball center at 85, radius 10, so edge at 95 - block starts at 100
      expect(checkBlockCollision(85, 110, 5, block)).toBe(false);
    });
  });
});
