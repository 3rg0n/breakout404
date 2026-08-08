import { Breakout404 } from './Breakout404';

export { Breakout404, type Breakout404Props } from './Breakout404';
export {
  defaultTheme,
  mergeTheme,
  isValidRedirectUrl,
  DIFFICULTY_SETTINGS,
  MAX_CANVAS_DIM,
  TARGET_FRAME_MS,
  createInitialState,
  startOrRestart,
  step,
  countActiveBlocks,
} from '@3rg0n/breakout404-core';
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
} from '@3rg0n/breakout404-core';
export default Breakout404;
