# lucafchala — Migration Hub

This repo is the central reference for migrating **Luca F. Chala's** personal web presence off [omg.lol](https://omg.lol) and onto self-hosted [Cloudflare Pages](https://pages.cloudflare.com) projects.

**omg.lol subscription expired: 2026-06-06.** All data was exported before expiry and lives in `content/` in this repo. This document tracks what existed, what needs to be rebuilt, and migration progress.

---

## Context

The previous setup used omg.lol to host and route everything under `lucafchala.com`. Every subdomain was a CNAME pointing to `hosted.omg.lol`. When the subscription lapsed, all of it went dark simultaneously.

**The replacement architecture:** one GitHub repo per subdomain → one Cloudflare Pages project per subdomain → custom domain via Cloudflare DNS. No databases, no servers, no frameworks. Static HTML + `_redirects` files where possible; Cloudflare Workers (Pages Functions) only where server-side logic is genuinely needed.

**Owner:** Luca Ferriani Chala — `lucafchala.com` / `lfchala4@gmail.com`  
**Primary devices:** Samsung S26 Ultra (mobile), tablets  
**Languages:** Portuguese (pt-BR) primary, English secondary  

---

## Content (in `content/`)

All content was exported from the omg.lol API on 2026-06-05, one day before expiry, and committed here.

| File | Contents |
|---|---|
| `content/homepage/index.html` | Full homepage HTML (~23KB) |
| `content/now/now.md` | /now page markdown (updated May 20, 2026) |
| `content/pastes/a-mascara.txt` | School video project page |
| `content/pastes/camera-gear.txt` | Photography gear list (most up-to-date) |
| `content/pastes/e-mail-me.txt` | Contact info |
| `content/pastes/nirvana-e-a-cultura-do-ultrarromantismo.txt` | School video project page |
| `content/pastes/vela_f5-2024.txt` | School video project page |
| `content/redirects/_redirects` | PURLs as Cloudflare Pages `_redirects` format |
| `content/weblog/chatgpt-should-not-have-been-released.md` | Blog post (Dec 2023) |
| `content/weblog/photography-gear.md` | Blog post (Jun 2024) |

> The raw omg.lol API export (`omg-export/`) is gitignored and lives only in the original export machine. Everything worth keeping has been extracted above.

### PURLs summary
- **23 active** redirects in `content/redirects/_redirects`
- **17 broken** (commented out) — pointed to expired `paste.tucas.me` / `tucas.me`
- High-traffic active ones: `/piauifut2024`, `/instagram`, `/signal`, `/buymeacoffee`, `/simplex`, `/piauifut2025`

### Pastes present (5 files)
- `camera-gear` — full photography gear list (most up-to-date version)
- `a-mascara`, `nirvana-e-a-cultura-do-ultrarromantismo`, `vela_f5-2024` — school video project pages (with Drive links)
- `e-mail-me` — contact info

> Note: some pastes from the original export were internal test/scratch files (`teste-api`, `pix`, `sessionid`, etc.) and were not committed.

---

## Migration Checklist

Each item is one GitHub repo + one Cloudflare Pages project + one DNS update.
Ordered by priority. **Start a fresh Claude Code session for each one** — read the "How to use" section below first.

---

### 🔴 Priority 1 — Site is completely dark without these

- [x] **`lucafchala.com`** — Main homepage + PURLs
  - New repo: `lucafchala/lucafchala.com`
  - Output ready in `output/lucafchala.com/` — deploy both files:
    - `index.html` — cleaned-up homepage
    - `_redirects` — 40 PURLs at `lucafchala.com/slug` (all fixed and grouped)
  - Cloudflare Pages: no build command, output directory `/` (root)
  - DNS: update `lucafchala.com` root record — change CNAME from `hosted.omg.lol` to Pages project URL
  - Remaining cleanup (after subdomains are live):
    - Update `.services` section links for subdomains not yet deployed
    - Fix footer PGP/SSH links → `paste.lucafchala.com/{pgp,ssh}` (works once paste is up)

- [x] **`dash.lucafchala.com`** — Main control panel (PWA, installable)
  - New repo: `lucafchala/dash.lucafchala.com`
  - Output ready in `output/dash.lucafchala.com/` (5 files: index.html, data.json, manifest.json, sw.js, icon.svg)
  - Features: service hubs (Fotos primary), GitHub repo links, Cloudflare links, full PURL list with search/copy
  - Copy button copies `lucafchala.com/slug` (PURLs from main domain)
  - Cloudflare Pages: no build, root output
  - DNS: add `dash.lucafchala.com` CNAME → Pages project URL

