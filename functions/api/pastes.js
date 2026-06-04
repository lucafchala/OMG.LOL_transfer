// GET  /api/pastes — lista todos os pastes.
// POST /api/pastes — cria um novo paste.

import { omgFetch, json, error } from "../_lib/omg.js";

// Normaliza um paste do formato omg.lol para o nosso.
export function normalizePaste(p) {
  return {
    title: p.title,
    content: p.content ?? "",
    modified_on: p.modified_on ?? null,
    listed: p.listed === true || p.listed === 1 || p.listed === "1",
  };
}

// Monta o corpo aceito pelo omg.lol. listed só é enviado quando verdadeiro.
export function buildPasteBody({ title, content, listed }) {
  const body = { title, content: content ?? "" };
  if (listed) body.listed = 1;
  return body;
}

export async function onRequestGet(context) {
  const r = await omgFetch(context.env, "/pastebin");
  if (!r.ok) return error(r.message || "Falha ao listar pastes.", r.status || 502);
  const list = Array.isArray(r.data?.pastebin) ? r.data.pastebin : [];
  return json({ pastes: list.map(normalizePaste) });
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return error("Corpo inválido.", 400);
  }
  if (typeof body?.title !== "string" || body.title.trim() === "") {
    return error("Campo 'title' obrigatório.", 400);
  }
  if (typeof body?.content !== "string") {
    return error("Campo 'content' obrigatório.", 400);
  }

  const r = await omgFetch(context.env, "/pastebin", {
    method: "POST",
    body: buildPasteBody(body),
  });
  if (!r.ok) return error(r.message || "Falha ao criar paste.", r.status || 502);
  return json({ ok: true, message: r.message });
}
