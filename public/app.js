// omg.lol admin — SPA (vanilla JS, sem build step).
// Estrutura: helpers DOM → camada de API (real + mock) → editor (CodeMirror/CDN
// com fallback p/ textarea) → cache → auth → router → renderers das 3 seções.

// ============================================================
// Config
// ============================================================

const ADDRESS = "tucas"; // espelha OMG_ADDRESS; usado só para montar URLs públicas
const PASTE_URL = (title) => `https://${ADDRESS}.paste.lol/${encodeURIComponent(title)}`;
const PURL_URL = (name) => `https://${ADDRESS}.url.lol/${encodeURIComponent(name)}`;

// Mock mode: ?mock=1 na URL, ou localStorage 'omgadmin_mock' === '1'.
const MOCK =
  new URLSearchParams(location.search).get("mock") === "1" ||
  localStorage.getItem("omgadmin_mock") === "1";

// ============================================================
// DOM helpers
// ============================================================

function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, "");
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

const $ = (sel, root = document) => root.querySelector(sel);

function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

function fmtDate(ts) {
  if (!ts) return "";
  const n = Number(ts);
  const d = new Date(n > 1e12 ? n : n * 1000); // segundos ou ms
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

async function copy(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = h("textarea", {}, text);
    document.body.append(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  if (btn) {
    const old = btn.textContent;
    btn.textContent = "copiado!";
    setTimeout(() => (btn.textContent = old), 1100);
  }
}

// ============================================================
// API layer
// ============================================================

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function realApi(path, opts = {}) {
  const init = { method: opts.method || "GET", credentials: "include", headers: {} };
  if (opts.body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }
  const res = await fetch("/api" + path, init);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* sem corpo */
  }
  if (res.status === 401) {
    showLogin();
    throw new ApiError(data?.error || "Não autenticado.", 401);
  }
  if (!res.ok) throw new ApiError(data?.error || `Erro ${res.status}.`, res.status);
  return data;
}

const api = MOCK ? mockApi : realApi;

// ---- Mock backend (somente cliente) ----

const mockState = {
  loggedIn: false,
  web: { content: "<h1>tucas</h1>\n<p>página de exemplo servida pelo mock.</p>\n<p>edite à esquerda →</p>" },
  pastes: [
    { title: "sobre", content: "olá, isto é um paste de exemplo.", modified_on: 1700000000, listed: true },
    { title: "config-secreta", content: "chave=xyz\nnão listada", modified_on: 1710000000, listed: false },
  ],
  purls: [
    { name: "gh", url: "https://github.com/tucas", counter: 42, listed: true },
    { name: "cv", url: "https://example.com/cv.pdf", counter: 3, listed: false },
  ],
};

async function mockApi(path, opts = {}) {
  const method = opts.method || "GET";
  console.info(`[mock] ${method} ${path}`, opts.body ?? "");
  await new Promise((r) => setTimeout(r, 180)); // latência simulada

  if (path === "/auth/login") {
    mockState.loggedIn = true;
    return { ok: true };
  }
  if (path === "/auth/logout") {
    mockState.loggedIn = false;
    return { ok: true };
  }
  if (!mockState.loggedIn) {
    showLogin();
    throw new ApiError("Não autenticado.", 401);
  }

  if (path === "/web") {
    if (method === "GET") return { content: mockState.web.content };
    mockState.web.content = opts.body.content;
    return { ok: true };
  }
  if (path === "/pastes") {
    if (method === "GET") return { pastes: mockState.pastes.map((p) => ({ ...p })) };
    const { title, content, listed } = opts.body;
    upsert(mockState.pastes, "title", { title, content, listed: !!listed, modified_on: Date.now() / 1000 });
    return { ok: true };
  }
  if (path.startsWith("/pastes/")) {
    const title = decodeURIComponent(path.slice("/pastes/".length));
    if (method === "DELETE") {
      mockState.pastes = mockState.pastes.filter((p) => p.title !== title);
      return { ok: true };
    }
    upsert(mockState.pastes, "title", {
      title,
      content: opts.body.content,
      listed: !!opts.body.listed,
      modified_on: Date.now() / 1000,
    });
    return { ok: true };
  }
  if (path === "/purls") {
    if (method === "GET") return { purls: mockState.purls.map((p) => ({ ...p })) };
    const { name, url, listed } = opts.body;
    upsert(mockState.purls, "name", { name, url, listed: !!listed, counter: 0 });
    return { ok: true };
  }
  if (path.startsWith("/purls/")) {
    const name = decodeURIComponent(path.slice("/purls/".length));
    if (method === "DELETE") {
      mockState.purls = mockState.purls.filter((p) => p.name !== name);
      return { ok: true };
    }
    const existing = mockState.purls.find((p) => p.name === name) || { counter: 0 };
    upsert(mockState.purls, "name", {
      name,
      url: opts.body.url,
      listed: !!opts.body.listed,
      counter: existing.counter,
    });
    return { ok: true };
  }
  throw new ApiError(`mock: rota desconhecida ${path}`, 404);
}

function upsert(arr, key, item) {
  const i = arr.findIndex((x) => x[key] === item[key]);
  if (i >= 0) arr[i] = { ...arr[i], ...item };
  else arr.unshift(item);
}

// ============================================================
// Editor (CodeMirror 6 via CDN ESM, com fallback p/ <textarea>)
// ============================================================

let cmPromise = null;
function loadCM() {
  if (cmPromise) return cmPromise;
  cmPromise = (async () => {
    try {
      const [core, langHtml, theme] = await Promise.all([
        import("https://esm.sh/codemirror@6.0.1"),
        import("https://esm.sh/@codemirror/lang-html@6.4.9"),
        import("https://esm.sh/@codemirror/theme-one-dark@6.1.2"),
      ]);
      return { EditorView: core.EditorView, basicSetup: core.basicSetup, html: langHtml.html, oneDark: theme.oneDark };
    } catch (e) {
      console.warn("CodeMirror indisponível, usando textarea.", e);
      return null;
    }
  })();
  return cmPromise;
}

// Cria um editor dentro de `host`. Retorna { getValue, setValue, focus }.
async function createEditor(host, { doc = "", language = null, onChange = () => {} } = {}) {
  host.innerHTML = "";
  const cm = await loadCM();

  if (cm) {
    const extensions = [
      cm.basicSetup,
      cm.oneDark,
      cm.EditorView.updateListener.of((v) => {
        if (v.docChanged) onChange(view.state.doc.toString());
      }),
    ];
    if (language === "html") extensions.push(cm.html());
    const view = new cm.EditorView({ doc, extensions, parent: host });
    return {
      getValue: () => view.state.doc.toString(),
      setValue: (val) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: val } }),
      focus: () => view.focus(),
    };
  }

  // Fallback
  const ta = h("textarea", { class: "textarea", spellcheck: "false" });
  ta.value = doc;
  ta.addEventListener("input", () => onChange(ta.value));
  host.append(ta);
  return { getValue: () => ta.value, setValue: (v) => (ta.value = v), focus: () => ta.focus() };
}

