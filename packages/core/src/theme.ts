import type { Pong404Theme } from './types';

export const defaultTheme: Pong404Theme = {
  background: '#0a0a0a',
  paddle: '#ffffff',
  ball: '#ffffff',
  blocks: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
  text: '#ffffff',
  font: 'monospace',
};

export function mergeTheme(custom?: Partial<Pong404Theme>): Pong404Theme {
  return { ...defaultTheme, ...custom };
}

export function getBlockColor(theme: Pong404Theme, rowIndex: number): string {
  if (typeof theme.blocks === 'string') {
    return theme.blocks;
  }
  return theme.blocks[rowIndex % theme.blocks.length];
}
