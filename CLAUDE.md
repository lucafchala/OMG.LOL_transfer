# omg-lol-admin

Painel de administração pessoal para gerenciar o endereço `tucas` no omg.lol via API REST. Hospedado em Cloudflare Pages (frontend estático) + Cloudflare Worker (proxy autenticado para a API do omg.lol).

---

## Stack

- **Frontend**: HTML + CSS + JS vanilla (sem framework), single-page app
- **Backend**: Cloudflare Worker (proxy + autenticação)
- **Hosting**: Cloudflare Pages (frontend) + Worker no mesmo projeto via Pages Functions
- **Auth**: senha única verificada no Worker via variável de ambiente (`ADMIN_PASSWORD`), sessão mantida com cookie HttpOnly assinado
- **API key omg.lol**: armazenada exclusivamente no Worker como secret (`OMG_API_KEY`), nunca exposta ao frontend

---

## Arquitetura

```
Browser → Cloudflare Pages (HTML/CSS/JS estático)
        → Pages Function /api/* (Worker proxy)
              → api.omg.lol (com Bearer token)
```

O frontend nunca toca a API key. Todas as chamadas à omg.lol passam pelo proxy `/api/*`.

---

## Funcionalidades

### 1. Homepage Editor
- Carrega o HTML atual via `GET /api/web`
- Editor com syntax highlighting (CodeMirror 6, tema escuro)
- Preview ao vivo num iframe à direita (atualiza com debounce de 500ms)
- Botão "Salvar" faz `POST /api/web` com o conteúdo editado
- Indicador de estado: salvo / modificado / salvando / erro

### 2. Pastes Manager
- Lista todos os pastes via `GET /api/pastes` (título, data, listed/unlisted)
- Criar novo paste: título + editor CodeMirror + toggle listed/unlisted
- Editar paste existente: abre no mesmo editor
- Deletar paste com confirmação inline (sem modal)
- Copiar URL do paste para clipboard com um clique

### 3. PURLs Manager
- Lista todos os PURLs via `GET /api/purls` (nome, URL de destino, listed/unlisted)
- Criar novo PURL: nome + URL destino + toggle listed/unlisted
- Editar PURL existente inline (edição direta na tabela)
- Deletar PURL com confirmação inline
- Copiar URL do PURL para clipboard

---

## Design

**Estética**: terminal/industrial — fundo quase preto (`#0d0d0d`), tipografia monospace para conteúdo técnico (pastes, código, URLs), tipografia sans-serif condensada para UI. Paleta restrita: fundo escuro, texto off-white, acento verde-limão (`#b8ff3e`) para estados ativos e ações primárias. Sem bordas arredondadas, sem sombras suaves — linhas retas, 1px borders em cinza escuro.

Não é um produto SaaS genérico. É uma ferramenta pessoal — pode ter personalidade crua e funcional. Pensa num editor de texto de terminal com uma UI por cima.

**Layout**: sidebar esquerda estreita com navegação entre as três seções (ícone + label). Área principal ocupa o resto. Sem topbar. Sem breadcrumbs.

**Fontes**: `JetBrains Mono` para conteúdo técnico (editor, URLs, títulos de pastes). `Barlow Condensed` para labels de UI, navegação, botões.

**Micro-interações**: botão de salvar com estado de loading (spinner inline, sem desabilitar o botão), feedback de erro inline abaixo do campo relevante (não toast), indicador de "modificado" no título da seção.

---

## Estrutura de arquivos

```
/
├── CLAUDE.md               ← este arquivo
├── public/
│   ├── index.html          ← shell HTML, carrega app.js
│   ├── style.css           ← todo o CSS
│   └── app.js              ← lógica SPA (routing entre seções, fetch para /api/*)
├── functions/
│   └── api/
│       ├── _middleware.js  ← autenticação via cookie
│       ├── web.js          ← proxy GET/POST /address/tucas/web
│       ├── pastes.js       ← proxy GET/POST/DELETE /address/tucas/pastebin
│       └── purls.js        ← proxy GET/POST/DELETE /address/tucas/purl
└── wrangler.toml           ← config Cloudflare Pages
```

---

## Endpoints do proxy (Pages Functions)

Todos requerem cookie de sessão válido. Retornam JSON.

| Método | Path | Ação |
|--------|------|------|
| GET | /api/web | Retorna HTML atual da homepage |
| POST | /api/web | Salva novo HTML da homepage |
| GET | /api/pastes | Lista todos os pastes |
| POST | /api/pastes | Cria novo paste |
| PUT | /api/pastes/:title | Atualiza paste existente |
| DELETE | /api/pastes/:title | Deleta paste |
| GET | /api/purls | Lista todos os PURLs |
| POST | /api/purls | Cria novo PURL |
| PUT | /api/purls/:name | Atualiza PURL existente |
| DELETE | /api/purls/:name | Deleta PURL |
| POST | /api/auth/login | Valida senha, seta cookie |
| POST | /api/auth/logout | Limpa cookie |

---

## Variáveis de ambiente (Cloudflare secrets)

```
OMG_API_KEY=<api key do omg.lol>
ADMIN_PASSWORD=<senha de acesso ao painel>
SESSION_SECRET=<string aleatória para assinar o cookie>
OMG_ADDRESS=tucas
```

---

## Estratégia de cache e fetch

O frontend mantém um cache em memória (objeto JS simples, vive enquanto a aba estiver aberta) para cada seção: homepage, pastes e PURLs.

**Comportamento:**
- Ao navegar para uma seção pela primeira vez na sessão, faz fetch e popula o cache
- Nas visitas subsequentes à mesma seção, serve do cache — sem nova chamada à API
- Um botão de refresh explícito (ícone ↺) em cada seção força novo fetch e atualiza o cache
- Ao salvar/criar/editar/deletar qualquer item, invalida o cache daquela seção e refaz o fetch imediatamente — garantindo consistência sem manter estado local duplicado

**Nunca fazer:**
- Polling automático (sem `setInterval` fazendo fetch em background)
- Fetch duplo na mesma navegação
- Fetch de todas as seções no carregamento inicial — lazy, só quando o usuário abrir aquela seção

Isso mantém o número de chamadas à API do omg.lol mínimo e proporcional ao uso real.

---

## Observações de implementação

- O CodeMirror 6 deve ser carregado via CDN (jspm.dev ou esm.sh) para não precisar de build step
- O preview da homepage deve usar `srcdoc` no iframe, não `src`, para evitar problemas de CORS
- A autenticação do cookie deve usar HMAC-SHA256 com `SESSION_SECRET` — sem biblioteca externa, usando a Web Crypto API nativa do Workers
- Edição inline de PURLs: ao clicar na célula, vira um `<input>` com confirm/cancel via teclas Enter/Escape
- O projeto não deve ter build step — Pages serve os arquivos estáticos diretamente de `/public`
- Compatível com mobile (você vai usar no S26 Ultra e em tablets)