// ============================================================
// Cache em memória
// ============================================================

const cache = { web: null, pastes: null, purls: null };

async function loadSection(name, force = false) {
  if (!force && cache[name] != null) return cache[name];
  const path = name === "web" ? "/web" : "/" + name;
  const data = await api(path);
  cache[name] = data;
  return data;
}

function invalidate(name) {
  cache[name] = null;
}

// ============================================================
// Auth
// ============================================================

const loginEl = $("#login");
const appEl = $("#app");

function showLogin() {
  appEl.classList.add("hidden");
  loginEl.classList.remove("hidden");
  $("#login-password").focus();
}
function showApp() {
  loginEl.classList.add("hidden");
  appEl.classList.remove("hidden");
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#login-submit");
  const errEl = $("#login-error");
  const spinner = $(".spinner", btn);
  errEl.textContent = "";
  spinner.classList.remove("hidden");
  try {
    await api("/auth/login", { method: "POST", body: { password: $("#login-password").value } });
    $("#login-password").value = "";
    showApp();
    navigate(currentSection || "web");
  } catch (err) {
    errEl.textContent = err.message || "Falha no login.";
  } finally {
    spinner.classList.add("hidden");
  }
});

$("#logout").addEventListener("click", async () => {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  for (const k of Object.keys(cache)) cache[k] = null;
  showLogin();
});

