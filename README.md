# Breakout404

A customizable 404 page game library where users destroy blocks forming "404" in a Breakout-style game. Works with any framework.

**[Live Demo](https://3rg0n.github.io/breakout404/)** | **[Try the 404 page](https://3rg0n.github.io/breakout404/play)**

## Features

- Breakout-style gameplay with blocks arranged to spell "404"
- Customizable themes and difficulty
- Framework-agnostic core with React and Vue wrappers
- Responsive canvas that fits any container
- Keyboard, mouse, and touch controls
- Optional redirect after game completion

## Installation

```bash
# Core package (vanilla JS/TS)
npm install @3rg0n/breakout404-core

# React/Next.js
npm install @3rg0n/breakout404-react

# Vue/Nuxt
npm install @3rg0n/breakout404-vue
```

## Quick Start

### Vanilla JavaScript

```html
<div id="game" style="width: 100%; height: 100vh;"></div>
<script type="module">
  import { Breakout404Game } from '@3rg0n/breakout404-core';

  new Breakout404Game('#game', {
    difficulty: 'medium',
    showScore: true,
  });
</script>
```

### React / Next.js

```tsx
// app/not-found.tsx
'use client';

import { Breakout404 } from '@3rg0n/breakout404-react';

export default function NotFound() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Breakout404
        difficulty="medium"
        showScore={true}
        onComplete={() => console.log('Game complete!')}
      />
    </div>
  );
}
```

### Vue / Nuxt

```vue
<template>
  <div style="width: 100vw; height: 100vh">
    <Breakout404
      difficulty="medium"
      :show-score="true"
      @complete="onComplete"
    />
  </div>
</template>

<script setup>
import { Breakout404 } from '@3rg0n/breakout404-vue';

const onComplete = () => console.log('Game complete!');
</script>
```

## Configuration

### Options

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
  background: string;  // Canvas background color
  paddle: string;      // Paddle color
  ball: string;        // Ball color
  blocks: string | string[];  // Block color(s) - array cycles per row
  text: string;        // Text color for score/messages
  font: string;        // Font family
}

// Default theme
{
  background: '#0a0a0a',
  paddle: '#ffffff',
  ball: '#ffffff',
  blocks: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
  text: '#ffffff',
  font: 'monospace',
}
```

### Difficulty Settings

| Difficulty | Ball Speed | Paddle Width | Lives |
|------------|------------|--------------|-------|
| Easy | 4 | 120px | 5 |
| Medium | 6 | 100px | 3 |
| Hard | 8 | 80px | 2 |

## Controls

- **Mouse/Touch**: Move paddle by moving cursor/finger
- **Arrow Keys / A,D**: Move paddle left/right
- **Space / Click**: Start game or restart after game over

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format
```

## Examples

See the `examples/` directory for usage with:

- Plain HTML
- Next.js
- Express.js
- Go

## Security

This project includes a [MAESTRO threat model](THREAT_MODEL.md) and has been hardened against OWASP top 10 vulnerabilities. The `redirectUrl` parameter is validated to reject dangerous protocols (`javascript:`, `data:`, etc.). See [CHANGELOG.md](CHANGELOG.md) for security-related changes.

To report a security issue, please open a GitHub issue or contact the maintainers directly.

## License

[MIT](LICENSE)
