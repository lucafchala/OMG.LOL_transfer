# tildverse.lucafchala.com — scaffold (redirect-only)

> **Status: decide & build.** Scaffold only (README + structure). No files generated yet.

Old omg.lol community ("tildeverse") feature. **No independent content** to migrate.

## Recommendation

Redirect to `lucafchala.com`, **or** remove the DNS entry entirely.

## Architecture

- **Platform:** Cloudflare Pages, static — a single `_redirects` file, no pages.
- **Repo to create (if keeping):** `lucafchala/tildverse.lucafchala.com` → Pages → DNS `tildverse` CNAME.

## Structure to build

```
tildverse.lucafchala.com/
└── _redirects
```

### `_redirects` contents (build later)
```
/*  https://lucafchala.com/:splat  301
```

## Deploy

Create the repo with just `_redirects`, connect to Pages (no build), point the `tildverse` CNAME at it — **or** delete the `tildverse` DNS record and skip the repo.
