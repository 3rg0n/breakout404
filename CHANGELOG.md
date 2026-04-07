# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `Breakout404Logger` interface for structured logging of game lifecycle events (init, start, game over, win, redirect, life lost, reset, destroy)
- `logger` option in `Breakout404Options` — pass a custom logger to capture game events server-side
- `isValidRedirectUrl()` exported utility for redirect URL validation
- `security.test.ts` — 8 tests covering redirect URL validation against XSS protocols
- Security headers middleware in Express example (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- `.npmrc` with explicit `@breakout404` registry scoping to prevent dependency confusion
- `publishConfig` in all workspace package.json files
- `eslint-plugin-security` for static security analysis
- GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`) with lint, typecheck, test, audit, and SBOM generation
- `.gitignore` patterns for certificate/key files (`*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `credentials*`, `*secret*`)

### Changed
- `redirectUrl` parameter is now validated — only `http:`, `https:`, and relative paths (`/...`) are accepted; `javascript:`, `data:`, `vbscript:`, `file:`, and `blob:` protocols are rejected with a warning
- Canvas dimensions are now capped at 4096px to prevent GPU/memory exhaustion on oversized containers
- Game loop now uses frame rate tracking (~60 FPS cap) to prevent excessive CPU usage on high-refresh displays
- Invalid `difficulty` values now fall back to `'medium'` with a warning instead of crashing

### Fixed
- Open redirect vulnerability (CWE-601) via unvalidated `redirectUrl` parameter
- 27 known CVEs remediated by updating all dependencies (Next.js 14→16, vitest 1→4, vite 5→6, typescript-eslint 6→8, vite-plugin-dts 3→4)
- Canvas resource exhaustion (CWE-400) via unbounded canvas dimensions and uncapped animation frame rate

### Security
- 0 known vulnerabilities (`pnpm audit` clean)
- MAESTRO threat model completed (`THREAT_MODEL.md`)
