// Middleware de autenticação para todas as rotas /api/*.
// Exige um cookie de sessão válido, exceto para o próprio login.

import { COOKIE_NAME, readCookie, verifyToken } from "../_lib/auth.js";
import { error } from "../_lib/omg.js";

// Rotas que NÃO exigem sessão.
const PUBLIC_PATHS = new Set(["/api/auth/login"]);

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (PUBLIC_PATHS.has(url.pathname)) {
    return next();
  }

  if (!env.SESSION_SECRET) {
    return error("Servidor mal configurado: SESSION_SECRET ausente.", 500);
  }

  const token = readCookie(request, COOKIE_NAME);
  const payload = token ? await verifyToken(token, env.SESSION_SECRET) : null;
  if (!payload) {
    return error("Não autenticado.", 401);
  }

  return next();
}
