# Migration Hub — CLAUDE.md

This repo is a **migration reference and hub** for moving Luca F. Chala's personal web presence off omg.lol onto self-hosted Cloudflare Pages. Read `README.md` for full context before doing anything.

## What this repo is

Central coordination point for the migration. Contains:
- The original omg.lol admin panel code (preserved for reference / possible repurposing)
- Export scripts used to pull data from omg.lol before expiry
- `content/` directory with all exported content (committed, ready to use)
- `output/` directory where production-ready files for each new repo are written

## Your role as Claude in this repo

When a session opens here, the user wants to tackle one item from the migration checklist in `README.md`. Each checklist item results in:
1. A new GitHub repo (user creates it via github.com/new)
2. Files you write to `output/<subdomain>/` in this repo
3. Cloudflare Pages project (user sets up in dashboard)
4. DNS update (user does in Cloudflare DNS)

**You write the code. The user does the Cloudflare dashboard and GitHub repo creation steps** (this remote environment can't access those directly).

## Key constraints for all new pages

- No build step — static files only, Cloudflare Pages serves from root
- No npm, no frameworks, no bundlers
- Vanilla HTML + CSS + JS only
- Match the design system in README.md (dark bg `#0d0c0a`, amber `#c08030`, Cormorant Garamond + JetBrains Mono)
- Mobile-first (Samsung S26 Ultra primary device)
- PT-BR primary language, EN secondary (pages should support both where applicable)

## Content data

All exported content is committed in `content/` — read it directly, no need to ask the user to paste files.

| Path | What it is |
|---|---|
| `content/homepage/index.html` | Homepage HTML (~23KB) |
| `content/now/now.md` | /now page markdown |
| `content/pastes/*.txt` | 5 pastes (a-mascara, camera-gear, e-mail-me, nirvana-..., vela_f5-2024) |
| `content/redirects/_redirects` | 23 active PURLs in Cloudflare Pages format |
| `content/weblog/*.md` | 2 blog posts |

## Output convention

Write production-ready files to `output/<subdomain>/`. Example: `output/lucafchala.com/index.html`. The user copies these to the new GitHub repo.

## Auth code (reusable)

`functions/_lib/auth.js` contains a working HMAC-SHA256 cookie auth implementation using Web Crypto API (no external deps). Reuse it if any new page needs auth.
