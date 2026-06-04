// Helper para falar com a API do omg.lol. Centraliza o Bearer token, a
// montagem da URL com o endereço, e a normalização do envelope de resposta
// ({ request: { success, status_code }, response: {...} }).

const API_BASE = "https://api.omg.lol";

/**
 * Faz uma chamada autenticada à API do omg.lol.
 * @param {object} env  ambiente do Worker (OMG_API_KEY, OMG_ADDRESS)
 * @param {string} path caminho relativo ao endereço, ex.: "/web", "/pastebin"
 * @param {object} [opts] { method, body }  body é serializado como JSON
 * @returns {Promise<{ok: boolean, status: number, data: any, message?: string}>}
 */
export async function omgFetch(env, path, opts = {}) {
  const address = env.OMG_ADDRESS;
  const url = `${API_BASE}/address/${encodeURIComponent(address)}${path}`;
  const init = {
    method: opts.method || "GET",
    headers: {
      Authorization: `Bearer ${env.OMG_API_KEY}`,
      "Content-Type": "application/json",
    },
  };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    return { ok: false, status: 502, data: null, message: `Falha ao contactar omg.lol: ${err.message}` };
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // resposta sem corpo JSON (ex.: alguns DELETE)
  }

  const success = json?.request?.success ?? res.ok;
  const message = json?.response?.message;
  return {
    ok: !!success && res.ok,
    status: json?.request?.status_code || res.status,
    data: json?.response ?? null,
    message,
  };
}

/** Resposta JSON padronizada do nosso proxy. */
export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

/** Erro JSON padronizado. */
export function error(message, status = 400, extraHeaders = {}) {
  return json({ error: message }, status, extraHeaders);
}
