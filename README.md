# CodeCanvas 🎨

Editor de código PWA com design inspirado no Apple — roda direto no browser, sem instalação, funciona offline.

![Version](https://img.shields.io/badge/version-1.2.0-6366f1)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-ready-blue)

---

## ✨ Funcionalidades

- **16 linguagens** com syntax highlighting real (CodeMirror 5)
- **Tema claro / escuro** com detecção automática do sistema
- **Buscar e substituir** com navegação entre resultados (case-insensitive)
- **Pinch-to-zoom** no código — corrigido para iOS Safari
- **Autosave** via IndexedDB com debounce de 600 ms
- **Importar / exportar** arquivos do dispositivo
- **Salvar na nuvem** via Firebase Firestore (opcional)
- **PWA** — instalável no celular e desktop, com Service Worker para uso offline
- **Zero dependências de build** — HTML + CSS + JS puros

---

## 🚀 Como usar

### Direto no browser

Basta abrir o `index.html` em qualquer browser moderno. Todos os recursos do CodeMirror são carregados via CDN (cdnjs.cloudflare.com).

> **Nota:** o Service Worker exige que o arquivo seja servido via `http://` ou `https://`. Em `file://` ele é ignorado (sem erros), mas o restante do app funciona normalmente.

### Servir localmente

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Acesse `http://localhost:8080`.

### GitHub Pages

1. Faça o fork do repositório
2. Vá em **Settings → Pages**
3. Selecione a branch `main` e a pasta `/root`
4. O app estará disponível em `https://<seu-usuario>.github.io/codecanvas`

---

## ☁️ Firebase (opcional)

Para habilitar a sincronização na nuvem:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o **Firestore Database** no modo de teste
3. No app, clique em **Nuvem** na toolbar
4. Informe o **Project ID** e a **API Key** — elas ficam apenas na memória da sessão, nunca são gravadas em disco

> ⚠️ **Segurança:** nunca coloque credenciais reais no `config.js` se o repositório for público. Use o painel em tempo de execução ou variáveis de ambiente com uma etapa de build.

---

## 🗂️ Estrutura do projeto

```
codecanvas/
├── index.html              # Shell da aplicação e carregamento do CodeMirror
├── styles.css              # Design system completo (variáveis, tema, layout)
├── config.js               # Constantes globais (versão, modos, chaves de storage)
├── app.js                  # Orquestrador — inicializa todos os módulos
├── editor-manager.js       # Instância do CodeMirror, pinch-to-zoom, autosave
├── lang-manager.js         # Troca de linguagem e resolução de modos CM5
├── find-replace-manager.js # Painel de busca e substituição
├── file-manager.js         # Importar, exportar e renomear arquivos
├── theme-manager.js        # Tema claro/escuro
├── storage-manager.js      # IndexedDB com fallback para localStorage
├── modal-manager.js        # Modais de prompt e confirmação
├── toast-manager.js        # Notificações toast
├── firebase-adapter.js     # Integração com Firebase Firestore
└── pwa-manager.js          # Service Worker e Web App Manifest dinâmicos
```

---

## 🔧 Linguagens suportadas

| Extensão | Modo |
|----------|------|
| `.js`, `.mjs`, `.cjs`, `.jsx` | JavaScript |
| `.ts`, `.tsx` | TypeScript |
| `.html`, `.htm` | HTML |
| `.css`, `.scss`, `.less` | CSS |
| `.py` | Python |
| `.xml`, `.svg` | XML/SVG |
| `.md`, `.mdx` | Markdown |
| `.sql` | SQL |
| `.sh`, `.bash`, `.zsh` | Shell |
| `.c`, `.cpp`, `.h`, `.java`, `.cs` | C/C++/Java |
| `.php` | PHP |
| `.rb` | Ruby |
| `.rs` | Rust |
| `.go` | Go |
| `.yml`, `.yaml` | YAML |
| `.json` | JSON |

---

## 📋 Atalhos de teclado

| Atalho | Ação |
|--------|------|
| `Ctrl/Cmd + S` | Salvar arquivo |
| `Ctrl/Cmd + O` | Abrir arquivo |
| `Ctrl/Cmd + H` | Buscar e substituir |
| `Ctrl/Cmd + Z` | Desfazer |
| `Ctrl/Cmd + Y` / `Cmd+Shift+Z` | Refazer |
| `Tab` | Indentar seleção |
| `Shift + Tab` | Desdentar seleção |
| `Escape` | Fechar painel de busca |

---

## 📝 Changelog

### v1.2.0
- **Fix:** painel de Buscar/Substituir e Firebase não sobrepõem mais o código — agora empurram o editor para baixo
- **Fix:** TypeScript e JSON com syntax highlighting correto (sub-modos do CodeMirror 5)
- **Fix:** `replaceOne` agora funciona corretamente com buscas case-insensitive
- **Fix:** arquivos `.ts`/`.tsx` detectam TypeScript ao abrir; `.json` detecta JSON
- **Fix:** `MODE_LABELS` atualizado com TypeScript e JSON

### v1.1.0
- Autosave via IndexedDB com debounce
- Migração automática de localStorage → IndexedDB
- Pinch-to-zoom corrigido para iOS Safari
- Service Worker com cache versionado

### v1.0.0
- Lançamento inicial

---

## 📄 Licença

MIT © CodeCanvas Contributors
