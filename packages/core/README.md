# @3rg0n/breakout404-core

Framework-agnostic core for [Breakout404](https://github.com/3rg0n/breakout404) — a customizable 404 page game where visitors destroy blocks arranged to spell "404".

**[Live Demo](https://3rg0n.github.io/breakout404/)** · **[Try the 404 page](https://3rg0n.github.io/breakout404/play)**

No dependencies. Renders to a canvas inside any container element.

## Installation

```bash
npm install @3rg0n/breakout404-core
```

For React or Vue, use the wrapper packages instead: [`@3rg0n/breakout404-react`](https://www.npmjs.com/package/@3rg0n/breakout404-react) · [`@3rg0n/breakout404-vue`](https://www.npmjs.com/package/@3rg0n/breakout404-vue)

## Usage

```html
<div id="game" style="width: 100%; height: 100vh;"></div>
<script type="module">
  import { Breakout404Game } from '@3rg0n/breakout404-core';

  const game = new Breakout404Game('#game', {
    difficulty: 'medium',
    showScore: true,
  });
</script>
```

The first argument accepts a CSS selector or an `HTMLElement`.

### Cleanup

```js
game.destroy();
```

`destroy()` removes all event listeners and cancels the animation frame. Call it when tearing down the container — in React/Vue this is handled for you by the wrappers.

### Updating options at runtime

```js
game.updateOptions({ difficulty: 'hard' });
```

Re-applies options to the running instance without recreating it.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | `Partial<Breakout404Theme>` | See below | Customize colors and fonts |
| `difficulty` | `'easy' \| 'medium' \| 'hard'` | `'medium'` | Game difficulty |
| `showScore` | `boolean` | `true` | Show score and lives |
| `onComplete` | `() => void` | - | Callback when all blocks destroyed |
| `onBlockDestroyed` | `(remaining: number) => void` | - | Callback when a block is destroyed |
| `redirectUrl` | `string` | - | URL to redirect after completion (http/https/relative only) |
| `redirectDelay` | `number` | `2000` | Delay before redirect (ms) |
| `logger` | `Breakout404Logger` | - | Optional structured logger for game lifecycle events |

### Theme

```typescript
interface Breakout404Theme {
  background: string;         // Canvas background color
  paddle: string;             // Paddle color
  ball: string;               // Ball color
  blocks: string | string[];  // Block color(s) - array cycles per row
  text: string;               // Text color for score/messages
  font: string;               // Font family
}
```

Default:

```js
{
  background: '#0a0a0a',
  paddle: '#ffffff',
  ball: '#ffffff',
  blocks: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
  text: '#ffffff',
  font: 'monospace',
}
```

### Difficulty

| Difficulty | Ball Speed | Paddle Width | Lives |
|------------|------------|--------------|-------|
| Easy | 4 | 120px | 5 |
| Medium | 6 | 100px | 3 |
| Hard | 8 | 80px | 2 |

## Pure engine API

The game logic is a set of pure functions in `engine.ts`, separate from all DOM and canvas concerns. Use these directly to drive the simulation yourself or to test against it without a browser:

```ts
import {
  createInitialState,
  startOrRestart,
  step,
  countActiveBlocks,
  DIFFICULTY_SETTINGS,
  MAX_CANVAS_DIM,
  TARGET_FRAME_MS,
} from '@3rg0n/breakout404-core';
```

`step()` advances one frame and returns `GameEvent` values (block destroyed, life lost, win, game over) for the caller to interpret. It performs no side effects.

## Controls

- **Mouse/Touch** — move paddle by moving cursor/finger
- **Arrow keys / A,D** — move paddle left/right
- **Space / Click** — start, or restart after game over

## Security

`redirectUrl` is validated — only `http:`, `https:`, and relative paths are accepted; `javascript:`, `data:` and other dangerous protocols are rejected. The validator is exported for reuse and is SSR-safe:

```ts
import { isValidRedirectUrl } from '@3rg0n/breakout404-core';

isValidRedirectUrl('/home');                              // true
isValidRedirectUrl('javascript:alert(1)');                // false
isValidRedirectUrl('/home', 'https://example.com');       // explicit base, no window needed
```

Canvas dimensions are capped at 4096px to prevent GPU/memory exhaustion. See the [threat model](https://github.com/3rg0n/breakout404/blob/master/THREAT_MODEL.md).

## License

[MIT](https://github.com/3rg0n/breakout404/blob/master/LICENSE)