// ============================================================
// Router
// ============================================================

const main = $("#main");
let currentSection = null;

const renderers = { web: renderWeb, pastes: renderPastes, purls: renderPurls };

function navigate(name) {
  currentSection = name;
  for (const btn of document.querySelectorAll(".nav-item[data-section]")) {
    btn.classList.toggle("active", btn.dataset.section === name);
  }
  renderers[name]();
}

for (const btn of document.querySelectorAll(".nav-item[data-section]")) {
  btn.addEventListener("click", () => navigate(btn.dataset.section));
}

// Cabeçalho de seção reutilizável.
function sectionHead(title, actions = []) {
  const titleEl = h("h1", { class: "section-title" }, title);
  const head = h("div", { class: "section-head" }, titleEl, h("div", { class: "section-actions" }, ...actions));
  return { head, titleEl };
}

function refreshButton(onClick) {
  return h("button", { class: "icon-btn", title: "Recarregar (força novo fetch)", onclick: onClick }, "↺");
}

// ============================================================
// Seção: Homepage
// ============================================================

async function renderWeb() {
  main.innerHTML = "";
  const status = h("span", { class: "status" }, "");
  const saveBtn = h(
    "button",
    { class: "btn btn-primary" },
    h("span", { class: "btn-label" }, "salvar"),
    h("span", { class: "spinner hidden" }),
  );
  const { head, titleEl } = sectionHead("Homepage", [
    status,
    refreshButton(() => renderWeb.forceReload()),
    saveBtn,
  ]);
  main.append(head);

  const editorHost = h("div", { class: "editor-host" });
  const iframe = h("iframe", { sandbox: "allow-same-origin", title: "preview" });
  const grid = h(
    "div",
    { class: "web-grid" },
    h("div", { class: "web-pane" }, h("div", { class: "pane-label" }, "HTML"), editorHost),
    h("div", { class: "web-pane" }, h("div", { class: "pane-label" }, "preview"), h("div", { class: "preview" }, iframe)),
  );
  const loading = h("div", { class: "loading" }, "carregando…");
  main.append(loading);

  let saved = "";
  const setModified = (mod) => {
    titleEl.innerHTML = mod ? 'Homepage <span class="modified">● modificado</span>' : "Homepage";
    status.className = "status" + (mod ? "" : " saved");
    status.textContent = mod ? "modificado" : saved !== "" ? "salvo" : "";
  };
  const updatePreview = debounce((val) => (iframe.srcdoc = val), 500);

  let editor;
  const reload = async (force) => {
    loading.classList.remove("hidden");
    status.textContent = "";
    try {
      const data = await loadSection("web", force);
      saved = data.content || "";
      if (!editor) {
        editor = await createEditor(editorHost, {
          doc: saved,
          language: "html",
          onChange: (val) => {
            setModified(val !== saved);
            updatePreview(val);
          },
        });
        main.append(grid);
      } else {
        editor.setValue(saved);
      }
      iframe.srcdoc = saved;
      setModified(false);
    } catch (err) {
      status.className = "status error";
      status.textContent = err.message || "erro";
    } finally {
      loading.classList.add("hidden");
    }
  };
  renderWeb.forceReload = () => reload(true);
  await reload(false);

  saveBtn.addEventListener("click", async () => {
    if (!editor) return;
    const spinner = $(".spinner", saveBtn);
    const content = editor.getValue();
    spinner.classList.remove("hidden");
    status.className = "status";
    status.textContent = "salvando…";
    try {
      await api("/web", { method: "POST", body: { content } });
      invalidate("web");
      saved = content;
      setModified(false);
    } catch (err) {
      status.className = "status error";
      status.textContent = err.message || "erro ao salvar";
    } finally {
      spinner.classList.add("hidden");
    }
  });
}

