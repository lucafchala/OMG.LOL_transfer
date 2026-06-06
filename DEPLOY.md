# Deploy Guide

How to push each `output/` folder to its own GitHub repo and connect it to Cloudflare Pages — **no terminal required**.

---

## One-time setup

You need:
- GitHub account: `lucafchala`
- Cloudflare account linked to `lfchala4@gmail.com`
- The files from `output/` — download this repo as a ZIP from GitHub if you don't have it locally:
  - github.com/lucafchala/OMG.LOL_transfer → **Code** → **Download ZIP** → extract

---

## Deploy each repo

### 1. `lucafchala.com` — Main homepage + PURLs

**Create the repo**
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `lucafchala.com`
3. Owner: `lucafchala` · Visibility: **Public**
4. Leave all checkboxes unchecked (no README, no .gitignore)
5. Click **Create repository**

**Upload the files**
1. On the empty repo page, click **uploading an existing file**
2. Open File Explorer → navigate to `OMG.LOL_transfer/output/lucafchala.com/`
3. Select both files (`index.html` and `_redirects`) → drag them into the GitHub upload area
4. Commit message: `initial deploy`
5. Make sure **Commit directly to the `main` branch** is selected
6. Click **Commit changes**

**Connect to Cloudflare Pages**
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Create a project**
2. Click **Connect to Git** → authorize GitHub if prompted
3. Select `lucafchala/lucafchala.com` → **Begin setup**
4. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
5. Click **Save and Deploy** — wait for the green ✓

**Update DNS**
1. Cloudflare dashboard → your domain `lucafchala.com` → **DNS**
2. Find the root record (Type `A` or `CNAME`) currently pointing to `hosted.omg.lol`
3. Click **Edit** → change to:
   - Type: `CNAME`
   - Name: `@`
   - Target: your Pages project URL (shown in Pages dashboard, e.g. `lucafchala-com.pages.dev`)
4. Proxy status: **Proxied** (orange cloud)
5. Save

---

### 2. `paste.lucafchala.com` — Paste site

**Create the repo**
1. [github.com/new](https://github.com/new) → Name: `paste.lucafchala.com` · Public · no extras → **Create repository**

**Upload the files**

This folder has subfolders (one per paste slug). GitHub's uploader supports dragging entire folders:

1. On the empty repo page, click **uploading an existing file**
2. Open File Explorer → navigate to `OMG.LOL_transfer/output/paste.lucafchala.com/`
3. Select **all files and folders** (Ctrl+A) → drag the whole selection into the GitHub upload area
4. GitHub will show every file including the nested ones (e.g. `pgp/index.html`, `camera-gear/index.html`)
5. Commit message: `initial deploy`
6. **Commit directly to `main`** → **Commit changes**

> **If drag-and-drop doesn't pick up folders** (some browsers): upload the root files first, then repeat the upload step for each subfolder — click the folder name in the repo → **Add file** → **Upload files**.

**Cloudflare Pages**
Same as above: connect `lucafchala/paste.lucafchala.com`, no build command, output directory `/`

**DNS**
Add a new record: Type `CNAME`, Name `paste`, Target = Pages project URL, Proxied

---

### 3. `dash.lucafchala.com` — Control panel

**Create the repo**
[github.com/new](https://github.com/new) → Name: `dash.lucafchala.com` · Public · no extras → **Create repository**

**Upload the files**
1. **uploading an existing file** → navigate to `output/dash.lucafchala.com/`
2. Select all 5 files: `index.html`, `data.json`, `manifest.json`, `sw.js`, `icon.svg`
3. Drag into GitHub → commit message `initial deploy` → commit to `main`

**Cloudflare Pages**
Connect `lucafchala/dash.lucafchala.com`, no build, output `/`

**DNS**
Add CNAME: Name `dash`, Target = Pages project URL, Proxied

**Configure GitHub PAT (enables PURL + paste editing from the dashboard)**
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) → **Generate new token (classic)**
2. Note: anything descriptive (e.g. `dash editor`)
3. Expiration: No expiration (or 1 year)
4. Scopes: check **`repo`**
5. Click **Generate token** → **copy it immediately** (only shown once)
6. Open `dash.lucafchala.com` in your browser → click **GH** in the top-right controls
7. Paste the token → verify the repo names → **Salvar**
8. The GH button turns amber = connected

---

### 4. `url.lucafchala.com` — Mirror redirects (optional)

**Create the repo**
[github.com/new](https://github.com/new) → Name: `url.lucafchala.com` · Public · no extras → **Create repository**

**Upload the files**
Just one file: `output/url.lucafchala.com/_redirects` → upload → commit to `main`

**Cloudflare Pages + DNS**
Same pattern — connect the repo, no build, CNAME `url` → Pages URL

---

## Making changes after deploy

### Small edits (single file) — fully in browser

1. Go to the repo on github.com (e.g. github.com/lucafchala/lucafchala.com)
2. Click the file you want to edit (e.g. `_redirects`)
3. Click the **pencil icon ✏️** (Edit this file)
4. Make your changes
5. Scroll down → **Commit changes**
6. Choose **Create a new branch for this commit and start a pull request**
7. Name the branch (e.g. `fix/add-bluesky-purl`) → **Propose changes**
8. On the PR page: add a title → **Create pull request** → **Merge pull request**
9. Cloudflare Pages auto-deploys within ~30 seconds of merge

### Replacing a file (e.g. updated index.html)

1. Navigate to the file in the repo
2. Click the **pencil icon ✏️**
3. Select all the text → paste the new content
4. Commit → branch → PR → merge

### Adding a new file

1. In the repo, click **Add file** → **Create new file** or **Upload files**
2. For uploading: drag the file → commit directly to `main` (or via branch + PR for safety)

---

## Commit message format

Keep titles short and descriptive:

```
fix: correct broken PURL for /piauifut2025
feat: add /bluesky redirect
update: refresh camera gear content
chore: sync redirects
```

---

## Deploy order

1. `lucafchala.com` — main domain back online
2. `paste.lucafchala.com` — homepage footer links here (PGP + SSH keys)
3. `dash.lucafchala.com` — configure PAT once paste is live
4. `url.lucafchala.com` — optional mirror, whenever
