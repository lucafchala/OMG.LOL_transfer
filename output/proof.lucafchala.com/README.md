# proof.lucafchala.com — scaffold

> **Status: to build.** Scaffold only (README + structure). The page is **not** generated yet.

Proof-of-ownership / identity page. The homepage footer links here three times: **"Prova de propriedade"**, **"Proven.lol ↗"**, and **"Chave PGP ↗"**. The `url` hub grid lists it as **"proof — prova de domínio"**.

## Architecture

- **Platform:** Cloudflare Pages, static, no build step.
- **Repo to create:** `lucafchala/proof.lucafchala.com` → Pages project → DNS `proof` CNAME.

## Two ways to build it (pick one)

1. **Standalone page** — `index.html` stating ownership of `lucafchala.com`, showing the PGP fingerprint, linking to the full key, and (optionally) embedding/linking the [proven.lol](https://proven.lol) attestation.
2. **Redirect** — a `_redirects` sending `proof` → `paste.lucafchala.com/proof-of-ownership` (once that paste exists). Simplest, but depends on the paste site.

## Source / data

- **PGP fingerprint:** `48E7 3F6F A287 1E7B 86EF EA64 8EC4 329A 369B 7B33`
- Full PGP key lives at `paste.lucafchala.com/pgp` (currently a placeholder — paste the real armored key there).
- ⚠️ The signed `proof-of-ownership.txt` was **not** committed in the migration export — regenerate it from the PGP key (`gpg --clearsign`) before building the standalone version.

## Structure to build (standalone option)

```
proof.lucafchala.com/
├── index.html    # ownership statement + PGP fingerprint + link to full key + proven.lol; copy button
└── icon.svg      # (optional)
```

### Or, redirect option — put this in `_redirects` instead
```
/*  https://paste.lucafchala.com/proof-of-ownership  301
```

## Design

Shared ecosystem design system. ➡️ <https://github.com/lucafchala/lucafchala.com#design-system>

## Deploy

1. Create repo `lucafchala/proof.lucafchala.com`, push the file(s).
2. Cloudflare Pages → no build, root output.
3. DNS: `proof` CNAME → Pages project URL.

> **Note / decide:** the live homepage points **PGP → proof** and **SSH → keys**, while the original migration plan put PGP/SSH as pastes. Decide whether `proof` (this repo) or `keys` is the canonical home for the PGP key and keep them cross-linked.
