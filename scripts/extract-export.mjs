#!/usr/bin/env node
// Extrai os dados brutos do omg-export/*.json para arquivos legíveis.
// Cria: omg-export/web/index.html, omg-export/pastes/*.txt,
//       omg-export/weblog/*.md, omg-export/now.md, omg-export/_redirects

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = "omg-export";

async function read(file) {
  return JSON.parse(await readFile(join(BASE, file), "utf8"));
}

async function save(path, content) {
  await mkdir(join(...path.split("/").slice(0, -1)), { recursive: true });
  await writeFile(path, content, "utf8");
  console.log("  ✓", path);
}

function slug(s) {
  return String(s).replace(/[^\w.\-]+/g, "_").toLowerCase();
}

async function main() {
  // ── Homepage HTML ──────────────────────────────────────────────
  console.log("\n[Homepage]");
  const web = await read("web.json");
  const html = web?.response?.content ?? web?.content;
  if (html) await save(`${BASE}/web/index.html`, html);

  // ── Pastes ─────────────────────────────────────────────────────
  console.log("\n[Pastes]");
  const pb = await read("pastebin.json");
  const pastes = pb?.response?.pastebin ?? [];
  for (const p of pastes) {
    const name = slug(p.title || "untitled");
    await save(`${BASE}/pastes/${name}.txt`, p.content ?? "");
  }
  console.log(`  ${pastes.length} pastes extraídos`);

  // ── Weblog ─────────────────────────────────────────────────────
  console.log("\n[Weblog]");
  const wl = await read("weblog.json");
  const entries = wl?.response?.entries ?? [];
  for (const e of entries) {
    const name = slug(e.title || e.entry);
    const date = new Date(e.date * 1000).toISOString().slice(0, 10);
    const md = `---\ntitle: ${JSON.stringify(e.title)}\ndate: ${date}\nstatus: ${e.status}\nlocation: ${e.location}\n---\n\n${e.source}`;
    await save(`${BASE}/weblog/${name}.md`, md);
  }

  // ── /now page ──────────────────────────────────────────────────
  console.log("\n[Now page]");
  const now = await read("now.json");
  const nowContent = now?.response?.now?.content ?? "";
  if (nowContent) await save(`${BASE}/now.md`, nowContent);

  // ── _redirects (Cloudflare Pages format) ──────────────────────
  console.log("\n[PURLs → _redirects]");
  const pu = await read("purls.json");
  const purls = pu?.response?.purls ?? [];

  // Separate active (non-broken) from broken (pointing to paste.tucas.me)
  const broken = purls.filter(p => p.url?.includes("paste.tucas.me") || p.url?.includes("tucas.me/"));
  const active = purls.filter(p => !p.url?.includes("paste.tucas.me") && !p.url?.includes("tucas.me/"));

  let redirects = "# Cloudflare Pages _redirects\n";
  redirects += "# Generated from omg.lol PURLs export\n";
  redirects += "# Format: /path  destination  status\n\n";
  redirects += "# ── Active PURLs ──────────────────────────────\n";
  for (const p of active) {
    redirects += `/${p.name}  ${p.url}  301\n`;
  }
  redirects += "\n# ── Broken (pointed to expired paste.tucas.me) ──\n";
  for (const p of broken) {
    redirects += `# /${p.name}  ${p.url}  [BROKEN - tucas.me expired]\n`;
  }
  await save(`${BASE}/_redirects`, redirects);

  // ── Summary ────────────────────────────────────────────────────
  const summary = {
    exportedAt: new Date().toISOString(),
    homepageBytes: html?.length ?? 0,
    pastes: pastes.length,
    weblogEntries: entries.length,
    purls: { total: purls.length, active: active.length, broken: broken.length },
  };
  await save(`${BASE}/_summary.json`, JSON.stringify(summary, null, 2) + "\n");

  console.log("\n✓ Extração completa:");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(e => { console.error(e.message); process.exit(1); });
