#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const out = resolve(root, "public/og-image.png");

mkdirSync(dirname(out), { recursive: true });

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#080d19"/>
      <stop offset="0.56" stop-color="#111827"/>
      <stop offset="1" stop-color="#0f2f2f"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#818cf8"/>
      <stop offset="1" stop-color="#2dd4bf"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#020617" flood-opacity="0.5"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1070" cy="80" r="210" fill="#2dd4bf" opacity="0.10"/>
  <circle cx="90" cy="530" r="260" fill="#818cf8" opacity="0.10"/>

  <g transform="translate(80 82)">
    <g transform="translate(0 0)" fill="none" stroke="#2dd4bf" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M46 0 L0 17 V60 C0 90 24 113 46 124 C68 113 92 90 92 60 V17 Z" fill="#2dd4bf" fill-opacity="0.14"/>
      <path d="M25 60 L42 77 L68 42"/>
    </g>
    <text x="122" y="58" fill="#99f6e4" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">ALEO SHIELD WALLET</text>
    <text x="0" y="250" fill="#f8fafc" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="76" font-weight="850">User FAQ and</text>
    <text x="0" y="336" fill="#f8fafc" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="76" font-weight="850">Developer Guide</text>
    <text x="0" y="412" fill="#cbd5e1" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="30" font-weight="500">Private balances, swaps into Aleo, security settings,</text>
    <text x="0" y="456" fill="#cbd5e1" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="30" font-weight="500">and dApp integration notes verified against v1.18.0.</text>
  </g>

  <g transform="translate(795 156)" filter="url(#shadow)">
    <rect width="320" height="260" rx="24" fill="#101827" stroke="#245b70"/>
    <text x="30" y="48" fill="#2dd4bf" font-family="Inter, ui-sans-serif, system-ui" font-size="18" font-weight="800" letter-spacing="3">SHIELD</text>
    <rect x="225" y="26" width="65" height="32" rx="16" fill="#134e4a"/>
    <text x="240" y="48" fill="#ccfbf1" font-family="Inter, ui-sans-serif, system-ui" font-size="14" font-weight="700">v1.18</text>
    <rect x="30" y="88" width="260" height="86" rx="12" fill="#18243a"/>
    <text x="50" y="123" fill="#94a3b8" font-family="Inter, ui-sans-serif, system-ui" font-size="17">Public</text>
    <text x="195" y="123" fill="#f8fafc" font-family="Inter, ui-sans-serif, system-ui" font-size="18" font-weight="800">42.80</text>
    <text x="50" y="156" fill="#94a3b8" font-family="Inter, ui-sans-serif, system-ui" font-size="17">Private</text>
    <text x="195" y="156" fill="#f8fafc" font-family="Inter, ui-sans-serif, system-ui" font-size="18" font-weight="800">18.35</text>
    <rect x="30" y="204" width="58" height="34" rx="9" fill="none" stroke="#334155"/>
    <rect x="100" y="204" width="76" height="34" rx="9" fill="none" stroke="#334155"/>
    <rect x="188" y="204" width="70" height="34" rx="9" fill="none" stroke="#334155"/>
    <text x="47" y="226" fill="#dbeafe" font-family="Inter, ui-sans-serif, system-ui" font-size="13" font-weight="700">Send</text>
    <text x="116" y="226" fill="#dbeafe" font-family="Inter, ui-sans-serif, system-ui" font-size="13" font-weight="700">Shield</text>
    <text x="207" y="226" fill="#dbeafe" font-family="Inter, ui-sans-serif, system-ui" font-size="13" font-weight="700">Swap</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`[generate-og] wrote ${out}`);