- [ ] **`url.lucafchala.com`** — Mirror PURL domain (optional)
  - New repo: `lucafchala/url.lucafchala.com`
  - Output in `output/url.lucafchala.com/` — just `_redirects`, same rules as `lucafchala.com`
  - Cloudflare Pages: no build, root output
  - DNS: update `url.lucafchala.com` CNAME → Pages project URL
  - Note: PURLs are primarily at `lucafchala.com/slug`; this domain is a secondary mirror

---

### 🟡 Priority 2 — Linked from homepage, should exist soon

- [ ] **`now.lucafchala.com`** — /now page
  - New repo: `lucafchala/now.lucafchala.com`
  - Source: `content/now/now.md` — needs a simple HTML wrapper matching the homepage aesthetic
  - Last updated: May 20, 2026 (still current content)
  - DNS: update `now.lucafchala.com` CNAME → Pages project URL
  - Fix in content: remove the `[Back to my omg.lol page!](https://tucas.omg.lol)` link at the bottom

- [ ] **`paste.lucafchala.com`** — Pastes / text snippets
  - New repo: `lucafchala/paste.lucafchala.com`
  - Source: `content/pastes/`
  - All 5 committed pastes are worth publishing; drop nothing
  - Design: simple index page listing pastes + individual pages per paste, matching homepage aesthetic
  - DNS: update `paste.lucafchala.com` CNAME → Pages project URL
  - Important: homepage footer links to `paste.lucafchala.com/pgp` and `paste.lucafchala.com/ssh` — add those once paste site is up

- [ ] **`proof.lucafchala.com`** — Ownership proof
  - Simplest option: redirect `proof.lucafchala.com` → `paste.lucafchala.com/proof-of-ownership` once paste site is up
  - Or: standalone one-page site serving the PGP-signed proof text
  - Note: `proof-of-ownership.txt` was not committed (was internal — regenerate from PGP key if needed)
  - DNS: update `proof.lucafchala.com` CNAME → wherever it ends up

---

### 🟢 Priority 3 — Nice to have, not urgent

- [ ] **`weblog.lucafchala.com`** — Blog
  - New repo: `lucafchara/weblog.lucafchala.com`
  - Source: `content/weblog/chatgpt-should-not-have-been-released.md` and `content/weblog/photography-gear.md`
  - Only 2 posts — simple static HTML, index + one page per post
  - Use `content/pastes/camera-gear.txt` for gear list (more up-to-date than the weblog post)
  - DNS: update `weblog.lucafchala.com` CNAME → Pages project URL

- [ ] **`log.lucafchala.com`** — Statuslog
  - Only 5 old entries (2024), essentially unused
  - Options: skip entirely and remove from homepage, or a simple status page
  - If keeping: simplest is a static HTML page with the 5 entries hardcoded
  - Note: the raw `statuses.json` was not committed (5 entries, all 2024)

- [ ] **`pictures.lucafchala.com`** — Photos
  - The omg.lol account had zero pictures uploaded here
  - Actual photos live at `fotos.lucafchala.com` (separate service, still active)
  - Recommendation: redirect `pictures.lucafchala.com` → `fotos.lucafchala.com`, or remove DNS entry entirely

- [ ] **`tildverse.lucafchala.com`** — Tildeverse
  - Was an omg.lol community feature, no independent content
  - Recommendation: redirect to `lucafchala.com` or remove DNS entry

---

### ⚙️ Ongoing / Infrastructure

- [ ] **Homepage cleanup** (after subdomains are rebuilt)
  - Replace `.services` section links for any subdomain not yet live (currently all link to `lucafchala.com` subdomains — correct, just need the targets to exist)
  - Verify `fotos.lucafchala.com` still works (photography link)
  - Add PGP/SSH pastes at `paste.lucafchala.com/pgp` and `/ssh` (footer links point there)
  - Consider adding a `favicon.svg` file to the homepage repo

- [ ] **omg.lucafchala.com** — Admin panel (this repo, currently deployed)
  - The proxy to omg.lol API is non-functional (omg.lol is gone)
  - Decision: archive as-is, or repurpose as an admin panel for the new Cloudflare-hosted content
  - If repurposed: backend would write to Cloudflare KV instead of calling omg.lol

