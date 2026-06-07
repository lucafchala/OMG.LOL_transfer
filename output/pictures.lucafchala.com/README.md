# pictures.lucafchala.com — scaffold (redirect-only)

> **Status: decide & build.** Scaffold only (README + structure). No files generated yet.

Legacy photos subdomain. The omg.lol account had **zero pictures** uploaded here; the real photo service is `fotos.lucafchala.com` (separate, active).

## Recommendation

Redirect everything to `fotos.lucafchala.com`, **or** remove the DNS entry entirely. There is no content to migrate.

## Architecture

- **Platform:** Cloudflare Pages, static — a single `_redirects` file, no pages.
- **Repo to create (if keeping):** `lucafchala/pictures.lucafchala.com` → Pages → DNS `pictures` CNAME.

## Structure to build

```
pictures.lucafchala.com/
└── _redirects
```

### `_redirects` contents (build later)
```
/*  https://fotos.lucafchala.com/:splat  301
```

## Deploy

Create the repo with just `_redirects`, connect to Pages (no build), point the `pictures` CNAME at it — **or** simply delete the `pictures` DNS record and skip the repo.
