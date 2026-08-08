import { Breakout404Game } from './game';

export { Breakout404Game } from './game';
export { defaultTheme, mergeTheme } from './theme';
export { isValidRedirectUrl } from './security';
export {
  DIFFICULTY_SETTINGS,
  MAX_CANVAS_DIM,
  TARGET_FRAME_MS,
  createInitialState,
  startOrRestart,
  step,
  countActiveBlocks,
} from './engine';
export type {
  Breakout404Theme,
  Breakout404Options,
  Breakout404Logger,
  Block,
  Ball,
  Paddle,
  GameState,
  DifficultySettings,
  GameEvent,
  GameEventType,
} from './types';

// Default export for UMD usage
export default Breakout404Game;
