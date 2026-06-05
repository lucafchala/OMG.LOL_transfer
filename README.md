# lucafchala — Migration Hub

This repo is the central reference for migrating **Luca F. Chala's** personal web presence off [omg.lol](https://omg.lol) and onto self-hosted [Cloudflare Pages](https://pages.cloudflare.com) projects.

**omg.lol subscription expired: 2026-06-06.** All data was exported before expiry. This repo documents what existed, what needs to be rebuilt, and tracks progress.

---

## Context

The previous setup used omg.lol to host and route everything under `lucafchala.com`. Every subdomain was a CNAME pointing to `hosted.omg.lol`. When the subscription lapsed, all of it went dark simultaneously.

**The replacement architecture:** one GitHub repo per subdomain → one Cloudflare Pages project per subdomain → custom domain via Cloudflare DNS. No databases, no servers, no frameworks. Static HTML + `_redirects` files where possible; Cloudflare Workers (Pages Functions) only where server-side logic is genuinely needed.

**Owner:** Luca Ferriani Chala — `lucafchala.com` / `lfchala4@gmail.com`  
**Primary devices:** Samsung S26 Ultra (mobile), tablets  
**Languages:** Portuguese (pt-BR) primary, English secondary  

---

## Exported Data (in `omg-export/`)

All content was exported from the omg.lol API on 2026-06-05, one day before expiry.

| File | Contents |
|---|---|
| `omg-export/web/index.html` | Full homepage HTML (23KB) |
| `omg-export/pastes/*.txt` | 14 pastes as individual text files |
| `omg-export/pastebin.json` | Raw pastebin API response |
| `omg-export/purls.json` | Raw PURLs API response (40 PURLs) |
| `omg-export/_redirects` | PURLs converted to Cloudflare Pages `_redirects` format |
| `omg-export/now.md` | /now page markdown |
| `omg-export/weblog/` | 2 weblog posts as markdown |
| `omg-export/statuses.json` | 5 old statuslog entries |
| `omg-export/email.json` | Email forwarding: `tucas@omg.lol` → `lfchala4@gmail.com` |
| `omg-export/switchboard.md` | Switchboard DNS config (documented, not content) |
| `omg-export/info.json` | Account info, registration, PGP/SSH keys |

> `omg-export/` is gitignored — the data lives only in your local clone.

### PURLs summary
- **40 total** — 23 active, 17 already broken (pointed to expired `paste.tucas.me` / `tucas.me`)
- High-traffic active ones: `piauifut2024` (1135 hits), `instagram` (734), `signal` (533), `buymeacoffee` (510), `simplex` (898), `piauifut2025` (343)

### Notable pastes
- `camera-gear` — full photography gear list (most up-to-date version)
- `proof-of-ownership` — PGP-signed domain ownership proof
- `pgp` — public PGP key block
- `vela_f5-2024`, `a-mascara`, `nirvana-*` — school video project pages (with Drive links)

---

## Migration Checklist

Each item is one GitHub repo + one Cloudflare Pages project + one DNS update.
Ordered by priority. **Start a fresh Claude Code session for each one** — read the "How to use" section below first.

---

### 🔴 Priority 1 — Site is completely dark without these

- [ ] **`lucafchala.com`** — Main homepage
  - New repo: `lucafchala/lucafchala.com`
  - Source: `omg-export/web/index.html` as `index.html`
  - Also add `omg-export/_redirects` as `_redirects` (handles `/instagram`, `/signal`, `/buymeacoffee`, etc.)
  - Cloudflare Pages: no build command, output directory `/` (root)
  - DNS: update `lucafchala.com` root record — change CNAME target from `hosted.omg.lol` to the Pages project URL
  - Cleanup needed in the HTML before publishing:
    - Remove the duplicate `<link rel="icon" href="https://tucas.omg.lol/favicon.ico">` near the top
    - Update the `.services` section footer links (they point to omg.lol subdomains — update as each one gets rebuilt, or remove the section for now)

- [ ] **`url.lucafchala.com`** — Short link redirects (PURLs)
  - New repo: `lucafchala/url.lucafchala.com`
  - Source: `omg-export/_redirects` — rename to `_redirects`, no other files needed
  - Cloudflare Pages: no build, root output — Pages reads `_redirects` automatically
  - DNS: update `url.lucafchala.com` CNAME → Pages project URL
  - Note: `proof.lucafchala.com` was also a PURLs domain on omg.lol — point it here or redirect to `lucafchala.com`

