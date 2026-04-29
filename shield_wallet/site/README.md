# Shield Wallet Docs — Astro Starlight site

Deployable [Astro Starlight](https://starlight.astro.build) site that wraps the canonical FAQ markdown in `../USERS.md` and `../DEVELOPERS.md` into a polished documentation site, ready for Vercel.

## Folder layout

```
shield_wallet/site/
├── astro.config.mjs       Starlight config (sidebar, head, OG defaults, mermaid loader)
├── package.json           predev/prebuild hooks call sync-content.mjs
├── tsconfig.json
├── scripts/
│   └── sync-content.mjs   copies ../USERS.md and ../DEVELOPERS.md into src/content/docs/
├── src/
│   ├── content.config.ts  Starlight schema, extended to accept keywords + audience frontmatter
│   ├── content/docs/
│   │   ├── index.mdx      home page (hero + capabilities Mermaid diagram + CTAs)
│   │   ├── users.md       (synced, gitignored)
│   │   └── developers.md  (synced, gitignored)
│   ├── styles/custom.css  accent colors, mermaid container, hero CTA grid
│   └── assets/
│       └── shield-logo.svg
└── public/
    ├── favicon.svg
    └── og-image.png       placeholder; replace with a real social preview
```

The single source of truth for the FAQ content is `../USERS.md` and `../DEVELOPERS.md` — those render natively on github.com. The site references them via the sync script so there is **no content duplication**: edit the canonical files, the site picks up the changes on the next build.

## Local development

```bash
cd shield_wallet/site
npm install
npm run dev
```

Open <http://localhost:4321>. Hot reload picks up changes in `index.mdx`, `astro.config.mjs`, and the synced docs. To re-sync after editing `../USERS.md` or `../DEVELOPERS.md`, restart the dev server (the `predev` hook re-copies on start).

## Production build

```bash
npm run build
npm run preview      # serves dist/ locally for sanity check
```

The build emits a fully static site to `dist/`, including:

- Per-page `<title>`, `<meta description>`, OpenGraph, Twitter cards.
- `sitemap-index.xml` (auto-generated when `site:` is set in `astro.config.mjs`).
- Search index (Pagefind) — works offline against the static output.
- Pre-rendered HTML for every page (zero JS by default; Mermaid hydrates client-side).

## Deploying to Vercel

### Option 1: One-shot CLI deploy

```bash
cd shield_wallet/site
npx vercel              # follow prompts; first run links the project
npx vercel --prod       # promote a build to production
```

Vercel auto-detects Astro and uses `npm run build` → `dist/`. The `prebuild` hook syncs the canonical markdown automatically inside Vercel's build container.

### Option 2: GitHub integration

1. Push this repo to GitHub.
2. In the Vercel dashboard, **New Project → Import** the repo.
3. Set **Root Directory** to `shield_wallet/site`.
4. Framework preset: **Astro**.
5. Build command: `npm run build` (default).
6. Output directory: `dist` (default).
7. Deploy.

Subsequent pushes to `main` deploy automatically. PRs get preview URLs.

### Custom domain + canonical URL

After Vercel assigns a production URL (or you point a custom domain), update `astro.config.mjs`:

```js
site: "https://your-real-domain.example",
```

This is what Astro uses to generate absolute URLs in `sitemap-index.xml` and any `<link rel="canonical">` tags. Critical for Google Search Console and for ChatGPT/Perplexity to cite the canonical URL rather than the `vercel.app` preview URL.

## SEO checklist (post-deploy)

1. **Submit the sitemap to Google Search Console** — `https://your-domain/sitemap-index.xml`.
2. **Submit to Bing Webmaster Tools** — Bing is what ChatGPT's web search reads.
3. **Replace `public/og-image.png`** with a real 1200×630 social preview image. The placeholder is fine for staging.
4. **Set the production URL** in `astro.config.mjs` (`site:`) before promoting to production.
5. **Verify per-page metadata** — view source on `/users/` and `/developers/` and confirm `<title>` and `<meta description>` reflect the per-page YAML frontmatter from `../USERS.md` / `../DEVELOPERS.md`.
6. **Lighthouse run** — should score ≥ 95 on Performance / Accessibility / SEO out of the box. If not, check that no large images were added inline.

## Editing the content

Edit `../USERS.md` or `../DEVELOPERS.md` directly. The next `npm run dev` or `npm run build` re-syncs them. Edit `src/content/docs/index.mdx` to change the home page (hero, Mermaid diagram, CTAs).

The Mermaid diagram on the home page is the same one that renders inline on github.com when you view `../README.md`. Both are sourced from the README — keep the diagram in sync if you change one (the index.mdx version uses `<pre class="mermaid">` so the inline mermaid.js loader in `astro.config.mjs` can render it).

## Spinning out into a dedicated repo

If you want this site at its own domain with its own GitHub repo (for cleaner SEO authority), copy the following to a new repo:

- `shield_wallet/USERS.md` → `USERS.md`
- `shield_wallet/DEVELOPERS.md` → `DEVELOPERS.md`
- `shield_wallet/README.md` → `README.md`
- `shield_wallet/site/` → `site/` (or move its contents to the new repo's root)

Then update `scripts/sync-content.mjs` to look for the canonical files at the new path (`../USERS.md` becomes `../USERS.md` if site is at `repo/site/`, or `./USERS.md` if site is at `repo/`).
