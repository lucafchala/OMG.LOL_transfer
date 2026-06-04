// GET  /api/purls — lista todos os PURLs.
// POST /api/purls — cria um novo PURL.

import { omgFetch, json, error } from "../_lib/omg.js";

// Normaliza um PURL do formato omg.lol para o nosso.
export function normalizePurl(p) {
  return {
    name: p.name,
    url: p.url ?? "",
    counter: p.counter ?? 0,
    listed: p.listed === true || p.listed === 1 || p.listed === "1",
  };
}

// Monta o corpo aceito pelo omg.lol. listed só é enviado quando verdadeiro.
export function buildPurlBody({ name, url, listed }) {
  const body = { name, url };
  if (listed) body.listed = "true";
  return body;
}

export async function onRequestGet(context) {
  const r = await omgFetch(context.env, "/purls");
  if (!r.ok) return error(r.message || "Falha ao listar PURLs.", r.status || 502);
  const list = Array.isArray(r.data?.purls) ? r.data.purls : [];
  return json({ purls: list.map(normalizePurl) });
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return error("Corpo inválido.", 400);
  }
  if (typeof body?.name !== "string" || body.name.trim() === "") {
    return error("Campo 'name' obrigatório.", 400);
  }
  if (typeof body?.url !== "string" || body.url.trim() === "") {
    return error("Campo 'url' obrigatório.", 400);
  }

  const r = await omgFetch(context.env, "/purl", {
    method: "POST",
    body: buildPurlBody(body),
  });
  if (!r.ok) return error(r.message || "Falha ao criar PURL.", r.status || 502);
  return json({ ok: true, message: r.message });
}
