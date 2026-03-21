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
- `src/components/layout/AppSidebar.tsx` — Collapsible sidebar, 6 nav sections (Main, Research, Blockchain, Community, Career, Account)
- `src/components/layout/TopBar.tsx` — Search, theme switcher, Create menu, notifications, avatar menu
- `src/pages/` — 40+ pages (Index/Feed, Discover, Messenger, Profile, Publications, Repositories, Projects, Analytics, Blockchain*, Collaboration, Community, Discussions, Events, Funding, Calendar, Wiki, LabNotebook, CitationManager, ConferenceManagement, ResearchCanvas, etc.)
- `src/components/` — Feature modules: ai, ai-chat, blockchain, chat, collaboration, contributions, discover, feed, funding, home, impact, messenger, milestones, notifications, peer-review, profile, provenance, repositories, search, shared, workspace
- `src/hooks/` — use-auth, use-theme, use-notifications, use-keyboard-shortcuts, use-blockchain, use-citations, use-discover, use-funding, use-conferences, use-protocols, use-publications, use-repositories, use-page-context, use-mobile, use-debounce, use-local-storage
- `src/context/UserDataContext.tsx` — Extended user profile, activity events, followed researchers, collections

**Strengths:**
- Solid, well-structured component hierarchy
- Collapsible sidebar with section grouping, animated transitions
- 4-theme system cleanly built
- Lazy loading + Suspense on all pages
- Keyboard shortcut system
- Command palette (Ctrl+K)
- BlockchainNotification system
- Comprehensive Shadcn/ui component library
- Skeleton loading states
- Mobile-responsive with Sheet drawer

**Weaknesses / areas for growth (pre-transformation):**
- All data is mock — no real API integration yet
- Auth is local mock only
- Many pages are partial scaffolds
- Sidebar has too many items creating cognitive overload
- Dashboard (Index) mixes too many concerns — feed + tools + stats + onboarding
- Blockchain section feels bolted-on vs. integrated
- No real-time data
- Command palette limited in scope

**Transformation target**: Think!Hub strategic redesign per the attached brief — to be applied incrementally after audit phase.

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
