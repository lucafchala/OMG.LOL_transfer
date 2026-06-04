// GET  /api/web  — retorna o HTML atual da homepage.
// POST /api/web  — salva novo HTML da homepage.

import { omgFetch, json, error } from "../_lib/omg.js";

export async function onRequestGet(context) {
  const r = await omgFetch(context.env, "/web");
  if (!r.ok) return error(r.message || "Falha ao carregar a homepage.", r.status || 502);
  // omg.lol retorna o conteúdo em response.content
  return json({ content: r.data?.content ?? "" });
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return error("Corpo inválido.", 400);
  }
  if (typeof body?.content !== "string") {
    return error("Campo 'content' obrigatório.", 400);
  }

  const r = await omgFetch(context.env, "/web", {
    method: "POST",
    body: { content: body.content, publish: true },
  });
  if (!r.ok) return error(r.message || "Falha ao salvar a homepage.", r.status || 502);
  return json({ ok: true, message: r.message });
}
