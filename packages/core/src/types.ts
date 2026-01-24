export interface Pong404Theme {
  background: string;
  paddle: string;
  ball: string;
  blocks: string | string[];
  text: string;
  font: string;
}

export interface Pong404Options {
  theme?: Partial<Pong404Theme>;
  difficulty?: 'easy' | 'medium' | 'hard';
  showScore?: boolean;
  onComplete?: () => void;
  onBlockDestroyed?: (remaining: number) => void;
  redirectUrl?: string;
  redirectDelay?: number;
}

export interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  color: string;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameState {
  ball: Ball;
  paddle: Paddle;
  blocks: Block[];
  score: number;
  lives: number;
  gameOver: boolean;
  won: boolean;
  started: boolean;
}

export interface DifficultySettings {
  ballSpeed: number;
  paddleWidth: number;
  lives: number;
}
