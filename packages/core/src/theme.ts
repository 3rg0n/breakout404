import type { Breakout404Theme } from './types';

export const defaultTheme: Breakout404Theme = {
  background: '#0a0a0a',
  paddle: '#ffffff',
  ball: '#ffffff',
  blocks: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
  text: '#ffffff',
  font: 'monospace',
};

export function mergeTheme(custom?: Partial<Breakout404Theme>): Breakout404Theme {
  return { ...defaultTheme, ...custom };
}

export function getBlockColor(theme: Breakout404Theme, rowIndex: number): string {
  if (typeof theme.blocks === 'string') {
    return theme.blocks;
  }
  return theme.blocks[rowIndex % theme.blocks.length];
}
