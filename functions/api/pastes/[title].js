// PUT    /api/pastes/:title — atualiza um paste existente (omg.lol sobrescreve por título).
// DELETE /api/pastes/:title — deleta um paste.

import { omgFetch, json, error } from "../../_lib/omg.js";
import { buildPasteBody } from "../pastes.js";

export async function onRequestPut(context) {
  const title = context.params.title;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return error("Corpo inválido.", 400);
  }
  if (typeof body?.content !== "string") {
    return error("Campo 'content' obrigatório.", 400);
  }

  // O título do recurso vem da URL; o corpo só carrega conteúdo/listed.
  const r = await omgFetch(context.env, "/pastebin", {
    method: "POST",
    body: buildPasteBody({ title, content: body.content, listed: body.listed }),
  });
  if (!r.ok) return error(r.message || "Falha ao atualizar paste.", r.status || 502);
  return json({ ok: true, message: r.message });
}

export async function onRequestDelete(context) {
  const title = context.params.title;
  const r = await omgFetch(context.env, `/pastebin/${encodeURIComponent(title)}`, {
    method: "DELETE",
  });
  if (!r.ok) return error(r.message || "Falha ao deletar paste.", r.status || 502);
  return json({ ok: true, message: r.message });
}