// ============================================================
// Seção: Pastes
// ============================================================

async function renderPastes() {
  main.innerHTML = "";
  const newBtn = h("button", { class: "btn", onclick: () => pasteForm(null) }, "+ novo");
  const { head } = sectionHead("Pastes", [refreshButton(() => listPastes(true)), newBtn]);
  main.append(head);
  const container = h("div", {});
  main.append(container);

  async function listPastes(force = false) {
    container.innerHTML = "";
    const loading = h("div", { class: "loading" }, "carregando…");
    container.append(loading);
    try {
      const data = await loadSection("pastes", force);
      loading.remove();
      const pastes = data.pastes || [];
      if (pastes.length === 0) {
        container.append(h("div", { class: "muted" }, "nenhum paste ainda."));
        return;
      }
      const list = h("div", { class: "list" });
      for (const p of pastes) list.append(pasteRow(p));
      container.append(list);
    } catch (err) {
      loading.remove();
      container.append(h("div", { class: "field-error" }, err.message || "erro ao listar."));
    }
  }

  function pasteRow(p) {
    const actions = h("div", { class: "row-actions" });
    const copyBtn = h("button", { class: "btn btn-sm btn-ghost", onclick: (e) => copy(PASTE_URL(p.title), e.target) }, "copiar url");
    const editBtn = h("button", { class: "btn btn-sm", onclick: () => pasteForm(p) }, "editar");
    const delBtn = h("button", { class: "btn btn-sm btn-danger", onclick: () => askDelete() }, "deletar");
    actions.append(copyBtn, editBtn, delBtn);

    const row = h(
      "div",
      { class: "row" },
      h(
        "div",
        { class: "row-main" },
        h("div", { class: "row-title" }, p.title, " ", h("span", { class: "tag" + (p.listed ? " listed" : "") }, p.listed ? "listed" : "unlisted")),
        h("div", { class: "row-sub" }, fmtDate(p.modified_on)),
      ),
      actions,
    );

    function askDelete() {
      actions.innerHTML = "";
      const yes = h("button", { class: "btn btn-sm btn-danger", onclick: doDelete }, "confirmar");
      const no = h("button", { class: "btn btn-sm btn-ghost", onclick: () => (restore()) }, "cancelar");
      actions.append(h("span", { class: "confirm" }, "deletar?"), yes, no);
    }
    function restore() {
      actions.innerHTML = "";
      actions.append(copyBtn, editBtn, delBtn);
    }
    async function doDelete() {
      try {
        await api(`/pastes/${encodeURIComponent(p.title)}`, { method: "DELETE" });
        invalidate("pastes");
        listPastes(true);
      } catch (err) {
        restore();
        alertRow(row, err.message);
      }
    }
    return row;
  }

  // Formulário de criação/edição.
  async function pasteForm(existing) {
    container.innerHTML = "";
    const isEdit = !!existing;
    const titleInput = h("input", { class: "input", placeholder: "título", spellcheck: "false" });
    titleInput.value = existing?.title || "";
    if (isEdit) titleInput.setAttribute("readonly", "");
    const listedToggle = h("input", { type: "checkbox" });
    if (existing?.listed) listedToggle.setAttribute("checked", "");
    const editorHost = h("div", { class: "editor-host" });
    const errEl = h("div", { class: "field-error" });
    const saveSpin = h("span", { class: "spinner hidden" });
    const saveBtn = h("button", { class: "btn btn-primary" }, h("span", {}, isEdit ? "salvar" : "criar"), saveSpin);
    const cancelBtn = h("button", { class: "btn btn-ghost", onclick: () => listPastes(false) }, "cancelar");

    const form = h(
      "div",
      { class: "form" },
      h("div", { class: "form-row" },
        h("div", { class: "grow" }, h("label", { class: "field-label" }, "título"), titleInput),
        h("label", { class: "toggle" }, listedToggle, "listed"),
      ),
      h("div", {}, h("label", { class: "field-label" }, "conteúdo"), editorHost),
      h("div", { class: "form-actions" }, saveBtn, cancelBtn, errEl),
    );
    container.append(form);

    const editor = await createEditor(editorHost, { doc: existing?.content || "" });
    titleInput.focus();

    saveBtn.addEventListener("click", async () => {
      errEl.textContent = "";
      const title = titleInput.value.trim();
      const content = editor.getValue();
      if (!title) {
        errEl.textContent = "título obrigatório.";
        return;
      }
      saveSpin.classList.remove("hidden");
      try {
        const listed = listedToggle.checked;
        if (isEdit) {
          await api(`/pastes/${encodeURIComponent(title)}`, { method: "PUT", body: { content, listed } });
        } else {
          await api("/pastes", { method: "POST", body: { title, content, listed } });
        }
        invalidate("pastes");
        listPastes(true);
      } catch (err) {
        errEl.textContent = err.message || "erro ao salvar.";
      } finally {
        saveSpin.classList.add("hidden");
      }
    });
  }

  listPastes(false);
}

