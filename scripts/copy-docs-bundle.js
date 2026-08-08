/**
 * Copies the freshly built core bundle into docs/ for the GitHub Pages demo.
 *
 * Run after `pnpm --filter @3rg0n/breakout404-core build`.
 * Adds a version header comment so the deployed bundle identifies its version.
 */
const fs = require('fs');
const path = require('path');

const VERSION = require('../packages/core/package.json').version;
const src = path.resolve(__dirname, '../packages/core/dist/breakout404.mjs');
const dest = path.resolve(__dirname, '../docs/breakout404.mjs');

const header = `/* @3rg0n/breakout404-core v${VERSION} — https://github.com/3rg0n/breakout404 */\n`;
const bundle = fs.readFileSync(src, 'utf8');

fs.writeFileSync(dest, header + bundle);
console.log(`✓ docs/breakout404.mjs updated (v${VERSION}, ${bundle.length} bytes)`);
