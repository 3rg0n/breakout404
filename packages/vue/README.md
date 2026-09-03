# @3rg0n/breakout404-vue

Vue 3 component for [Breakout404](https://github.com/3rg0n/breakout404) — a customizable 404 page game where visitors destroy blocks arranged to spell "404".

**[Live Demo](https://3rg0n.github.io/breakout404/)** · **[Try the 404 page](https://3rg0n.github.io/breakout404/play)**

## Installation

```bash
npm install @3rg0n/breakout404-vue
```

Requires Vue 3 (a peer dependency). [`@3rg0n/breakout404-core`](https://www.npmjs.com/package/@3rg0n/breakout404-core) is bundled as a dependency — you don't need to install it separately.

## Usage

```vue
<template>
  <div style="width: 100vw; height: 100vh">
    <Breakout404
      difficulty="medium"
      :show-score="true"
      @complete="onComplete"
      @block-destroyed="onBlockDestroyed"
    />
  </div>
</template>

<script setup>
import { Breakout404 } from '@3rg0n/breakout404-vue';

const onComplete = () => console.log('Game complete!');
const onBlockDestroyed = (remaining) => console.log(`${remaining} blocks left`);
</script>
```

### Nuxt

The game needs the browser, so render it client-side only:

```vue
<!-- error.vue, or pages/[...slug].vue -->
<template>
  <div style="width: 100vw; height: 100vh">
    <ClientOnly>
      <Breakout404 difficulty="medium" redirect-url="/" />
    </ClientOnly>
  </div>
</template>

<script setup>
import { Breakout404 } from '@3rg0n/breakout404-vue';
</script>
```

### Sizing

The component renders a `div` sized `100%` × `100%` with a `400px` minimum height, so give its parent an explicit size. `class` and `style` you put on the component fall through to that `div` as normal Vue attribute inheritance.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `Partial<Breakout404Theme>` | See core docs | Customize colors and fonts |
| `difficulty` | `'easy' \| 'medium' \| 'hard'` | `'medium'` | Game difficulty |
| `showScore` | `boolean` | `true` | Show score and lives |
| `redirectUrl` | `string` | `undefined` | URL to redirect to after completion (http/https/relative only) |
| `redirectDelay` | `number` | `2000` | Delay before redirect (ms) |
| `logger` | `Breakout404Logger` | `undefined` | Structured logger for game lifecycle events |

In templates use kebab-case: `:show-score`, `:redirect-url`, `:redirect-delay`.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `complete` | - | All blocks destroyed |
| `block-destroyed` | `remaining: number` | A block was destroyed |

## Reactivity

Changing any prop re-applies it to the running game without recreating the instance — `theme` is watched deeply, so mutating a nested color works. The game is created on `mounted` and `destroy()`d on `unmounted`, so listeners and animation frames are cleaned up on route changes and HMR.

## Re-exports

Everything public from the core package is re-exported:

```ts
import {
  defaultTheme,
  mergeTheme,
  isValidRedirectUrl,
  DIFFICULTY_SETTINGS,
  step,
  type Breakout404Theme,
  type GameEvent,
} from '@3rg0n/breakout404-vue';
```

## Security

`redirectUrl` is validated — only `http:`, `https:`, and relative paths are accepted; `javascript:`, `data:` and similar are rejected. See the [threat model](https://github.com/3rg0n/breakout404/blob/master/THREAT_MODEL.md).

## License

[MIT](https://github.com/3rg0n/breakout404/blob/master/LICENSE)
