import { describe, it, expect } from 'vitest';
import { defaultTheme, mergeTheme, getBlockColor } from './theme';

describe('theme', () => {
  describe('defaultTheme', () => {
    it('has all required properties', () => {
      expect(defaultTheme.background).toBeDefined();
      expect(defaultTheme.paddle).toBeDefined();
      expect(defaultTheme.ball).toBeDefined();
      expect(defaultTheme.blocks).toBeDefined();
      expect(defaultTheme.text).toBeDefined();
      expect(defaultTheme.font).toBeDefined();
    });
  });

  describe('mergeTheme', () => {
    it('returns default theme when no custom theme provided', () => {
      const theme = mergeTheme();
      expect(theme).toEqual(defaultTheme);
    });

    it('merges custom properties with defaults', () => {
      const theme = mergeTheme({ background: '#ff0000' });
      expect(theme.background).toBe('#ff0000');
      expect(theme.paddle).toBe(defaultTheme.paddle);
    });

    it('overrides multiple properties', () => {
      const theme = mergeTheme({
        background: '#000',
        paddle: '#fff',
        ball: '#red',
      });
      expect(theme.background).toBe('#000');
      expect(theme.paddle).toBe('#fff');
      expect(theme.ball).toBe('#red');
    });
  });

  describe('getBlockColor', () => {
    it('returns single color when blocks is a string', () => {
      const theme = { ...defaultTheme, blocks: '#ff0000' };
      expect(getBlockColor(theme, 0)).toBe('#ff0000');
      expect(getBlockColor(theme, 5)).toBe('#ff0000');
    });

    it('cycles through colors array based on row index', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      const theme = { ...defaultTheme, blocks: colors };

      expect(getBlockColor(theme, 0)).toBe('#ff0000');
      expect(getBlockColor(theme, 1)).toBe('#00ff00');
      expect(getBlockColor(theme, 2)).toBe('#0000ff');
      expect(getBlockColor(theme, 3)).toBe('#ff0000'); // wraps around
    });
  });
});
