#!/usr/bin/env node
// MCP server (stdio, JSON-RPC 2.0) que expõe a API do omg.lol como ferramentas
// para o Claude Code. Sem dependências externas — usa só Node 18+ (fetch nativo).
//
// Reaproveita o mesmo cliente/normalizadores do Worker para manter o comportamento
// idêntico ao do painel web.
//
// Configuração: ver .mcp.json na raiz do repo. Requer as variáveis de ambiente
//   OMG_API_KEY   (sua API key do omg.lol)
//   OMG_ADDRESS   (endereço; default "tucas")

import { omgFetch } from "../functions/_lib/omg.js";
import { normalizePaste, buildPasteBody } from "../functions/api/pastes.js";
import { normalizePurl, buildPurlBody } from "../functions/api/purls.js";

const env = {
  OMG_API_KEY: process.env.OMG_API_KEY,
  OMG_ADDRESS: process.env.OMG_ADDRESS || "tucas",
};

// Garante que a API key existe antes de qualquer chamada.
function requireKey() {
  if (!env.OMG_API_KEY) {
    throw new Error("OMG_API_KEY não definida no ambiente do servidor MCP.");
  }
}

async function call(path, opts) {
  requireKey();
  const r = await omgFetch(env, path, opts);
  if (!r.ok) throw new Error(r.message || `omg.lol respondeu ${r.status}`);
  return r;
}

// ------------------------------------------------------------
// Ferramentas
// ------------------------------------------------------------

const TOOLS = [
  {
    name: "get_homepage",
    description: "Retorna o HTML atual da homepage do endereço omg.lol.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    async handler() {
      const r = await call("/web");
      return r.data?.content ?? "";
    },
  },
  {
    name: "set_homepage",
    description: "Substitui o HTML da homepage pelo conteúdo fornecido e publica.",
    inputSchema: {
      type: "object",
      properties: { content: { type: "string", description: "Novo HTML completo da homepage." } },
      required: ["content"],
      additionalProperties: false,
    },
    async handler({ content }) {
      if (typeof content !== "string") throw new Error("'content' deve ser uma string.");
      await call("/web", { method: "POST", body: { content, publish: true } });
      return "Homepage atualizada e publicada.";
    },
  },
  {
    name: "list_pastes",
    description: "Lista todos os pastes (título, listed/unlisted, data de modificação e conteúdo).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    async handler() {
      const r = await call("/pastebin");
      const list = Array.isArray(r.data?.pastebin) ? r.data.pastebin.map(normalizePaste) : [];
      return JSON.stringify(list, null, 2);
    },
  },
  {
    name: "get_paste",
    description: "Retorna um paste específico pelo título.",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
      additionalProperties: false,
    },
    async handler({ title }) {
      const r = await call("/pastebin");
      const list = Array.isArray(r.data?.pastebin) ? r.data.pastebin.map(normalizePaste) : [];
      const found = list.find((p) => p.title === title);
      if (!found) throw new Error(`Paste '${title}' não encontrado.`);
      return JSON.stringify(found, null, 2);
    },
  },
  {
    name: "create_or_update_paste",
    description: "Cria um paste novo ou atualiza um existente (sobrescreve por título).",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        content: { type: "string" },
        listed: { type: "boolean", description: "true = listado publicamente; default false." },
      },
      required: ["title", "content"],
      additionalProperties: false,
    },
    async handler({ title, content, listed }) {
      if (!title?.trim()) throw new Error("'title' é obrigatório.");
      await call("/pastebin", { method: "POST", body: buildPasteBody({ title, content, listed }) });
      return `Paste '${title}' salvo.`;
    },
  },
  {
    name: "delete_paste",
    description: "Deleta um paste pelo título.",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
      additionalProperties: false,
    },
    async handler({ title }) {
      await call(`/pastebin/${encodeURIComponent(title)}`, { method: "DELETE" });
      return `Paste '${title}' deletado.`;
    },
  },
  {
    name: "list_purls",
    description: "Lista todos os PURLs (nome, URL de destino, contador e listed/unlisted).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    async handler() {
      const r = await call("/purls");
      const list = Array.isArray(r.data?.purls) ? r.data.purls.map(normalizePurl) : [];
      return JSON.stringify(list, null, 2);
    },
  },
  {
    name: "create_or_update_purl",
    description: "Cria um PURL novo ou atualiza um existente (sobrescreve por nome).",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Identificador do PURL (a parte após a barra)." },
        url: { type: "string", description: "URL de destino para onde o PURL redireciona." },
        listed: { type: "boolean", description: "true = listado publicamente; default false." },
      },
      required: ["name", "url"],
      additionalProperties: false,
    },
    async handler({ name, url, listed }) {
      if (!name?.trim()) throw new Error("'name' é obrigatório.");
      if (!url?.trim()) throw new Error("'url' é obrigatória.");
      await call("/purl", { method: "POST", body: buildPurlBody({ name, url, listed }) });
      return `PURL '${name}' salvo (→ ${url}).`;
    },
  },
  {
    name: "delete_purl",
    description: "Deleta um PURL pelo nome.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
      additionalProperties: false,
    },
    async handler({ name }) {
      await call(`/purl/${encodeURIComponent(name)}`, { method: "DELETE" });
      return `PURL '${name}' deletado.`;
    },
  },
];

// ------------------------------------------------------------
// Loop JSON-RPC sobre stdio (mensagens delimitadas por newline)
// ------------------------------------------------------------

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

async function handle(msg) {
  const { id, method, params } = msg;
  const isRequest = id !== undefined && id !== null;

  if (method === "initialize") {
    return send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: params?.protocolVersion || "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "omglol", version: "1.0.0" },
      },
    });
  }
  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return; // notificações: sem resposta
  }
  if (method === "ping") {
    return send({ jsonrpc: "2.0", id, result: {} });
  }
  if (method === "tools/list") {
    return send({ jsonrpc: "2.0", id, result: { tools: TOOLS.map(({ handler, ...t }) => t) } });
  }
  if (method === "tools/call") {
    const tool = TOOLS.find((t) => t.name === params?.name);
    if (!tool) {
      return send({ jsonrpc: "2.0", id, error: { code: -32602, message: `Ferramenta desconhecida: ${params?.name}` } });
    }
    try {
      const text = await tool.handler(params.arguments || {});
      return send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: String(text) }] } });
    } catch (e) {
      return send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true } });
    }
  }
  if (isRequest) {
    send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Método não suportado: ${method}` } });
  }
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue; // ignora linhas inválidas
    }
    handle(msg).catch((e) => {
      if (msg.id !== undefined && msg.id !== null) {
        send({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: e.message } });
      }
    });
  }
});

process.stdin.on("end", () => process.exit(0));
