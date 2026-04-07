import { Breakout404Game } from './game';

export { Breakout404Game } from './game';
export { defaultTheme, mergeTheme } from './theme';
export { isValidRedirectUrl } from './security';
export type {
  Breakout404Theme,
  Breakout404Options,
  Breakout404Logger,
  Block,
  Ball,
  Paddle,
  GameState,
} from './types';

// Default export for UMD usage
export default Breakout404Game;
