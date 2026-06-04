// PUT    /api/purls/:name — atualiza um PURL existente (omg.lol sobrescreve por nome).
// DELETE /api/purls/:name — deleta um PURL.

import { omgFetch, json, error } from "../../_lib/omg.js";
import { buildPurlBody } from "../purls.js";

export async function onRequestPut(context) {
  const name = context.params.name;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return error("Corpo inválido.", 400);
  }
  if (typeof body?.url !== "string" || body.url.trim() === "") {
    return error("Campo 'url' obrigatório.", 400);
  }

  const r = await omgFetch(context.env, "/purl", {
    method: "POST",
    body: buildPurlBody({ name, url: body.url, listed: body.listed }),
  });
  if (!r.ok) return error(r.message || "Falha ao atualizar PURL.", r.status || 502);
  return json({ ok: true, message: r.message });
}

export async function onRequestDelete(context) {
  const name = context.params.name;
  const r = await omgFetch(context.env, `/purl/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
  if (!r.ok) return error(r.message || "Falha ao deletar PURL.", r.status || 502);
  return json({ ok: true, message: r.message });
}
