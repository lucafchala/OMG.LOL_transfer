# Deploy Guide

How to push each `output/` folder to its own GitHub repo and connect it to Cloudflare Pages.

---

## Windows (Git for Windows)

### One-time setup

1. Download and install **Git for Windows** from [git-scm.com](https://git-scm.com/download/win)
   - During install, keep all defaults
   - This installs **Git Bash** — a terminal that runs bash commands on Windows

2. Open **Git Bash** (search for it in the Start menu)

3. Set your identity once:
   ```bash
   git config --global user.name "Luca Chala"
   git config --global user.email "lfchala4@gmail.com"
   ```

4. Store credentials so you don't retype your PAT every time:
   ```bash
   git config --global credential.helper manager
   ```
   The first time you `git push`, a browser window opens asking you to sign in to GitHub. After that it's saved.

### Find the output folder path

This repo was cloned somewhere on your machine. The output folders are inside it.

In Git Bash, Windows paths use forward slashes and start with `/c/` instead of `C:\`:
```
C:\Users\Luca\Documents\OMG.LOL_transfer\output\lucafchala.com
becomes
/c/Users/Luca/Documents/OMG.LOL_transfer/output/lucafchala.com
```

To find the path quickly: open File Explorer → navigate to the output folder → click the address bar → copy the path → replace `\` with `/` and `C:` with `/c`.

---

## Deploy steps (same for Windows Git Bash, Mac Terminal, Linux)

Once Git Bash is open, all commands below work identically on every platform.

---

### 1. `lucafchala.com` — Main homepage + PURLs

**Create the repo on GitHub**
1. Go to [github.com/new](https://github.com/new)
2. Name: `lucafchala.com` · Owner: `lucafchala` · Public · **no** README, .gitignore, or license

**Push the files**
```bash
cd /path/to/OMG.LOL_transfer/output/lucafchala.com

git init
git add .
git commit -m "initial deploy"
git branch -M main
git remote add origin https://github.com/lucafchala/lucafchala.com.git
git push -u origin main
```

**Cloudflare Pages**
1. [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create a project → Connect to Git
2. Authorise GitHub if prompted → select `lucafchala/lucafchala.com`
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Output directory: `/`
4. Save and Deploy → wait for green ✓

**DNS**
1. Cloudflare dashboard → your domain `lucafchala.com` → DNS
2. Find the root record (Type `A` or `CNAME`) pointing to `hosted.omg.lol`
3. Edit it: Type `CNAME`, Name `@`, Target = your Pages URL (e.g. `lucafchala-com.pages.dev`)
4. Proxy: **Proxied** (orange cloud)

---

### 2. `paste.lucafchala.com` — Paste site

**Create the repo:** github.com/new → Name: `paste.lucafchala.com` · Public · No README

```bash
cd /path/to/OMG.LOL_transfer/output/paste.lucafchala.com

git init
git add .
git commit -m "initial deploy"
git branch -M main
git remote add origin https://github.com/lucafchala/paste.lucafchala.com.git
git push -u origin main
```

**Cloudflare Pages:** connect `lucafchala/paste.lucafchala.com`, no build, output `/`

**DNS:** Add CNAME — Name `paste`, Target = Pages project URL

---

### 3. `dash.lucafchala.com` — Control panel

**Create the repo:** github.com/new → Name: `dash.lucafchala.com` · Public · No README

```bash
cd /path/to/OMG.LOL_transfer/output/dash.lucafchala.com

git init
git add .
git commit -m "initial deploy"
git branch -M main
git remote add origin https://github.com/lucafchala/dash.lucafchala.com.git
git push -u origin main
```

**Cloudflare Pages:** connect `lucafchala/dash.lucafchala.com`, no build, output `/`

**DNS:** Add CNAME — Name `dash`, Target = Pages project URL

**Configure the GitHub PAT (enables PURL + paste editing)**
1. [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic)
2. Scopes: check `repo` (or fine-grained with `contents: read+write` on the 3 repos)
3. Copy the token
4. Open `dash.lucafchala.com` in browser → click **GH** (top right) → paste token → verify repo names → Save
5. GH button turns amber = ready

---

### 4. `url.lucafchala.com` — Mirror redirects (optional)

**Create the repo:** github.com/new → Name: `url.lucafchala.com` · Public · No README

```bash
cd /path/to/OMG.LOL_transfer/output/url.lucafchala.com

git init
git add .
git commit -m "initial deploy"
git branch -M main
git remote add origin https://github.com/lucafchala/url.lucafchala.com.git
git push -u origin main
```

**Cloudflare Pages + DNS:** same pattern, CNAME `url` → Pages URL

---

## Making changes after deploy

Never edit files directly on `main`. Use a branch + PR — Cloudflare Pages auto-deploys when the PR is merged.

### On Windows (Git Bash) or any terminal

```bash
# Clone the repo (first time only)
git clone https://github.com/lucafchala/lucafchala.com
cd lucafchala.com

# Pull latest
git checkout main && git pull

# Create a branch
git checkout -b fix/something

# Edit the file (open in Notepad, VS Code, or any editor)
# On Windows you can open VS Code from Git Bash:
code index.html

# Stage and commit
git add index.html
git commit -m "fix: update services section"

# Push
git push -u origin fix/something
```

Then go to github.com/lucafchala/lucafchala.com — you'll see a **Compare & pull request** banner. Click it, add a title, create the PR, then merge. Cloudflare deploys within ~30 seconds.

### Commit message format

```
fix: correct broken PURL for /piauifut2025
feat: add /bluesky redirect
update: refresh camera gear content
chore: sync redirects
```

### Quick single-file edit (no terminal at all)

1. Open the file on github.com
2. Click the pencil ✏️ icon
3. Edit
4. "Commit changes" → **Create a new branch** → open PR

Best for small paste edits or adding a PURL without touching git.

---

## Deploy order recommendation

1. `lucafchala.com` — main domain back online
2. `paste.lucafchala.com` — homepage footer links here
3. `dash.lucafchala.com` — configure PAT once paste is live
4. `url.lucafchala.com` — optional mirror, whenever
