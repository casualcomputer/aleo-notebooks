# Aleo, Visualized

> An interactive Quarto book about Aleo's privacy primitives and how to ship
> apps with them. Click sliders, watch trees grow, see proofs climb. The
> visual companion to [aleo-skills](https://github.com/casualcomputer/aleo-skills).

## Live site

Once deployed: <https://aleo-visualized.example> *(replace with your domain)*.

## Local preview

### One-time setup

Install Quarto (>= 1.4):

```bash
# macOS
brew install --cask quarto

# Or download from https://quarto.org/docs/get-started/
```

### Build

```bash
cd concepts
quarto preview          # serves at http://localhost:4848 with hot reload
quarto render           # one-shot full build to ./_site/
quarto render --to pdf  # exports a PDF book (requires LaTeX)
```

The Observable JS chapters (e.g., the Merkle tree explorer) work entirely
in-browser — no Python kernel required for those. Chapters that use Python
(e.g., the bytecode walker) need a Python environment with `jupyter` available.

## Repo structure

```
concepts/
  _quarto.yml                          # site config, sidebar, theme
  index.qmd                            # landing page
  01-foundations/                      # 3 chapters: why ZK, records vs mappings, fields
  02-cryptographic-primitives/         # 3 chapters: hashes, Merkle trees ✨, commitments
  03-privacy-patterns/                 # 3 chapters: on/off-chain, view keys, burner wallets
  04-real-systems/                     # 4 chapters: credits, registry, USDCx, NullPay
  05-build-it/                         # 3 chapters: install, first program, deploy
  assets/                              # images, diagrams
  .github/workflows/publish.yml        # builds on push, deploys to GitHub Pages
  README.md
  .gitignore
```

The flagship chapter is **[02-cryptographic-primitives/02-merkle-trees.qmd](02-cryptographic-primitives/02-merkle-trees.qmd)** —
an interactive Merkle tree explorer that explains how USDCx and USAD enforce
sanctions compliance without revealing the freeze list. **If you only ship
one chapter for traction, ship that one.**

## Authoring conventions

Every chapter has the same shape:

1. **The question** — a concrete problem an engineer would actually face
2. **The Aleo answer** — primitive(s), with verified mainnet citations
3. **An interactive viz** (Observable JS, Python, or static SVG)
4. **The implementation** — what the deployed bytecode/code looks like

Authoring discipline:

- **Every claim about Aleo programs is verified** by a curl-able endpoint
  cited in the chapter. No hand-waving.
- **Pin versions** — Leo v4.0.x, `@provablehq/sdk ^0.10.x`. Update the front
  matter on each chapter when re-verified.
- **No vendor names in conceptual prose** (Supabase, Firebase, etc.) — only
  in concrete examples or implementation chapters.

## Deployment

The GitHub Action in `.github/workflows/publish.yml` builds the book on every
push to `main` and deploys to GitHub Pages. To set up:

1. In the repo settings → Pages → Source = "GitHub Actions"
2. Push to `main`
3. Site lives at `https://<username>.github.io/aleo-notebooks/concepts/`
   (or your custom domain if you set `CNAME` in `_quarto.yml`)

For a custom domain via Vercel:

1. Connect your GitHub repo to Vercel
2. Set root dir to `concepts/`
3. Set build command to `quarto render`
4. Set output dir to `_site`

## Monetization-ready hooks

The book is structured to support several monetization paths without
rebuilding:

- **Pay-what-you-want PDF** — `quarto render --to pdf` produces a print-ready
  book. Sell on Gumroad / LeanPub.
- **Paid newsletter** — every chapter has a date in front matter; cohort
  releases work cleanly.
- **Sponsorship slots** — `_quarto.yml` `format.html.css` lets you add a
  sponsor banner template per chapter.
- **Cohort-based course** — the chapters are sequenced as a 6-week course
  (1 part per week).

## Contributing

PRs welcome. Please:

- Use the same chapter shape (question → answer → viz → implementation)
- Verify any new mainnet claims with a curl-able endpoint
- Keep chapters under 500 lines (push depth into linked references)

## Companion projects

- [aleo-skills](https://github.com/casualcomputer/aleo-skills) — Claude Code
  plugin / AI dev reference
- [NullPay](https://github.com/casualcomputer) — production-grade Aleo invoice
  dApp (the case study for the [04-real-systems/04-nullpay-walkthrough.qmd](04-real-systems/04-nullpay-walkthrough.qmd) chapter)

## License

CC BY-NC-SA 4.0 for the prose. MIT for the code in the book.
