# now.lucafchala.com — scaffold

> **Status: to build.** This folder is a scaffold (README + structure only). The page itself is intentionally **not** generated yet — write `index.html` later.

The `/now` page — a public snapshot of what Luca is currently focused on (a [nownownow.com](https://nownownow.com)-style page). Linked from the homepage **Services** row and the `url` hub grid; polled by `status.lucafchala.com`.

## Architecture

- **Platform:** Cloudflare Pages, static, no build step (serve from repo root).
- **Repo to create:** `lucafchala/now.lucafchala.com` → Pages project → DNS `now` CNAME.
- A single static page; no backend, no env vars.

## Source content (ready to use)

- `OMG.LOL_transfer/content/now/now.md` — the exported `/now` text, last updated **2026-05-20** (English).
- ⚠️ **Remove** the trailing `[Back to my omg.lol page!](https://tucas.omg.lol)` line when building the page.

## Structure to build

```
now.lucafchala.com/
├── index.html    # renders the /now content; theme toggle (◐); "Updated · <date>" line
└── icon.svg      # (optional) site icon — reuse the ecosystem icon style
```

### What `index.html` should do
- Render the sections from `now.md` (Studying / Personal Projects / Learning / Wellbeing).
- Top bar: `← lucafchala.com` back-link + theme toggle persisting `theme` in `localStorage`.
- Show the "Updated · May 20, 2026" date prominently.
- Footer links to Home / All links / Weblog.

## Design

Use the shared ecosystem design system (dark `#0d0c0a` / amber `#c08030`, Cormorant Garamond + JetBrains Mono, grain overlay, `rise` animation, `max-width: 680px`).
➡️ Canonical tokens: <https://github.com/lucafchala/lucafchala.com#design-system>

## Deploy

1. Create repo `lucafchala/now.lucafchala.com`, push `index.html` (+ icon).
2. Cloudflare Pages → connect repo → no build command, output dir `/`.
3. DNS: `now` CNAME → Pages project URL.
