#!/usr/bin/env node
// Exporta TODOS os dados do endereço omg.lol para ./omg-export/.
// Uso:  OMG_API_KEY="sua-chave" OMG_ADDRESS="tucas" node scripts/export-omg.mjs
//
// Não tem dependências externas — usa fetch nativo (Node 18+).
// Cada endpoint vira um arquivo .json em omg-export/; o HTML da homepage e
// o conteúdo de cada paste também são gravados como arquivos individuais
// em omg-export/web/ e omg-export/pastes/ para facilitar a migração.

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API = "https://api.omg.lol";
const KEY = process.env.OMG_API_KEY;
const ADDR = process.env.OMG_ADDRESS || "tucas";
const OUT = "omg-export";

if (!KEY) {
  console.error("ERRO: defina OMG_API_KEY no ambiente antes de rodar.");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${KEY}` };

// Endpoints a serem capturados. `key` vira o nome do arquivo em omg-export/.
const ENDPOINTS = [
  { key: "account-info", path: `/account/${ADDR}/info`, note: "info da conta" },
  { key: "address-info", path: `/address/${ADDR}/info`, note: "info do endereço" },
  { key: "web", path: `/address/${ADDR}/web`, note: "homepage HTML" },
  { key: "pastebin", path: `/address/${ADDR}/pastebin`, note: "pastes" },
  { key: "purls", path: `/address/${ADDR}/purls`, note: "PURLs" },
  { key: "now", path: `/address/${ADDR}/now`, note: "now page" },
  { key: "statuses", path: `/address/${ADDR}/statuses`, note: "statuslog" },
  { key: "weblog-entries", path: `/address/${ADDR}/weblog/entries`, note: "weblog" },
  { key: "pics", path: `/address/${ADDR}/pics`, note: "pics" },
  { key: "pfp", path: `/address/${ADDR}/pfp`, note: "foto de perfil" },
  { key: "dns", path: `/address/${ADDR}/dns`, note: "registros DNS" },
  { key: "email", path: `/address/${ADDR}/email`, note: "encaminhamento de email" },
  { key: "theme", path: `/address/${ADDR}/theme`, note: "tema do perfil" },
];

async function get(path) {
  const res = await fetch(API + path, { headers });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const summary = [];

  for (const ep of ENDPOINTS) {
    process.stdout.write(`→ ${ep.path}  (${ep.note}) ... `);
    let result;
    try {
      result = await get(ep.path);
    } catch (e) {
      console.log(`FALHOU (${e.message})`);
      summary.push({ ...ep, status: "fetch-error", error: e.message });
      continue;
    }
    await writeFile(
      join(OUT, `${ep.key}.json`),
      JSON.stringify(result.data, null, 2) + "\n"
    );
    console.log(`${result.status}${result.ok ? " ✓" : " ✗"}`);
    summary.push({ key: ep.key, path: ep.path, status: result.status, ok: result.ok });
  }

  // Extrai a homepage como arquivo .html legível.
  const web = summary.find((s) => s.key === "web" && s.ok);
  if (web) {
    try {
      const j = JSON.parse(await readFileSafe(join(OUT, "web.json")));
      const html = j?.response?.content ?? j?.content;
      if (typeof html === "string") {
        await mkdir(join(OUT, "web"), { recursive: true });
        await writeFile(join(OUT, "web", "index.html"), html);
        console.log("→ homepage extraída para omg-export/web/index.html");
      }
    } catch {}
  }

  // Extrai cada paste como arquivo individual.
  const pb = summary.find((s) => s.key === "pastebin" && s.ok);
  if (pb) {
    try {
      const j = JSON.parse(await readFileSafe(join(OUT, "pastebin.json")));
      const list = j?.response?.pastebin ?? j?.pastebin ?? [];
      if (Array.isArray(list) && list.length) {
        await mkdir(join(OUT, "pastes"), { recursive: true });
        for (const p of list) {
          const name = String(p.title || "untitled").replace(/[^\w.-]+/g, "_");
          await writeFile(join(OUT, "pastes", `${name}.txt`), p.content ?? "");
        }
        console.log(`→ ${list.length} paste(s) extraído(s) para omg-export/pastes/`);
      }
    } catch {}
  }

  await writeFile(
    join(OUT, "_summary.json"),
    JSON.stringify({ address: ADDR, exportedAt: new Date().toISOString(), endpoints: summary }, null, 2) + "\n"
  );
  console.log("\n✓ Export completo em ./omg-export/  (ver _summary.json)");
}

async function readFileSafe(p) {
  const { readFile } = await import("node:fs/promises");
  return readFile(p, "utf8");
}

main().catch((e) => {
  console.error("Erro fatal:", e.message);
  process.exit(1);
});
