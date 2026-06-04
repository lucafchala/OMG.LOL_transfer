// POST /api/auth/login — valida a senha e seta o cookie de sessão assinado.

import { signToken, sessionCookie } from "../../_lib/auth.js";
import { json, error } from "../../_lib/omg.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return error("Servidor mal configurado: ADMIN_PASSWORD/SESSION_SECRET ausentes.", 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return error("Corpo inválido.", 400);
  }

  const password = body?.password;
  if (typeof password !== "string" || password.length === 0) {
    return error("Senha obrigatória.", 400);
  }

  // Comparação direta da senha; o segredo de assinatura é separado.
  if (password !== env.ADMIN_PASSWORD) {
    return error("Senha incorreta.", 401);
  }

  const token = await signToken({ sub: "admin" }, env.SESSION_SECRET);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token) });
}
