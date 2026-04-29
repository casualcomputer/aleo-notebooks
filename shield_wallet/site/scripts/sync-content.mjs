#!/usr/bin/env node
// Copies the canonical FAQ markdown from shield_wallet/*.md into
// src/content/docs/ so Starlight can render them as pages.
//
// Source of truth lives in shield_wallet/USERS.md and DEVELOPERS.md. The
// destination files are gitignored. Run automatically via `npm run dev` and
// `npm run build` (predev / prebuild hooks in package.json).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..");
const sourceDir = resolve(projectRoot, "..");           // shield_wallet/
const destDir = resolve(projectRoot, "src/content/docs");

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

const files = [
  { src: "USERS.md",      dest: "users.md" },
  { src: "DEVELOPERS.md", dest: "developers.md" },
];

for (const { src, dest } of files) {
  const srcPath = resolve(sourceDir, src);
  const destPath = resolve(destDir, dest);
  if (!existsSync(srcPath)) {
    console.error(`[sync-content] missing source file: ${srcPath}`);
    process.exit(1);
  }
  const content = readFileSync(srcPath, "utf8");
  writeFileSync(destPath, content);
  console.log(`[sync-content] ${src} -> ${dest}`);
}

console.log("[sync-content] done");
