# omg-lol-admin

Painel de administração pessoal para gerenciar o endereço **`tucas`** no
[omg.lol](https://omg.lol) — edita a homepage, os pastes e os PURLs via API REST.

- **Frontend**: HTML + CSS + JS vanilla, single-page app, **sem build step**.
- **Backend**: Cloudflare Pages Functions (`functions/api/*`) atuando como proxy autenticado.
- A API key do omg.lol vive **apenas no Worker** (secret `OMG_API_KEY`); o navegador nunca a vê.

```
Browser → Cloudflare Pages (público estático) → /api/* (Pages Function proxy) → api.omg.lol (Bearer)
```

## Estrutura

```
public/            SPA estática (servida diretamente pelo Pages)
  index.html       shell: sidebar + main + tela de login
  style.css        todo o CSS (terminal/industrial)
  app.js           router, fetch, cache, editor, mock mode
functions/
  _lib/auth.js     cookie de sessão assinado (HMAC-SHA256, Web Crypto)
  _lib/omg.js      cliente da API omg.lol + helpers JSON
  api/_middleware.js   exige sessão em todas as rotas /api/* (exceto login)
  api/web.js           GET/POST  /api/web
  api/pastes.js        GET/POST  /api/pastes
  api/pastes/[title].js PUT/DELETE /api/pastes/:title
  api/purls.js         GET/POST  /api/purls
  api/purls/[name].js  PUT/DELETE /api/purls/:name
  api/auth/login.js    POST /api/auth/login
  api/auth/logout.js   POST /api/auth/logout
test/auth.test.js  testes do cookie (node --test)
wrangler.toml      config Cloudflare Pages
```

## Variáveis de ambiente / secrets

| Nome | Tipo | Descrição |
|------|------|-----------|
| `OMG_API_KEY` | secret | API key do omg.lol |
| `ADMIN_PASSWORD` | secret | senha de acesso ao painel |
| `SESSION_SECRET` | secret | string aleatória para assinar o cookie |
| `OMG_ADDRESS` | var | endereço omg.lol (já definido como `tucas` no `wrangler.toml`) |

Defina os secrets no dashboard do Cloudflare Pages (Settings → Environment
variables → **Encrypt**) ou via CLI:

```sh
wrangler pages secret put OMG_API_KEY
wrangler pages secret put ADMIN_PASSWORD
wrangler pages secret put SESSION_SECRET
```

> Se o `OMG_ADDRESS` for diferente de `tucas`, atualize também a constante
> `ADDRESS` no topo de `public/app.js` (usada apenas para montar as URLs
> públicas de paste/PURL exibidas nos botões "copiar url").

## Deploy

Não há build step — o Pages serve `/public` e descobre as Functions em `/functions`.

1. Conecte o repositório no Cloudflare Pages (ou rode `wrangler pages deploy public`).
2. Build command: *(vazio)*. Output directory: `public`.
3. Configure os 3 secrets acima.
4. Acesse a URL, entre com `ADMIN_PASSWORD`.

## Desenvolvimento local

```sh
# crie .dev.vars (no .gitignore) com OMG_API_KEY / ADMIN_PASSWORD / SESSION_SECRET / OMG_ADDRESS
npm run dev          # wrangler pages dev public
```

### Mock mode (sem backend)

Para exercitar a UI sem Cloudflare nem omg.lol, abra a app com `?mock=1`
(ou rode `localStorage.setItem('omgadmin_mock','1')`). A camada de fetch passa a
servir fixtures em memória para web/pastes/purls e um login falso — útil para
testar layout e interações. Um selo **MOCK** aparece no cabeçalho. O mock é
ignorado em produção (sem o parâmetro/flag).

## Testes

```sh
npm test             # node --test → testes do cookie HMAC (assinatura/verificação)
```

## Notas

- CodeMirror 6 é carregado via CDN ESM (esm.sh). Se o CDN estiver indisponível,
  o editor degrada graciosamente para um `<textarea>`.
- O preview da homepage usa `iframe[srcdoc]` (sem CORS), com debounce de 500ms.
- Cache em memória por seção: fetch na primeira visita, servido do cache depois,
  botão ↺ força refetch, e qualquer mutação invalida e recarrega aquela seção.
  Sem polling.
