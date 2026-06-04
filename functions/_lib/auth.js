// Autenticação de sessão via cookie assinado com HMAC-SHA256.
// Usa apenas a Web Crypto API nativa (disponível no Cloudflare Workers e no
// Node 20+ via globalThis.crypto). Sem dependências externas.

export const COOKIE_NAME = "omgadmin_session";
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias, em segundos

// --- base64url helpers (sem padding, URL-safe) ---

function bytesToBase64url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const encoder = new TextEncoder();

async function importKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function hmac(secret, data) {
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(sig);
}

// Comparação em tempo constante para evitar timing attacks.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Gera um token assinado. Formato: base64url(payloadJSON).base64url(hmac).
 * @param {object} payload  ex.: { exp: <unix seconds> }. Se exp ausente, usa maxAge.
 * @param {string} secret
 * @param {number} [maxAge] segundos de validade quando payload.exp não é fornecido
 */
export async function signToken(payload, secret, maxAge = DEFAULT_MAX_AGE) {
  const body = { exp: Math.floor(Date.now() / 1000) + maxAge, ...payload };
  const payloadPart = bytesToBase64url(encoder.encode(JSON.stringify(body)));
  const sig = await hmac(secret, payloadPart);
  return `${payloadPart}.${bytesToBase64url(sig)}`;
}

/**
 * Verifica um token. Retorna o payload decodificado se válido, senão null.
 */
export async function verifyToken(token, secret) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [payloadPart, sigPart] = token.split(".");
  if (!payloadPart || !sigPart) return null;

  const expected = await hmac(secret, payloadPart);
  let provided;
  try {
    provided = base64urlToBytes(sigPart);
  } catch {
    return null;
  }
  if (!timingSafeEqual(expected, provided)) return null;

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadPart)));
  } catch {
    return null;
  }
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload;
}

/** Lê o valor de um cookie a partir do header Cookie. */
export function readCookie(request, name = COOKIE_NAME) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

/** Monta o header Set-Cookie para a sessão. */
export function sessionCookie(value, maxAge = DEFAULT_MAX_AGE) {
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`,
  ];
  return attrs.join("; ");
}

/** Header Set-Cookie que expira/limpa a sessão. */
export function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
