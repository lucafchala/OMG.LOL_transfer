# weblog.lucafchala.com — scaffold

> **Status: to build.** Scaffold only (README + folder structure). Pages are **not** generated yet — write the `index.html` files later.

The blog. Two exported posts. Linked from the homepage **Services** row and the `url` hub grid; the homepage "Equipamento / Camera Gear" link points at `weblog.lucafchala.com/2024/06/photography-gear`.

## Architecture

- **Platform:** Cloudflare Pages, static, no build step.
- **Repo to create:** `lucafchala/weblog.lucafchala.com` → Pages project → DNS `weblog` CNAME.
- **URL scheme:** `/<YYYY>/<MM>/<slug>` — mirrors each post's `location:` front-matter and the existing homepage link. Folder-based routing (one `index.html` per post folder).

## Source content (ready to use)

| Post | Date | Source file |
|---|---|---|
| ChatGPT should not have been released. | 2023-12-06 | `content/weblog/chatgpt-should-not-have-been-released.md` |
| Photography gear | 2024-06-24 | `content/weblog/photography-gear.md` |

> For the gear post, `content/pastes/camera-gear.txt` is **more up to date** than the weblog markdown — consider linking to `paste.lucafchala.com/camera-gear` from the post.
> Each markdown file has YAML front-matter (`title`, `date`, `status`, `location`) and uses `[[wiki-link]]` brackets in the gear post — strip the brackets when rendering.

## Structure to build

```
weblog.lucafchala.com/
├── index.html                                           # post list: title + date, newest first, links to each post
├── 2023/12/chatgpt-should-not-have-been-released/
│   └── index.html                                       # the ChatGPT post   (folder created; page TO BUILD)
├── 2024/06/photography-gear/
│   └── index.html                                       # the gear post      (folder created; page TO BUILD)
└── icon.svg                                             # (optional) site icon
```

The post folders already exist in this scaffold (see the `.gitkeep` placeholders) so the URL structure is locked in; drop an `index.html` into each later.

### What the pages should do
- **`index.html`** — list the two posts (Cormorant title + muted date), link to each `/<YYYY>/<MM>/<slug>`. Same list pattern as `paste.lucafchala.com`.
- **Post pages** — render the post body as styled prose; back-link to the index; theme toggle persisting `theme`.

## Design

Shared ecosystem design system (dark `#0d0c0a` / amber `#c08030`, Cormorant Garamond + JetBrains Mono).
➡️ Canonical tokens: <https://github.com/lucafchala/lucafchala.com#design-system>

## Deploy

1. Create repo `lucafchala/weblog.lucafchala.com`, push the files.
2. Cloudflare Pages → no build command, output dir `/`.
3. DNS: `weblog` CNAME → Pages project URL.