// ============================================================
// Seção: PURLs
// ============================================================

async function renderPurls() {
  main.innerHTML = "";
  const newBtn = h("button", { class: "btn", onclick: () => purlForm() }, "+ novo");
  const { head } = sectionHead("PURLs", [refreshButton(() => listPurls(true)), newBtn]);
  main.append(head);
  const container = h("div", {});
  main.append(container);

  async function listPurls(force = false) {
    container.innerHTML = "";
    const loading = h("div", { class: "loading" }, "carregando…");
    container.append(loading);
    try {
      const data = await loadSection("purls", force);
      loading.remove();
      const purls = data.purls || [];
      if (purls.length === 0) {
        container.append(h("div", { class: "muted" }, "nenhum PURL ainda."));
        return;
      }
      const list = h("div", { class: "list" });
      for (const p of purls) list.append(purlRow(p));
      container.append(list);
    } catch (err) {
      loading.remove();
      container.append(h("div", { class: "field-error" }, err.message || "erro ao listar."));
    }
  }

  function purlRow(p) {
    const urlEl = h("div", { class: "row-sub", title: "clique para editar", style: "cursor:text" }, p.url);
    // Edição inline da URL de destino.
    urlEl.addEventListener("click", () => {
      const input = h("input", { class: "inline-edit" });
      input.value = p.url;
      urlEl.replaceWith(input);
      input.focus();
      input.select();
      const cancel = () => input.replaceWith(urlEl);
      const commit = async () => {
        const newUrl = input.value.trim();
        if (!newUrl || newUrl === p.url) return cancel();
        try {
          await api(`/purls/${encodeURIComponent(p.name)}`, { method: "PUT", body: { url: newUrl, listed: p.listed } });
          invalidate("purls");
          listPurls(true);
        } catch (err) {
          cancel();
          alertRow(row, err.message);
        }
      };
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") commit();
        else if (e.key === "Escape") cancel();
      });
      input.addEventListener("blur", cancel);
    });

    const actions = h("div", { class: "row-actions" });
    const copyBtn = h("button", { class: "btn btn-sm btn-ghost", onclick: (e) => copy(PURL_URL(p.name), e.target) }, "copiar url");
    const delBtn = h("button", { class: "btn btn-sm btn-danger", onclick: askDelete }, "deletar");
    actions.append(copyBtn, delBtn);

    const row = h(
      "div",
      { class: "row" },
      h(
        "div",
        { class: "row-main" },
        h("div", { class: "row-title" }, p.name, " ",
          h("span", { class: "tag" + (p.listed ? " listed" : "") }, p.listed ? "listed" : "unlisted"),
          p.counter ? h("span", { class: "muted", style: "margin-left:8px" }, `${p.counter} hits`) : null),
        urlEl,
      ),
      actions,
    );

    function askDelete() {
      actions.innerHTML = "";
      const yes = h("button", { class: "btn btn-sm btn-danger", onclick: doDelete }, "confirmar");
      const no = h("button", { class: "btn btn-sm btn-ghost", onclick: restore }, "cancelar");
      actions.append(h("span", { class: "confirm" }, "deletar?"), yes, no);
    }
    function restore() {
      actions.innerHTML = "";
      actions.append(copyBtn, delBtn);
    }
    async function doDelete() {
      try {
        await api(`/purls/${encodeURIComponent(p.name)}`, { method: "DELETE" });
        invalidate("purls");
        listPurls(true);
      } catch (err) {
        restore();
        alertRow(row, err.message);
      }
    }
    return row;
  }

  async function purlForm() {
    container.innerHTML = "";
    const nameInput = h("input", { class: "input", placeholder: "nome (ex.: gh)", spellcheck: "false" });
    const urlInput = h("input", { class: "input", placeholder: "https://destino…", spellcheck: "false" });
    const listedToggle = h("input", { type: "checkbox" });
    const errEl = h("div", { class: "field-error" });
    const saveSpin = h("span", { class: "spinner hidden" });
    const saveBtn = h("button", { class: "btn btn-primary" }, h("span", {}, "criar"), saveSpin);
    const cancelBtn = h("button", { class: "btn btn-ghost", onclick: () => listPurls(false) }, "cancelar");

    const form = h(
      "div",
      { class: "form" },
      h("div", { class: "form-row" },
        h("div", { style: "min-width:160px" }, h("label", { class: "field-label" }, "nome"), nameInput),
        h("div", { class: "grow" }, h("label", { class: "field-label" }, "url de destino"), urlInput),
        h("label", { class: "toggle" }, listedToggle, "listed"),
      ),
      h("div", { class: "form-actions" }, saveBtn, cancelBtn, errEl),
    );
    container.append(form);
    nameInput.focus();

    saveBtn.addEventListener("click", async () => {
      errEl.textContent = "";
      const name = nameInput.value.trim();
      const url = urlInput.value.trim();
      if (!name) return (errEl.textContent = "nome obrigatório.");
      if (!url) return (errEl.textContent = "url obrigatória.");
      saveSpin.classList.remove("hidden");
      try {
        await api("/purls", { method: "POST", body: { name, url, listed: listedToggle.checked } });
        invalidate("purls");
        listPurls(true);
      } catch (err) {
        errEl.textContent = err.message || "erro ao salvar.";
      } finally {
        saveSpin.classList.add("hidden");
      }
    });
  }

  listPurls(false);
}

// Mostra um erro efêmero numa linha.
function alertRow(row, msg) {
  const note = h("div", { class: "field-error" }, msg || "erro");
  row.append(note);
  setTimeout(() => note.remove(), 3000);
}

// ============================================================
// Bootstrap
// ============================================================

if (MOCK) {
  document.querySelector(".brand").append(h("span", { class: "mock-banner", style: "margin-left:8px" }, "MOCK"));
}

// Tenta carregar a seção inicial; se 401, a camada de API mostra o login.
// Só revela o app depois de confirmar a sessão (evita flash da UI).
(async () => {
  try {
    await loadSection("web");
    showApp();
    navigate("web");
  } catch (err) {
    if (err.status === 401) {
      // showLogin já foi chamado pela camada de API
    } else {
      showApp();
      navigate("web"); // erro não-auth: renderiza e deixa a seção mostrar o erro
    }
  }
})();
