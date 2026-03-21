# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── thinkhub/           # Think!Hub — React+Vite research network frontend
│   └── mockup-sandbox/     # Isolated UI component preview server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Artifacts

### `artifacts/thinkhub` (`@workspace/thinkhub`) — Think!Hub Research Platform

React + Vite frontend for the Think!Hub research networking platform. Imported faithfully from `https://github.com/Animus1991/sciconnect-hub.git`.

**Architecture summary:**
- **Framework**: React 19 + Vite 7 + TailwindCSS v4 + Shadcn/ui primitives
- **Routing**: React Router v6 (40+ pages, all lazy-loaded)
- **State**: React Context (AuthContext, UserDataContext, NotificationContext, ThemeContext, ShortcutsContext, BlockchainNotificationContext)
- **Animations**: Framer Motion for page transitions, sidebar animations, skeleton loaders
- **Theme system**: Custom CSS variables, 4 themes (light, dark, hi-tech, system), toggled via class on `<html>`
- **Auth**: Mock auth context with localStorage persistence — no real backend auth yet
- **Data**: All mock data from `src/data/mockData.ts` and `src/components/messenger/mockData.ts`

**Key structure:**
- `src/App.tsx` — Root with all providers and all lazy route declarations
- `src/components/layout/AppLayout.tsx` — Master shell: sidebar + topbar + main
- `src/components/layout/AppSidebar.tsx` — Collapsible sidebar, 6 sections, 38 nav items total. Sections: Main (non-collapsible: Feed/Discover/Messages/Notifications), Research (collapsible, open: 12 items), Blockchain (collapsible: 6 items), Community (collapsible: 6 items), Career (collapsible: 3 items), Account (non-collapsible: 7 items). Collapse toggle at bottom. Icon-only collapsed mode at 56px. Full width 240px.
- `src/components/layout/TopBar.tsx` — Search trigger (Ctrl+K), 4-theme switcher, Create dropdown (New Publication, New Project, Start Discussion), notifications badge, avatar menu
- `src/pages/Index.tsx` — Dashboard: workspace command surface (greeting + context, stats row, quick action chips, active research strip, recommendations, feed tabs, right rail)
- `src/pages/` — 40+ pages (Index/Feed, Discover, Messenger, Profile, Publications, Repositories, Projects, Analytics, Blockchain*, Collaboration, Community, Discussions, Events, Funding, Calendar, Wiki, LabNotebook, CitationManager, ConferenceManagement, ResearchCanvas, etc.)
- `src/components/` — Feature modules: ai, ai-chat, blockchain, chat, collaboration, contributions, discover, feed, funding, home, impact, messenger, milestones, notifications, peer-review, profile, provenance, repositories, search, shared, workspace
- `src/hooks/` — use-auth, use-theme, use-notifications, use-keyboard-shortcuts, use-blockchain, use-citations, use-discover, use-funding, use-conferences, use-protocols, use-publications, use-repositories, use-page-context, use-mobile, use-debounce, use-local-storage
- `src/context/UserDataContext.tsx` — Extended user profile, activity events, followed researchers, collections

**Completed transformation (Phase 1 — complete):**
- Sidebar: reduced from 30+ items / 6 sections → 16 items / 4 sections (Main, Research, Collaboration, Tools). Clean workspace-first grouping. Collapse toggle. User profile at bottom.
- Dashboard: replaced loose-widget feed with workspace command surface — contextual greeting, stats cards, quick action chips, active research progress strip, smart feed. Removed tool-panel accordions (confusing UX).
- TopBar: cleaned up, more minimal and premium — tighter dropdowns, cleaner theme switcher, better hierarchy.
- All 49 routes preserved, all providers intact, theme system intact.
- Zero `font-serif` across all 49 pages — batch-removed 46+ instances across 19 files.
- All stat numbers normalized to `text-xl font-semibold`.
- All emoji in badges/icons replaced with Lucide icons.
- Consistent page title standard: `text-[22px] font-semibold tracking-tight text-foreground`.

**Phase 2 — Research Office Suite (complete):**
- Installed Tiptap v3 + StarterKit + 14 extensions (underline, placeholder, character-count, link, highlight, task-list, task-item, table, subscript, superscript).
- `src/data/workspaceMockData.ts` — DocType/SheetType models, 6 doc templates, 4 sheet templates, seeded demo data.
- `src/hooks/useWorkspaceStorage.ts` — localStorage persistence for documents + sheets.
- `src/pages/Documents.tsx` — split-panel doc editor: searchable list + full Tiptap toolbar (bold/italic/underline/strike/sub/sup/H1-H3/lists/tasks/blockquote/code/highlight/table/link), auto-save 1.5s, word count, reading time, markdown + txt export, template picker, pin/duplicate/delete per doc.
- `src/pages/Sheets.tsx` — custom spreadsheet: 6 cell types (text/number/date/status/percent/url), sort, filter, add/delete rows and columns, rename columns, change column type, CSV export, template picker, Tab/Enter keyboard navigation.
- Routes `/documents` and `/sheets` added to App.tsx.
- "Workspace" collapsible sidebar section added with ScrollText + Sheet Lucide icons.
- Comprehensive Tiptap CSS added to index.css (prose, task lists, tables, placeholders, code blocks).
- StarterKit configured with `link: false, underline: false` to avoid duplicate extension warnings (StarterKit v3 includes both by default; we add them manually with custom config).

**Phase 3 — Research Canvas (complete):**
- `src/data/canvasData.ts` — Complete type system: 11 node types (note/insight/question/hypothesis/citation/evidence/task/document/image/pdf/section), 7 connection types (supports/contradicts/related/derived/compare/questions/custom) with SVG stroke colors, Board/Connection/NodeColorDef interfaces, localStorage persistence (`thinkhub_research_canvas_v2`), 8 research-grade board templates (Literature Review, Concept Map, Advisor Meeting Prep, Paper Comparison, Hypothesis Explorer, Reading Pipeline, Argument Map, Thesis Chapter Plan).
- `src/pages/ResearchCanvas.tsx` — Complete visual workspace: multiple boards with CRUD (create/rename/duplicate/delete), board list panel (left rail, collapsible), animated template picker dialog (8 templates), node properties panel (right rail, auto-shows on selection with tags, status, citation fields, connection list), SVG connections layer with cubic Bezier arrows + color-coded relationship types + arrowheads, connection-type picker dialog, section/zone label nodes, inline note editing (double-click), tags system with add/remove/filter, search+type filter toolbar, Markdown board export, autosave to localStorage (600ms debounce), fit-to-screen, 11 node type quick-add shortcuts on empty state. Nested `<button>` HTML violation fixed (board items use `div[role=button]`).

**Key storage keys:**
- Documents: `thinkhub_workspace_documents`
- Sheets: `thinkhub_workspace_sheets`
- Canvas boards: `thinkhub_research_canvas_v2`

**Remaining areas for future iterations:**
- Real backend API integration (currently all mock data)
- Real auth (currently mock localStorage auth)
- Command palette expansion (Ctrl+K)
- Feature pages polish (many are partial scaffolds)
- Mobile-specific layout improvements
- Canvas: minimap for large boards, multi-select/group drag, image thumbnails in uploaded file nodes

**Dev command**: `pnpm --filter @workspace/thinkhub run dev`
**Port**: 22545 (mapped to previewPath `/`)

---

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /healthz`
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models (empty — no models defined yet)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`)

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/`.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
