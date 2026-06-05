# Migration Hub — CLAUDE.md

This repo is a **migration reference and hub** for moving Luca F. Chala's personal web presence off omg.lol onto self-hosted Cloudflare Pages. Read `README.md` for full context before doing anything.

## What this repo is

Central coordination point for the migration. Contains:
- The original omg.lol admin panel code (preserved for reference / possible repurposing)
- Export scripts used to pull data from omg.lol before expiry
- `omg-export/` directory (gitignored) with the full account backup

## Your role as Claude in this repo

When a session opens here, the user wants to tackle one item from the migration checklist in `README.md`. Each checklist item results in:
1. A new GitHub repo (user creates it via github.com/new)
2. Files you write/commit here or describe for the user to copy
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

## Export data

`omg-export/` is gitignored and lives only on the user's local machine. If you need content from it (homepage HTML, paste content, now page markdown), ask the user to paste or upload the relevant file. The key files are:
- `omg-export/web/index.html` — homepage HTML (23KB)
- `omg-export/pastes/*.txt` — 14 pastes as text files
- `omg-export/_redirects` — 23 active PURLs in Cloudflare Pages format
- `omg-export/now.md` — /now page content
- `omg-export/weblog/*.md` — 2 blog posts

## Development branch

Work on: `claude/new-session-qOrVA`
Push to: `origin claude/new-session-qOrVA`

## Auth code (reusable)

`functions/_lib/auth.js` contains a working HMAC-SHA256 cookie auth implementation using Web Crypto API (no external deps). Reuse it if any new page needs auth.