---

### 🟡 Priority 2 — Linked from homepage, should exist soon

- [ ] **`now.lucafchala.com`** — /now page
  - New repo: `lucafchala/now.lucafchala.com`
  - Source: `omg-export/now.md` — needs a simple HTML wrapper matching the homepage aesthetic
  - Last updated: May 20, 2026 (still current content)
  - DNS: update `now.lucafchala.com` CNAME → Pages project URL
  - Fix in content: remove the `[Back to my omg.lol page!](https://tucas.omg.lol)` link at the bottom

- [ ] **`paste.lucafchala.com`** — Pastes / text snippets
  - New repo: `lucafchala/paste.lucafchala.com`
  - Source: selected pastes from `omg-export/pastes/`
  - Pastes worth keeping public: `camera-gear`, `proof-of-ownership`, `pgp`, school video pages (`vela_f5`, `a-mascara`, `nirvana-*`)
  - Pastes to drop: `teste-api`, `teste-flipper-`, `pasta-bin`, `pix`, `sessionid`, `session-id`, `cloudspot_deprecation`
  - Design: simple index page listing pastes + individual pages per paste, matching homepage aesthetic
  - DNS: update `paste.lucafchala.com` CNAME → Pages project URL

- [ ] **`proof.lucafchala.com`** — Ownership proof
  - Simplest option: redirect `proof.lucafchala.com` → `paste.lucafchala.com/proof-of-ownership` once paste site is up
  - Or: standalone one-page site serving the PGP-signed proof text
  - Source: `omg-export/pastes/proof-of-ownership.txt`
  - DNS: update `proof.lucafchala.com` CNAME → wherever it ends up

---

### 🟢 Priority 3 — Nice to have, not urgent

- [ ] **`weblog.lucafchala.com`** — Blog
  - New repo: `lucafchala/weblog.lucafchala.com`
  - Source: `omg-export/weblog/photography_gear.md` and `chatgpt_should_not_have_been_released_.md`
  - Only 2 posts — simple static HTML, index + one page per post
  - Use `camera-gear` paste version for gear list (more up-to-date than the weblog post)
  - DNS: update `weblog.lucafchala.com` CNAME → Pages project URL

- [ ] **`log.lucafchala.com`** — Statuslog
  - Only 5 old entries (2024), essentially unused
  - Options: skip entirely and remove from homepage, or a simple status page
  - If keeping: simplest is a static HTML page with the 5 entries hardcoded
  - Source: `omg-export/statuses.json`

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
  - Replace `.services` section omg.lol links with links to new subdomains
  - Verify `fotos.lucafchala.com` still works (photography link)
  - Update footer: `proof.lucafchala.com` link, PGP/SSH key links (currently `home.omg.lol/keys/...` — these will 404)
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
1. Open **this repo** (`lucafchala/OMG.LOL_INTEGRATION`) in Claude Code on the web
2. Claude will read this README and have full context automatically
3. Say which checklist item you want to tackle, e.g.: *"Let's do lucafchala.com — the main homepage"*
4. Claude will create the files for the new repo, which you then create on GitHub and connect to Cloudflare Pages
5. Come back here and check off the completed item

**You do NOT need to re-explain the migration, the design system, or the data structure** — this README is the source of truth for all sessions. Update checkboxes as you go.

**For Claude:** The export data is in `omg-export/` locally on the user's machine (gitignored). The content you need (homepage HTML, paste content, now page) has been shown in this conversation. If you need to reference specific content, ask the user to paste or upload the relevant file from their `omg-export/` folder.

---

## What's in This Repo

The original omg.lol admin panel code is preserved for reference:

```
public/              SPA admin panel (HTML/CSS/JS)
  index.html         login + app shell
  style.css          terminal/industrial design
  app.js             SPA router, fetch, CodeMirror editor
functions/           Cloudflare Pages Functions
  _lib/auth.js       HMAC-SHA256 cookie auth (reusable)
  _lib/omg.js        omg.lol API client (now unused)
  api/               route handlers (web, pastes, purls, auth)
mcp/                 MCP server for Claude Code (non-functional, omg.lol gone)
scripts/
  export-omg.mjs     Node.js full account export script
  export-omg.bat     Windows batch export (curl)
  extract-export.mjs extracts raw JSON into readable files
test/
  auth.test.js       HMAC cookie auth unit tests (node --test)
omg-export/          exported data — gitignored, local only
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