---

## Architecture Reference

```
GitHub repo (lucafchala/<subdomain>)
  └── index.html  (+  _redirects,  other assets)
      │
      │  push to main → auto-deploy
      ▼
Cloudflare Pages project
  └── custom domain: <subdomain>.lucafchala.com
      │
      │  CNAME in Cloudflare DNS
      ▼
  lucafchala.com Cloudflare zone
```

**Rules for all new repos:**
- No build step — Cloudflare Pages serves files directly from root
- No frameworks — vanilla HTML/CSS/JS only
- No npm, no bundlers, no `package.json`
- Match the design system below
- Mobile-first (primary device: Samsung S26 Ultra)

---

## Design System

Replicate these values across all pages for visual consistency:

```css
:root {
  --bg:         #0d0c0a;
  --border:     #252220;
  --text:       #e6e1d6;
  --muted:      #6a6358;
  --accent:     #c08030;     /* amber gold */
  --accent-dim: #6a4818;
  --ctrl-bg:    #161412;
}
```

**Fonts (Google Fonts — already used on homepage):**
- `Cormorant Garamond` (300, 400, 600 + italic) — headings, body text
- `JetBrains Mono` (300, 400, 500) — code, URLs, technical content

**Animation:** `rise` keyframe — `opacity: 0; transform: translateY(18px)` → `opacity: 1; translateY(0)`, `0.9s cubic-bezier(0.16,1,0.3,1)`

**Layout:** single column, `max-width: 680px`, centered, `padding: 48px 32px 72px`

---

## How to Use This Repo in Future Claude Sessions

Each subdomain is best done as its own Claude Code session on the web (claude.ai/code).

**Starting a new session:**
1. Open **this repo** (`lucafchala/OMG.LOL_transfer`) in Claude Code on the web
2. Claude will read this README and have full context automatically
3. Say which checklist item you want to tackle, e.g.: *"Let's do lucafchala.com — the main homepage"*
4. Claude will create the files for the new repo under `output/<subdomain>/`, which you then create on GitHub and connect to Cloudflare Pages
5. Come back here and check off the completed item

**You do NOT need to re-explain the migration, the design system, or the data structure** — this README is the source of truth for all sessions. Update checkboxes as you go.

**All exported content is in `content/`** — Claude can read it directly. No need to paste files.

---

## What's in This Repo

```
content/             Exported omg.lol content (committed, source of truth)
  homepage/
    index.html       Full homepage HTML
  now/
    now.md           /now page markdown
  pastes/            5 text pastes
    a-mascara.txt
    camera-gear.txt
    e-mail-me.txt
    nirvana-e-a-cultura-do-ultrarromantismo.txt
    vela_f5-2024.txt
  redirects/
    _redirects       23 active PURLs in Cloudflare Pages format
  weblog/
    chatgpt-should-not-have-been-released.md
    photography-gear.md
output/              Production-ready files for each new repo (created per session)
  lucafchala.com/
    index.html       Cleaned-up homepage
    _redirects       40 PURLs at lucafchala.com/slug (all 17 previously broken now fixed)
  dash.lucafchala.com/
    index.html       Control panel dashboard (PWA)
    data.json        38 PURLs with group metadata for dashboard display
    manifest.json    PWA manifest
    sw.js            Service worker (offline + installable)
    icon.svg         App icon
  url.lucafchala.com/
    _redirects       Mirror of lucafchala.com/_redirects
functions/           Original omg.lol admin panel backend
  _lib/
    auth.js          HMAC-SHA256 cookie auth (Web Crypto API, reusable)
    omg.js           omg.lol API client (now unused)
scripts/
  export-omg.mjs     Node.js full account export script
  export-omg.bat     Windows batch export (curl)
  extract-export.mjs Extracts raw JSON into readable files
```

---

## Identity / Quick Reference

| | |
|---|---|
| Domain | `lucafchala.com` |
| Email | `lfchala4@gmail.com` · `luca@lucafchala.com` |
| Instagram | `@lucafchala` |
| Radio | PU2XIK — São Paulo, BR |
| PGP fingerprint | `48E7 3F6F A287 1E7B 86EF EA64 8EC4 329A 369B 7B33` |
| Cloudflare account | linked to `lfchala4@gmail.com` |
| GitHub | `lucafchala` |
