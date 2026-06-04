// POST /api/auth/logout — limpa o cookie de sessão.

import { clearCookie } from "../../_lib/auth.js";
import { json } from "../../_lib/omg.js";

export async function onRequestPost() {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}
