# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Architecture
- **Extracted pure game engine into `engine.ts`** — all domain logic (physics, collision, win/lose state machine) is now separated from DOM/IO concerns in `game.ts`. The engine is framework-agnostic and fully unit-testable with no browser mocks required.
- **Separated side effects from domain logic** — `Breakout404Game.update()` now delegates to the pure `engine.step()` function and interprets returned `GameEvent` values, keeping DOM manipulation and callbacks in the adapter layer (clean architecture / dependency inversion).
- **`Breakout404Game.updateOptions()`** — new public method to re-apply game options at runtime without destroying and recreating the game instance.
- **`isValidRedirectUrl()` is now SSR-safe** — no longer depends on `window.location.href`; falls back to a static base URL when `window` is unavailable. Accepts an optional `baseUrl` parameter.

### Fixed
- **Window-level event listener memory leak** — `keydown`/`keyup` listeners are now stored as bound references and removed in `destroy()`. Previously they accumulated indefinitely across game instance create/destroy cycles (e.g. React HMR, Strict Mode).
- **Second `requestAnimationFrame` loop eliminated** — keyboard paddle movement is now handled within the single main game loop instead of a separate independent RAF loop.
- **`getBoundingClientRect()` no longer called every frame** — canvas dimensions are cached from the last `ResizeObserver` callback and reused in the update loop, eliminating per-frame layout reflows.
- **React wrapper option updates** — changing `difficulty`, `theme`, `redirectUrl`, etc. via props now properly re-applies to the running game via `updateOptions()` instead of a no-op `reset()`.
- **`onBlockDestroyed` callback optimized** — remaining-block count is now computed with a running counter (O(n) per frame) instead of `blocks.filter().length` per hit (O(n²) worst case).
- **Vue wrapper missing `logger` prop** — the Vue component now supports the `logger` option, matching the React wrapper and core API.

### Added
- **`engine.test.ts`** — 33 new tests covering the game engine: state initialization, difficulty resolution, start/restart logic, ball physics, wall/paddle/block collisions, win/lose conditions, and event emission.
- **SSR-safety tests** for `isValidRedirectUrl()` with explicit `baseUrl` parameter.
- **`GameEvent` / `GameEventType` types** — domain-level event descriptors for the engine's pure step function.
- **Engine exports** — `DIFFICULTY_SETTINGS`, `MAX_CANVAS_DIM`, `TARGET_FRAME_MS`, `createInitialState`, `startOrRestart`, `step`, `countActiveBlocks` are now exported from the public API.

### Dead Code / Cleanup
- **Removed unused `vite-plugin-dts` dependency** from `packages/core` devDependencies (type declarations are generated via `tsc --emitDeclarationOnly`, not the Vite plugin).
- **Re-exported full public API** from `@3rg0n/breakout404-react` and `@3rg0n/breakout404-vue` — previously only `defaultTheme`, `Breakout404Theme`, and `Breakout404Options` were re-exported; now all core exports are available from the wrapper packages.
- **Eliminated `eslint-disable` suppressions** in `game.ts` by typing `DIFFICULTY_SETTINGS` as `Record<'easy' | 'medium' | 'hard', ...>` and using a new `resolveDifficulty()` helper.

### Documentation
- Fixed stale `@breakout404/*` package scope references → `@3rg0n/breakout404/*` in `CHANGELOG.md` and `THREAT_MODEL.md`.
- Fixed `examples/go/go.mod` module name from `pong404-example` → `breakout404-example`.
- Updated stale file/line references in `THREAT_MODEL.md` remediation table.

## [0.5.0] - 2026-04-08

### Added
- Custom `404.html` for GitHub Pages — any non-existent path loads the Breakout game
- Marketing landing page at `index.html` with install instructions, code snippet, and feature overview
- `Breakout404Logger` interface for structured logging of game lifecycle events (init, start, game over, win, redirect, life lost, reset, destroy)
- `logger` option in `Breakout404Options` — pass a custom logger to capture game events server-side
- `isValidRedirectUrl()` exported utility for redirect URL validation
- `security.test.ts` — 8 tests covering redirect URL validation against XSS protocols
- Security headers middleware in Express example (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- `.npmrc` with explicit `@3rg0n` registry scoping to prevent dependency confusion
- `publishConfig` in all workspace package.json files
- `eslint-plugin-security` for static security analysis
- GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`) with lint, typecheck, test, audit, and SBOM generation
- `.gitignore` patterns for certificate/key files

### Changed
- `redirectUrl` parameter is now validated — only `http:`, `https:`, and relative paths (`/...`) are accepted; dangerous protocols are rejected with a warning
- Canvas dimensions are now capped at 4096px to prevent GPU/memory exhaustion on oversized containers
- Game loop now uses frame rate tracking (~60 FPS cap) to prevent excessive CPU usage on high-refresh displays
- Invalid `difficulty` values now fall back to `'medium'` with a warning instead of crashing

### Fixed
- Ball passing through blocks when hitting multiple blocks in a single frame (dy reversal canceled out on even-count hits)
- Ball deflection now uses overlap-based axis detection — side hits reverse dx, top/bottom hits reverse dy
- DPR double-scaling causing blocks to overflow viewport — separated logical (CSS) dimensions from pixel (canvas) dimensions
- Paddle positioned behind bottom controls — moved to 85% viewport height
- Open redirect vulnerability (CWE-601) via unvalidated `redirectUrl` parameter
- 27 known CVEs remediated by updating all dependencies (Next.js 14→16, vitest 1→4, vite 5→6, typescript-eslint 6→8, vite-plugin-dts 3→4)
- Canvas resource exhaustion (CWE-400) via unbounded canvas dimensions and uncapped animation frame rate

### Security
- 0 known vulnerabilities (`pnpm audit` clean)
- MAESTRO threat model completed (`THREAT_MODEL.md`)

## [0.1.0] - 2026-04-07

### Added
- Initial release
- Core Breakout-style game engine (`@3rg0n/breakout404-core`)
- React wrapper component (`@3rg0n/breakout404-react`)
- Vue wrapper component (`@3rg0n/breakout404-vue`)
- Blocks arranged to spell "404"
- Three difficulty levels (easy, medium, hard)
- Customizable themes (background, paddle, ball, blocks, text, font)
- Keyboard, mouse, and touch controls
- Optional redirect after game completion
- `onComplete` and `onBlockDestroyed` callbacks
- Examples for HTML, Express.js, Next.js, and Go
