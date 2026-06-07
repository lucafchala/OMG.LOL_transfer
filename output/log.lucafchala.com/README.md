# log.lucafchala.com — scaffold (optional)

> **Status: decide & build.** Scaffold only (README + structure). No files generated yet.

Old statuslog. Only **5 entries, all from 2024** — essentially unused.

## Recommendation

Lowest-effort: redirect to `lucafchala.com` (or remove the DNS entry). If you want to preserve the entries, build a single static page with them hardcoded.

> ⚠️ The raw `statuses.json` (5 × 2024 entries) was **not** committed in the migration export — you'll need to re-source the entries if you keep this page.

## Architecture

- **Platform:** Cloudflare Pages, static, no build step.
- **Repo to create (if keeping):** `lucafchala/log.lucafchala.com` → Pages → DNS `log` CNAME.

## Structure to build (pick one)

```
log.lucafchala.com/
└── _redirects        # redirect option
```
### `_redirects` contents (redirect option)
```
/*  https://lucafchala.com/:splat  301
```

— or —

```
log.lucafchala.com/
├── index.html        # static list of the 5 statuslog entries (shared design system)
└── icon.svg
```

## Design (if building the page)

Shared ecosystem design system. ➡️ <https://github.com/lucafchala/lucafchala.com#design-system>
