# @3rg0n/breakout404-react

React component for [Breakout404](https://github.com/3rg0n/breakout404) — a customizable 404 page game where visitors destroy blocks arranged to spell "404".

**[Live Demo](https://3rg0n.github.io/breakout404/)** · **[Try the 404 page](https://3rg0n.github.io/breakout404/play)**

## Installation

```bash
npm install @3rg0n/breakout404-react
```

Requires React 17 or newer (`react` and `react-dom` are peer dependencies). [`@3rg0n/breakout404-core`](https://www.npmjs.com/package/@3rg0n/breakout404-core) is bundled as a dependency — you don't need to install it separately.

## Usage

### Next.js App Router

```tsx
// app/not-found.tsx
'use client';

import { Breakout404 } from '@3rg0n/breakout404-react';

export default function NotFound() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Breakout404
        difficulty="medium"
        showScore
        onComplete={() => console.log('Game complete!')}
      />
    </div>
  );
}
```

The `'use client'` directive is required — the game renders to a canvas and needs the browser.

### Next.js Pages Router

```tsx
// pages/404.tsx
import { Breakout404 } from '@3rg0n/breakout404-react';

export default function NotFound() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Breakout404 difficulty="medium" redirectUrl="/" />
    </div>
  );
}
```

### Sizing

The component renders a `div` that fills its parent, so give the parent an explicit size. Style it directly with `className` or `style`:

```tsx
<Breakout404 className="my-game" style={{ height: '60vh' }} />
```

## Props

`Breakout404Props` extends `Breakout404Options` from the core package, plus `className` and `style`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `Partial<Breakout404Theme>` | See core docs | Customize colors and fonts |
| `difficulty` | `'easy' \| 'medium' \| 'hard'` | `'medium'` | Game difficulty |
| `showScore` | `boolean` | `true` | Show score and lives |
| `onComplete` | `() => void` | - | Called when all blocks are destroyed |
| `onBlockDestroyed` | `(remaining: number) => void` | - | Called when a block is destroyed |
| `redirectUrl` | `string` | - | URL to redirect to after completion (http/https/relative only) |
| `redirectDelay` | `number` | `2000` | Delay before redirect (ms) |
| `logger` | `Breakout404Logger` | - | Structured logger for game lifecycle events |
| `className` | `string` | - | Class applied to the container `div` |
| `style` | `React.CSSProperties` | - | Inline styles for the container `div` |

### Prop updates

Changing `difficulty`, `theme`, `showScore`, `redirectUrl`, `redirectDelay`, or `logger` re-applies to the running game without recreating it. `onComplete` and `onBlockDestroyed` are held in a ref, so you can pass inline arrow functions without forcing the game to rebuild — the game always calls the latest version.

The instance is created once on mount and `destroy()`d on unmount, so listeners and animation frames are cleaned up correctly under Strict Mode and Fast Refresh.

## Re-exports

Everything public from the core package is re-exported, so you don't need a second import:

```ts
import {
  defaultTheme,
  mergeTheme,
  isValidRedirectUrl,
  DIFFICULTY_SETTINGS,
  step,
  type Breakout404Theme,
  type GameEvent,
} from '@3rg0n/breakout404-react';
```

## Security

`redirectUrl` is validated — only `http:`, `https:`, and relative paths are accepted; `javascript:`, `data:` and similar are rejected. See the [threat model](https://github.com/3rg0n/breakout404/blob/master/THREAT_MODEL.md).

## License

[MIT](https://github.com/3rg0n/breakout404/blob/master/LICENSE)
