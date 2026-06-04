// Testes da lógica de assinatura/verificação do cookie de sessão.
// Usa o test runner nativo do Node (node --test), sem dependências.

import test from "node:test";
import assert from "node:assert/strict";

import { signToken, verifyToken, readCookie, sessionCookie, clearCookie } from "../functions/_lib/auth.js";

const SECRET = "um-segredo-bem-aleatorio-para-testes";

test("round-trip: token assinado é verificado e retorna o payload", async () => {
  const token = await signToken({ sub: "admin" }, SECRET);
  const payload = await verifyToken(token, SECRET);
  assert.ok(payload, "payload deveria ser válido");
  assert.equal(payload.sub, "admin");
  assert.equal(typeof payload.exp, "number");
});

test("rejeita token com segredo diferente", async () => {
  const token = await signToken({ sub: "admin" }, SECRET);
  const payload = await verifyToken(token, "outro-segredo");
  assert.equal(payload, null);
});

test("rejeita token adulterado (payload alterado)", async () => {
  const token = await signToken({ sub: "admin" }, SECRET);
  const [, sig] = token.split(".");
  // Recodifica um payload diferente mantendo a assinatura antiga.
  const forgedPayload = Buffer.from(JSON.stringify({ sub: "root", exp: 9999999999 }))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const forged = `${forgedPayload}.${sig}`;
  assert.equal(await verifyToken(forged, SECRET), null);
});

test("rejeita token expirado", async () => {
  // maxAge negativo => exp no passado
  const token = await signToken({ sub: "admin" }, SECRET, -10);
  assert.equal(await verifyToken(token, SECRET), null);
});

test("rejeita entradas malformadas", async () => {
  assert.equal(await verifyToken("", SECRET), null);
  assert.equal(await verifyToken("semponto", SECRET), null);
  assert.equal(await verifyToken("a.b.c", SECRET), null);
  assert.equal(await verifyToken(null, SECRET), null);
});

test("readCookie extrai o cookie de sessão do header", () => {
  const value = "abc.def";
  const req = { headers: { get: () => `foo=1; omgadmin_session=${encodeURIComponent(value)}; bar=2` } };
  assert.equal(readCookie(req), value);
});

test("sessionCookie e clearCookie têm atributos de segurança", () => {
  const set = sessionCookie("token123");
  assert.match(set, /HttpOnly/);
  assert.match(set, /Secure/);
  assert.match(set, /SameSite=Lax/);
  assert.match(set, /Max-Age=\d+/);

  const cleared = clearCookie();
  assert.match(cleared, /Max-Age=0/);
});
