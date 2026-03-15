# think!hub — Master Implementation Plan

## Comprehensive Platform Evolution Blueprint

**Version:** 1.0  
**Date:** 2026-03-15  
**Scope:** Full-stack platform evolution from scientific social network to version-controlled knowledge infrastructure  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Master Product Thesis](#2-master-product-thesis)
3. [Whole-Platform Design and Architectural Principles](#3-whole-platform-design-and-architectural-principles)
4. [Whole-Platform UI/UX Modernization Plan](#4-whole-platform-uiux-modernization-plan)
5. [Page-by-Page and Component-by-Component Implementation Plan](#5-page-by-page-and-component-by-component-implementation-plan)
6. [Chunk / Notebook / Frontend Modernization Plan](#6-chunk--notebook--frontend-modernization-plan)
7. [Segmentation Engine Audit and Redesign Plan](#7-segmentation-engine-audit-and-redesign-plan)
8. [Full-Document Readability / Paragraph Reconstruction Plan](#8-full-document-readability--paragraph-reconstruction-plan)
9. [Buttons / Menus / Panels / Modals / Sidebars Audit and Redesign Plan](#9-buttons--menus--panels--modals--sidebars-audit-and-redesign-plan)
10. [File Import / Export / Interoperability Plan](#10-file-import--export--interoperability-plan)
11. [Research-Lab Stability and Build Architecture Plan](#11-research-lab-stability-and-build-architecture-plan)
12. [GitHub-for-Science / GitHub-for-Writing Product Evolution Plan](#12-github-for-science--github-for-writing-product-evolution-plan)
13. [Version-Controlled Knowledge Architecture Plan](#13-version-controlled-knowledge-architecture-plan)
14. [Competitive Landscape and Differentiation Analysis](#14-competitive-landscape-and-differentiation-analysis)
15. [Transparency Stages / Private-Lab-Public / Adoption Psychology Plan](#15-transparency-stages--private-lab-public--adoption-psychology-plan)
16. [Blockchain / Timestamp / Attestation Architecture Plan](#16-blockchain--timestamp--attestation-architecture-plan)
17. [Realistic University-Adoption MVP Plan](#17-realistic-university-adoption-mvp-plan)
18. [Contribution Tracking / Authorship Plan](#18-contribution-tracking--authorship-plan)
19. [Review / Approval / Frozen Snapshot / Milestone Plan](#19-review--approval--frozen-snapshot--milestone-plan)
20. [Knowledge Graph / Search / Discovery Long-Term Plan](#20-knowledge-graph--search--discovery-long-term-plan)
21. [AI Assistance Layer Plan](#21-ai-assistance-layer-plan)
22. [Minimal / Reduced-Chaos Modes Plan](#22-minimal--reduced-chaos-modes-plan)
23. [Risk Management / Testing / Migration / Anti-Regression Plan](#23-risk-management--testing--migration--anti-regression-plan)
24. [Phased Implementation Roadmap](#24-phased-implementation-roadmap)
25. [Highest-Priority Changes to Apply First](#25-highest-priority-changes-to-apply-first)

---

## 1. Executive Summary

think!hub is currently a feature-rich scientific social network with ~30 pages, blockchain integration (Hedera Hashgraph), AI chat capabilities, real-time notifications, and a comprehensive design system with 4 themes (light, hi-tech, dark, system). The platform has strong foundations: semantic CSS tokens, shadcn/ui component library, framer-motion animations, lazy-loaded routes, and modular page architecture.

**The strategic evolution** is to transform think!hub from a scientific social network into a **version-controlled knowledge infrastructure** — a "GitHub for science/writing" — while preserving and enhancing its existing social, blockchain, and collaboration features.

### Current State Assessment

**Strengths:**
- Mature design token system (HSL-based, 4 themes, semantic status colors)
- Comprehensive sidebar navigation with collapsible sections
- Blockchain layer (SHA-256 hashing, Hedera HCS, SBTs, audit trails)
- Real-time notification system with blockchain event support
- 30+ pages with consistent AppLayout wrapper
- Mock data architecture ready for backend integration
- AI multi-provider chat system (ThinkHub AI)
- PDF export, contribution graphs, force-directed provenance graphs

**Weaknesses to Address:**
- No document editor / structured writing infrastructure yet
- No version control / diff / branching / merge system
- No chunk/notebook/segmentation engine (referenced but not implemented)
- No /frontend or /research-lab pages (referenced in plan but not in routes)
- All data is mock — no persistent backend connected
- Some pages are feature-heavy with potential control overload
- No file upload/parsing pipeline
- No review/approval workflow beyond mock states
- No graded transparency system (private/lab/public)
- No contribution role mapping (CRediT taxonomy)

### Strategic Direction

The platform must evolve in **5 phases** over 12-18 months:

1. **Foundation Hardening** (Months 1-2): Design system cleanup, dead control audit, architectural stabilization
2. **Knowledge Infrastructure Core** (Months 3-5): Document editor, version control primitives, contribution tracking
3. **Scholarly Workflow Engine** (Months 6-8): Review/approval, milestones, graded transparency, CRediT mapping
4. **Intelligence Layer** (Months 9-11): Segmentation engine, readability system, AI assistance, knowledge graph foundations
5. **Platform Maturity** (Months 12-18): University MVP, public discovery, interoperability, federated trust layer

---

## 2. Master Product Thesis

### Core Thesis

> think!hub is the platform where scholarly knowledge is created, versioned, attributed, verified, and shared — with the rigor of Git, the accessibility of a modern editor, and the trust of cryptographic attestation.

### Product Identity Layers

**Layer 1 — Writing & Reading Infrastructure**
A sophisticated document environment where researchers write, structure, segment, and read scholarly content with intelligent formatting, chunk-level navigation, and semantic paragraph reconstruction.

**Layer 2 — Version-Controlled Knowledge**
Every scholarly artifact (paper, thesis, protocol, dataset, claim) exists as a versioned object with commit history, branching, diffing, and merge capabilities — expressed in both developer-native and scholar-friendly vocabulary.

**Layer 3 — Attribution & Contribution Clarity**
Every change is attributed. Every contributor's role is mapped. Every milestone is attestable. Disputes are reducible to verifiable records.

**Layer 4 — Trust & Attestation**
Selective use of cryptographic timestamping (Hedera HCS) and SHA-256 hashing to provide proof-of-existence, milestone attestation, and frozen-snapshot verification — without requiring users to understand blockchain.

**Layer 5 — Social & Discovery**
The existing social network layer (feed, discussions, groups, community, messaging) serves as the discovery and collaboration substrate on top of the knowledge infrastructure.

### Target User Segments (Priority Order)

1. **PhD students + supervisors** — thesis workflow, milestone tracking, contribution clarity
2. **Multi-author research teams** — collaborative writing, attribution, review/approval
3. **Lab groups** — protocols, lab notebooks, shared knowledge repositories
4. **Individual researchers** — publication management, reading, impact tracking
5. **Departments/institutions** — standardized workflows, audit trails, compliance

### Non-Targets (Phase 1)

- Journal publishers (too complex, different incentives)
- Undergraduate students (insufficient pain point)
- Industry R&D (different compliance requirements)
- General public readers (premature)

---

## 3. Whole-Platform Design and Architectural Principles

### 3.1 Design System Current State

The current design system is well-structured:

```
Themes: :root (light), .hitech, .dark, .system-dark
Tokens: --background, --foreground, --primary, --secondary, --muted, --accent, --destructive
Status: --gold, --emerald, --info, --warning, --success, --highlight, --scholarly
Sidebar: --sidebar-background, --sidebar-foreground, --sidebar-primary, etc.
Typography: --font-display (Inter/Space Grotesk), --font-serif, --font-mono
Spacing: --space-xs through --space-2xl
Radii: --radius-sm through --radius-full
```

**Assessment:** The token system is comprehensive. The four theme variants provide genuine visual distinction. The HSL format is correct and consistent.

### 3.2 Design Principles to Enforce

1. **Data-Forward Density**: Information density optimized for researchers who process large volumes. No unnecessary whitespace bloat.
2. **Inline Expansion Over Modals**: Detail views expand within context rather than spawning modals (already partially implemented).
3. **Two-Column Layout Standard**: Main content + contextual sidebar is the default page pattern.
4. **Semantic Color Only**: Components MUST use design tokens. No hardcoded colors. `text-foreground`, `bg-card`, `text-muted-foreground` — never `text-gray-500`.
5. **Progressive Disclosure**: Complex features hidden behind contextual triggers, not always-visible toolbars.
6. **State Completeness**: Every interactive element must handle: default, hover, active, disabled, loading, empty, error states.
7. **Consistent Iconography**: Lucide React exclusively. No emoji in functional UI (acceptable in decorative/social contexts only).

### 3.3 Architectural Principles

1. **Shared Abstractions First**: Before building page-specific logic, extract reusable patterns into `src/components/shared/`, `src/hooks/`, `src/lib/`.
2. **Mock-to-Real Bridge**: All mock data must follow the same interface as future API responses. `src/data/` files define the contract.
3. **Lazy Loading Preserved**: All pages remain lazy-loaded. New pages follow the same pattern.
4. **Feature Flags**: New major features gated behind `localStorage` flags during development.
5. **No Direct Backend Code**: Frontend communicates via `src/lib/api.ts` abstraction layer. Backend logic lives in `server/` or future Lovable Cloud functions.
6. **Component Composition**: Prefer composition over prop drilling. Use context sparingly (only for truly global state).

### 3.4 New Design Tokens to Add

```css
/* Document-specific tokens */
--doc-bg: <theme-specific>;           /* Document reading surface */
--doc-fg: <theme-specific>;           /* Document text color */
--doc-heading: <theme-specific>;      /* Heading emphasis */
--doc-link: <theme-specific>;         /* In-document links */
--doc-code-bg: <theme-specific>;      /* Code block background */
--doc-quote-border: <theme-specific>; /* Blockquote accent */
--doc-annotation: <theme-specific>;   /* Annotation/comment highlight */

/* Version control tokens */
--diff-add: <theme-specific>;         /* Added content */
--diff-remove: <theme-specific>;      /* Removed content */
--diff-modify: <theme-specific>;      /* Modified content */
--diff-context: <theme-specific>;     /* Unchanged context */

/* Transparency stage tokens */
--stage-private: <theme-specific>;    /* Private indicator */
--stage-lab: <theme-specific>;        /* Lab/team indicator */
--stage-public: <theme-specific>;     /* Public indicator */
```

### 3.5 Typography Hierarchy Refinement

Current: Inter + Space Grotesk + JetBrains Mono. This is functional but Inter is generic.

**Recommendation:** Keep for now. The combination works well for a data-dense scholarly interface. Switching fonts mid-development risks regression. Revisit in Phase 5 when the platform identity is more established.

**Hierarchy to enforce consistently:**
- `text-2xl font-display font-bold` — Page titles (H1)
- `text-lg font-display font-semibold` — Section headings (H2)
- `text-base font-medium` — Card titles, list headers (H3)
- `text-sm` — Body text, descriptions
- `text-xs text-muted-foreground` — Metadata, timestamps, secondary info
- `font-mono text-xs` — Hashes, code, technical identifiers

---

## 4. Whole-Platform UI/UX Modernization Plan

### 4.1 Sidebar Navigation

**Current state:** 5 collapsible sections (Main, Research, Blockchain, Community, Account) with ~28 items total. Uses Lucide icons, animated gradient accent on active item, fixed positioning.

**Issues identified:**
- `FlaskConical` icon used for both "Projects" and "Dashboard" (Blockchain section) — creates ambiguity
- `Calendar` icon used for both "Events" and "Conferences"
- Blockchain section has 6 items — potentially intimidating for non-blockchain users
- No visual grouping between related items beyond section headers

**Implementation plan:**

1. **Deduplicate icons:**
   - Blockchain Dashboard → `Blocks` or `ShieldCheck` icon
   - Conferences → `Presentation` icon (differentiate from Events)
   
2. **Conditional section visibility:**
   - Blockchain section: Collapsed by default (already done). Add a Settings toggle to hide entirely for users who don't use blockchain features.
   
3. **Badge system consistency:**
   - Currently only Messages (7) and Notifications (3) show badges
   - Add: Reading List (unread count), Peer Review (pending reviews count), Discussions (new replies count)
   - All badges should use the same `Badge` component with `variant="default"` for counts

4. **Sidebar footer refinement:**
   - Current: Profile link + Sign Out
   - Add: Quick theme toggle (sun/moon icon), collapse toggle (already exists)

### 4.2 TopBar

**Current state:** Contains menu toggle (mobile), likely search, and user actions.

**Implementation plan:**
1. Ensure TopBar contains: Global search trigger (Ctrl+K), notification bell with unread count, user avatar dropdown
2. On mobile: hamburger menu + search icon + notification bell
3. Remove any duplicate controls that exist in both TopBar and sidebar
4. Add breadcrumb on desktop for pages with depth (e.g., Discussions → Thread View)

### 4.3 Card System

**Current state:** shadcn Card component with `rounded-lg border bg-card text-card-foreground shadow-sm`.

**Plan:**
1. Create card variants for different contexts:
   - `DocumentCard` — for publications, papers, protocols (larger, more metadata-dense)
   - `ActivityCard` — for feed items, notifications (compact, timeline-oriented)
   - `StatCard` — for KPIs, metrics (already exists as `StatsCard`)
   - `ActionCard` — for quick actions, onboarding steps
2. All cards must respect theme tokens and never use hardcoded shadows or colors
3. Hover states: subtle `ring-1 ring-ring/20` on interactive cards
4. Loading states: Skeleton variants matching each card type (partially exists in `Skeletons.tsx`)

### 4.4 Empty States

**Current state:** `EmptyState` component exists in `src/components/shared/`.

**Plan:**
1. Audit every page for missing empty states
2. Every list/grid that can be empty must use `EmptyState` with:
   - Relevant icon
   - Clear message explaining what would appear
   - Primary action button (e.g., "Add your first publication")
3. Empty states must be themed (no hardcoded colors)

### 4.5 Loading States

**Plan:**
1. `FeedPageSkeleton` exists — create equivalent skeletons for:
   - `DocumentSkeleton` — for publication/protocol detail views
   - `ProfileSkeleton` — for profile page
   - `TableSkeleton` — for list/table views
   - `GraphSkeleton` — for chart/graph views
2. All Suspense boundaries should use page-appropriate skeletons, not generic `PageLoadingFallback`

### 4.6 Responsive Behavior

**Current state:** `useIsMobile()` hook, Sheet-based mobile sidebar, responsive padding in AppLayout.

**Plan:**
1. Breakpoint audit: Ensure all pages work at 360px, 768px, 1024px, 1440px
2. Two-column layouts → single column on mobile with collapsible sidebar section
3. Tables → card-based lists on mobile
4. Charts → horizontal scroll or simplified mobile variants
5. Modals → full-screen sheets on mobile (some already implemented)

### 4.7 Microinteractions

**Current state:** framer-motion used for page transitions, AnimatePresence for lists.

**Plan:**
1. Standardize animation variants in a shared `src/lib/animations.ts`:
   ```ts
   export const fadeInUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
   export const slideIn = { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } };
   export const staggerChildren = { animate: { transition: { staggerChildren: 0.05 } } };
   ```
2. Apply consistently: list items stagger, cards fade-in-up, panels slide-in
3. Reduce animation duration on `prefers-reduced-motion` media query

---

## 5. Page-by-Page and Component-by-Component Implementation Plan

### 5.1 Index (Feed) Page — `/`

**Current state:** 509 lines. Complex page with feed tabs, onboarding widget, peer activity, tool panels (Workspace, AI Assistant, Advanced Search), suggested researchers, dynamic welcome messages.

**Strengths:** Rich, engaging, data-forward. Good use of tabs, tool panels, social proof.

**Issues:**
- 509 lines in a single file — should be decomposed
- `TOOL_PANELS` pattern mixes heavy components (AdvancedWorkspace, AIResearchAssistant) into the feed page
- Onboarding widget uses localStorage directly — should use a shared onboarding state hook
- `PEER_ACTIVITIES` hardcoded — should come from mock data module

**Implementation plan:**
1. Extract `FeedTabContent`, `PeerActivitySidebar`, `ToolPanelSection` into separate components
2. Move all constants to `src/data/feedMockData.ts`
3. Create `useOnboarding` hook to manage onboarding state
4. Keep the page under 200 lines as an orchestrator
5. Add infinite scroll or virtualized list for feed items (react-window already installed)

### 5.2 Profile Page — `/profile`

**Current state:** 547 lines. Comprehensive profile with activity timeline, skills radar, social links, SBT gallery, contribution graph, edit modal.

**Strengths:** Rich profile with blockchain verification badges, proficiency grid, contribution graph.

**Issues:**
- 547 lines — decompose
- Edit modal defined inline — extract to separate file
- Skills data hardcoded — should be in mock data
- No ORCID integration display despite ORCID being in repositories

**Implementation plan:**
1. Extract: `ProfileHeader`, `ProfileActivity`, `ProfileSkills`, `ProfileSocial`, `EditProfileModal`
2. Add ORCID badge prominently (verified status indicator)
3. Add "Contribution Summary" section showing CRediT-style role breakdown
4. Add "Version History" section (future: linked to knowledge repositories)
5. Target: page file under 150 lines

### 5.3 Publications Page — `/publications`

**Current state:** 640 lines. Full publication manager with status filters, type configs, blockchain verification, import/export, bulk actions.

**Strengths:** Sophisticated filtering, status-driven UI, blockchain anchoring per publication.

**Issues:**
- 640 lines — decompose
- `statusConfig` and `typeConfig` should be shared constants
- Blockchain verification badge on each publication may be visually noisy
- Import/Export uses `ImportExportManager` component — good reuse

**Implementation plan:**
1. Extract: `PublicationCard`, `PublicationFilters`, `PublicationStats`, `AddPublicationModal`
2. Blockchain badge: Show only on expanded view, not in list thumbnails
3. Add "Version" column — link to version history when version control is implemented
4. Add "Visibility" indicator (private/lab/public) per publication
5. Target: page file under 200 lines

### 5.4 Lab Notebook Page — `/lab-notebook`

**Current state:** 721 lines. Protocol management with categories, versioning, steps, materials, blockchain anchoring.

**Strengths:** Well-structured protocol model with steps, materials, history, comments. PDF export. Version tracking.

**Issues:**
- 721 lines — the largest page, must decompose
- Protocol model is essentially a "knowledge object" — perfect foundation for version-controlled knowledge
- Steps model (ordered, titled, with caution flags) is a good chunk-like structure

**Implementation plan:**
1. Extract: `ProtocolCard`, `ProtocolDetail`, `ProtocolEditor`, `ProtocolFilters`, `StepEditor`, `MaterialsList`
2. This page is the closest existing analog to "version-controlled document" — evolve it first
3. Add diff view between protocol versions
4. Add contributor attribution per step change
5. Target: page file under 200 lines, 6+ extracted components

### 5.5 Contribution Tracking Page — `/contributions`

**Current state:** 497 lines. Blockchain-verified contribution records with type filtering, hash display, expandable details, contribution graph.

**Strengths:** Clean blockchain integration, good use of status indicators, contribution type taxonomy.

**Issues:**
- The contribution types in `blockchainMockData.ts` may not align with CRediT taxonomy
- "How It Works" dialog should be a first-visit tooltip, not a button
- Hash display is prominent — good for power users, potentially intimidating for newcomers

**Implementation plan:**
1. Map contribution types to CRediT taxonomy roles
2. Add "Simple View" toggle that hides hashes and blockchain details
3. Add contribution summary generator (auto-generate author contribution statements)
4. Connect to document version history when available

### 5.6 Idea Provenance Page — `/provenance`

**Current state:** 656 lines. Force-directed graph, timeline view, chain view. Node types: idea, hypothesis, experiment, paper, dataset, review, replication. Edge types: inspired, extended, replicated, cited, challenged, refined.

**Strengths:** Sophisticated provenance model, interactive graph, multi-view (graph/timeline/chains).

**Issues:**
- Graph rendering may be heavy on mobile
- 656 lines — decompose
- Edge metadata defined inline — should be shared

**Implementation plan:**
1. Extract: `ProvenanceGraph`, `ProvenanceTimeline`, `ProvenanceChains`, `NodeDetailPanel`
2. Mobile: Show timeline view by default, graph optional
3. Connect provenance nodes to version-controlled knowledge objects
4. Add "My Contribution Path" view — filter to show only the current user's nodes

### 5.7 Blockchain Dashboard — `/blockchain`

**Current state:** Separate page for blockchain overview.

**Plan:**
1. This should be the central trust verification page
2. Show: Total anchored documents, verification stats, recent transactions, SBT overview
3. Link to individual document verification from here
4. Add "Verify a Hash" tool — paste a hash, check if it's on-chain

### 5.8 Messenger Page — `/messages`

**Current state:** Full messenger with conversation sidebar, message bubbles, rich content, thread panel, AI copilot panel, call overlay.

**Plan:**
1. This is mature — minimal changes needed
2. Ensure theme consistency (check message bubble colors in all 4 themes)
3. Add: "Share Document" action in chat (link to a versioned knowledge object)
4. Add: "Request Review" action in chat (initiate review workflow from conversation)

### 5.9 Settings Page — `/settings`

**Current state:** 611 lines. Theme selector, language, timezone, notification preferences, keyboard shortcuts, blockchain configuration panel.

**Plan:**
1. Add: "Display Preferences" section with toggles for:
   - Blockchain details visibility (show/hide hashes globally)
   - Dense/comfortable density mode
   - Reduced animations mode
2. Add: "Export My Data" for GDPR-like data portability
3. Blockchain settings panel already exists — ensure it's grouped under "Advanced" tab

### 5.10 Remaining Pages (Brief Assessment)

| Page | Lines | Status | Priority |
|------|-------|--------|----------|
| Discover | ~500+ | Rich, needs decomposition | Medium |
| Groups | ~400+ | Functional | Low |
| Discussions | ~500+ | Has multi-sig consensus, rich | Medium |
| ThreadView | ~400+ | Nested replies, good | Low |
| Impact | ~400+ | Citation graph, AI recommendations | Medium |
| Notifications | ~300+ | Recently upgraded with blockchain | Low |
| PeerReview | ~500+ | Blind-then-reveal protocol | High |
| Projects | ~400+ | Functional | Medium |
| Funding | ~500+ | Gantt chart, smart contract milestones | Medium |
| CitationManager | ~400+ | Citation management | Medium |
| ConferenceManagement | ~400+ | POAPs, attendance | Low |
| Community | ~400+ | Social features | Low |
| Events | ~300+ | Calendar-based | Low |
| Courses | ~300+ | Education features | Low |
| Wiki | ~400+ | Knowledge base | Medium |
| Analytics | ~400+ | Insights, charts | Low |
| Collaboration | ~500+ | SharedWorkspace, voice/video UI | Medium |
| ReadingList | ~300+ | Bookmarking | Low |
| Milestones | ~400+ | Academic milestones | High |
| References | ~300+ | Reference management | Low |
| Issues | ~300+ | Issue tracking | Medium |
| ReputationScore | ~400+ | Reputation system | Low |
| BlockchainAnalytics | ~400+ | Blockchain metrics | Low |
| RepositoryDashboard | ~400+ | Repository overview | Medium |
| UnifiedSearch | ~400+ | Cross-platform search | Medium |

---

## 6. Chunk / Notebook / Frontend Modernization Plan

### 6.1 Current State Assessment

**Critical finding:** The codebase does not currently contain `/frontend` or `/research-lab` routes. These pages are referenced in the plan as future features. There are no chunk or notebook components in the current codebase.

This section therefore defines the **greenfield architecture** for these systems.

### 6.2 Chunk Architecture

A **chunk** is a semantically meaningful unit of text extracted from a document. Chunks are the atomic units of the knowledge system.

#### Chunk Data Model

```typescript
interface Chunk {
  id: string;
  documentId: string;
  order: number;
  content: string;
  type: ChunkType;
  metadata: ChunkMetadata;
  segmentationMode: SegmentationMode;
  parentChunkId?: string;        // For hierarchical chunks
  annotations: Annotation[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

type ChunkType = 
  | "heading" | "paragraph" | "list" | "code" | "equation"
  | "quote" | "dialogue" | "qa" | "claim" | "evidence"
  | "method" | "result" | "conclusion" | "reference"
  | "figure-caption" | "table" | "abstract" | "custom";

interface ChunkMetadata {
  wordCount: number;
  sentenceCount: number;
  readingTimeSeconds: number;
  language?: string;
  confidence: number;           // Segmentation confidence 0-1
  semanticTags: string[];
  structuralDepth: number;      // Heading level / nesting depth
}
```

#### Chunk UI Components

1. **ChunkCard** — Compact representation in lists/grids
   - Shows: type icon, first line preview, word count, annotations count
   - Actions: expand, edit, annotate, reorder, merge with neighbor, split
   - States: default, selected, editing, highlighted, referenced

2. **ChunkDetail** — Expanded inline view
   - Full content with semantic formatting
   - Metadata sidebar (type, word count, language, confidence)
   - Annotation thread
   - Version history for this chunk
   - "Anchor to Chain" button for individual chunk attestation

3. **ChunkEditor** — Editing interface
   - Markdown editing with live preview
   - Type selector dropdown
   - Split/merge controls
   - Manual boundary adjustment

4. **ChunkGrid** — Grid layout for chunk overview
   - Cards in responsive grid (1-4 columns based on viewport)
   - Filter by type, sort by order/word count/annotation count
   - Drag-and-drop reordering
   - Multi-select for bulk operations

5. **ChunkList** — Dense list layout
   - Table-like with columns: order, type, preview, words, annotations
   - Inline expand on click
   - Keyboard navigation (j/k to move, Enter to expand)

### 6.3 Notebook Architecture

A **notebook** is a curated collection of chunks, potentially from multiple documents, organized for a specific purpose (studying, writing, presenting, reviewing).

#### Notebook Data Model

```typescript
interface Notebook {
  id: string;
  title: string;
  description: string;
  owner: string;
  collaborators: Collaborator[];
  sections: NotebookSection[];
  visibility: "private" | "lab" | "public";
  tags: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface NotebookSection {
  id: string;
  title: string;
  chunks: ChunkReference[];
  notes: string;                  // User's own notes alongside chunks
  order: number;
}

interface ChunkReference {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  annotation?: string;            // User's annotation on this chunk in this notebook context
  highlightColor?: string;
}
```

#### Notebook UI Components

1. **NotebookCard** — In notebook list
   - Title, description, chunk count, last modified
   - Visibility badge (private/lab/public)
   - Quick actions: open, share, duplicate, export

2. **NotebookEditor** — Full notebook editing
   - Section-based layout with drag-and-drop sections
   - Chunk insertion from document browser
   - Inline note editing between chunks
   - Side panel: document browser, chunk search, related chunks
   - Export to PDF/Markdown

3. **NotebookViewer** — Read-only presentation
   - Clean reading layout
   - Chunk source attribution (linked to original document)
   - Print-friendly styles

### 6.4 Frontend Page (`/frontend`)

This page serves as the **knowledge workspace** — the primary interface for interacting with documents, chunks, and notebooks.

#### Layout

```
┌─────────────────────────────────────────────────┐
│ TopBar: Search | View Toggle | New Document     │
├──────────┬──────────────────────┬───────────────┤
│          │                      │               │
│ Document │  Main Content Area   │  Context      │
│ Browser  │  (Document/Chunks/   │  Panel        │
│ Sidebar  │   Notebook view)     │  (Details/    │
│          │                      │   Notes/      │
│          │                      │   AI)         │
│          │                      │               │
├──────────┴──────────────────────┴───────────────┤
│ Status Bar: Word count | Chunk count | Mode     │
└─────────────────────────────────────────────────┘
```

- **Document Browser Sidebar**: Tree view of all documents, notebooks, recent items
- **Main Content**: Switches between document view, chunk view, notebook view
- **Context Panel**: Collapsible. Shows metadata, annotations, AI suggestions, related content
- **Status Bar**: Current document stats, active segmentation mode, save status

### 6.5 Research Lab Page (`/research-lab`)

This page is the **experimental analysis workspace** — for advanced segmentation, readability analysis, and document intelligence tools.

#### Sections

1. **Segmentation Lab**: Upload/paste text → select segmentation mode → see chunked output → adjust
2. **Readability Analyzer**: Paste text → see readability scores, paragraph reconstruction, formatting suggestions
3. **Comparison Tool**: Side-by-side chunk comparison between different segmentation modes
4. **Export Workshop**: Configure chunk export formats (JSON, Markdown, BibTeX sections)

---

## 7. Segmentation Engine Audit and Redesign Plan

### 7.1 The 18 Segmentation Modes — Classification

Since these modes are not yet implemented, this section defines them from scratch, organized into tiers:

#### Tier 1 — Basic (Always visible, no configuration needed)

| # | Mode | Description | Method |
|---|------|-------------|--------|
| 1 | **Paragraph** | Split by paragraph boundaries (double newline) | Deterministic |
| 2 | **Sentence** | Split by sentence boundaries (., !, ?, etc.) | Deterministic + heuristic |
| 3 | **Heading** | Split at heading boundaries (# in Markdown, structural detection) | Deterministic |
| 4 | **Fixed Size** | Split every N words/characters | Deterministic |
| 5 | **Page** | Split by page breaks (for PDFs) | Deterministic |

#### Tier 2 — Advanced (Visible under "Advanced" toggle)

| # | Mode | Description | Method |
|---|------|-------------|--------|
| 6 | **Discourse** | Split by discourse markers (however, therefore, in contrast) | Heuristic NLP |
| 7 | **Q&A** | Detect question-answer pairs and split accordingly | Heuristic NLP |
| 8 | **Dialogue** | Detect speaker turns in dialogue/interview text | Heuristic NLP |
| 9 | **List** | Detect and group list items (numbered, bulleted) | Deterministic + heuristic |
| 10 | **Argument** | Split by argument structure (claim, evidence, counter, conclusion) | Heuristic NLP |
| 11 | **Topic Shift** | Split when topic changes (based on vocabulary shift) | NLP + optional LLM |
| 12 | **Section** | Split by document sections (Introduction, Methods, Results, Discussion) | Heuristic |

#### Tier 3 — Expert (Hidden under "Expert Modes" toggle, or Research Lab only)

| # | Mode | Description | Method |
|---|------|-------------|--------|
| 13 | **Semantic** | Split by semantic coherence (embedding similarity) | NLP + embeddings |
| 14 | **Code Block** | Isolate code blocks, equations, special formatted regions | Deterministic |
| 15 | **Citation Zone** | Group text around citation clusters | Heuristic |
| 16 | **Narrative** | Split by narrative structure (setup, development, climax, resolution) | NLP + optional LLM |
| 17 | **Hybrid Adaptive** | Combine multiple modes with weighted scoring | Hybrid |
| 18 | **Custom Rules** | User-defined regex/pattern-based splitting | Deterministic |

### 7.2 Segmentation Engine Architecture

```
┌─────────────────────────────────────────────┐
│              Input Document                  │
│         (raw text / markdown / HTML)         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          1. Preprocessing Pipeline           │
│  • Unicode normalization (NFC)               │
│  • Whitespace normalization                  │
│  • Line ending normalization (→ \n)          │
│  • BOM removal                               │
│  • Language detection (optional)             │
│  • Structure extraction (headings, lists)    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         2. Structural Detection              │
│  • Heading hierarchy (H1-H6, # syntax)      │
│  • List detection (ordered, unordered)       │
│  • Code block boundaries (```, indentation)  │
│  • Equation boundaries ($$, \begin)          │
│  • Table detection                           │
│  • Block quote detection                     │
│  • Reference/bibliography section            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      3. Mode-Specific Segmentation           │
│  • Selected mode algorithm applied           │
│  • Boundary candidates generated             │
│  • Confidence scores assigned                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        4. Post-Processing / Validation       │
│  • Anti-fragmentation: merge chunks < N words│
│  • Anti-overmerging: split chunks > M words  │
│  • Orphan heading attachment                 │
│  • List item grouping                        │
│  • Code block integrity preservation         │
│  • Semantic coherence check                  │
│  • Chunk type classification                 │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           5. Output: Chunk[]                 │
│  • Ordered chunks with metadata              │
│  • Confidence scores                         │
│  • Type classifications                      │
│  • Boundary positions in original text       │
└─────────────────────────────────────────────┘
```

### 7.3 Implementation Strategy

**What should be deterministic code (no AI):**
- Paragraph splitting, sentence splitting, heading detection, fixed size, page breaks
- Code block detection, list detection, equation boundaries
- Whitespace/Unicode normalization
- Anti-fragmentation/anti-overmerging policies

**What should be heuristic NLP (rule-based, no LLM):**
- Discourse marker detection (keyword lists + position analysis)
- Q&A detection (question marks + response patterns)
- Dialogue detection (quotation patterns, speaker labels)
- Argument structure (claim/evidence keywords + discourse markers)
- Section detection (common section heading patterns)
- Citation zone detection (bracket/number patterns + proximity)

**What should optionally use LLM refinement:**
- Topic shift detection (can use embeddings or LLM)
- Semantic segmentation (requires embeddings)
- Narrative structure detection
- Hybrid adaptive mode (uses LLM to score boundary quality)

**What should never require an LLM:**
- Any Tier 1 mode
- Basic Tier 2 modes (Q&A, dialogue, list)
- All preprocessing and post-processing

### 7.4 Segmentation Quality Metrics

Each segmentation output should include:
- `averageChunkSize`: Mean word count per chunk
- `sizeStdDev`: Standard deviation of chunk sizes (lower = more uniform)
- `orphanCount`: Number of chunks with < 10 words
- `giantCount`: Number of chunks with > 1000 words
- `typeDistribution`: Distribution of chunk types
- `confidenceDistribution`: Distribution of boundary confidence scores

### 7.5 User Controls

- **Mode selector**: Dropdown grouped by tier (Basic / Advanced / Expert)
- **Size policy**: Min/max chunk size sliders (default: 20-500 words)
- **Overlap**: Toggle for overlapping chunks (useful for search/embedding applications)
- **Preview**: Real-time preview of segmentation result before applying
- **Compare**: Side-by-side comparison of two different modes on the same text

---

## 8. Full-Document Readability / Paragraph Reconstruction Plan

### 8.1 Problem Statement

Raw text from PDFs, imports, or user input often arrives as:
- Wall-of-text with no paragraph breaks
- Incorrectly split paragraphs (mid-sentence breaks from PDF extraction)
- Missing heading hierarchy
- Mixed content types (prose, lists, code, references) without visual separation
- Questions and answers not visually distinguished
- Dialogue without speaker separation

The readability system transforms raw text into **well-formatted, semantically structured display** without altering the original content.

### 8.2 Architecture: Layered Transformation Model

The system operates as a **render-time transformation** — the original text is preserved, and display transformations are computed and cached.

```
Original Text (stored as-is)
        │
        ▼
┌──────────────────────────────┐
│   Readability Transform      │
│                              │
│ 1. Paragraph Reconstruction  │
│ 2. Heading Detection         │
│ 3. List Formatting           │
│ 4. Q&A Separation            │
│ 5. Dialogue Formatting       │
│ 6. Code Block Isolation      │
│ 7. Quote Detection           │
│ 8. Reference Zone Formatting │
│ 9. Whitespace Optimization   │
│                              │
│ Output: DisplayNode[]        │
└──────────────┬───────────────┘
               │
               ▼
        Rendered Output
   (React components from
    DisplayNode tree)
```

### 8.3 Display Node Model

```typescript
type DisplayNode = 
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; content: string }
  | { type: "paragraph"; content: string; indent?: number }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "blockquote"; content: string; attribution?: string }
  | { type: "code"; language?: string; content: string }
  | { type: "equation"; content: string; display: "inline" | "block" }
  | { type: "qa"; question: string; answer: string }
  | { type: "dialogue"; speaker?: string; content: string }
  | { type: "separator"; style: "thin" | "thick" | "dotted" }
  | { type: "reference"; entries: ReferenceEntry[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "figure"; src?: string; caption: string }
  | { type: "annotation"; content: string; annotationType: "note" | "warning" | "tip" };
```

### 8.4 Reconstruction Algorithms

#### 8.4.1 Paragraph Reconstruction
- **Input**: Text with inconsistent line breaks
- **Logic**:
  1. Detect hard paragraph breaks (double newline, or single newline followed by indentation/capital letter)
  2. Detect soft breaks (single newline mid-sentence, preceded by lowercase letter or comma) → join with previous line
  3. Detect list transitions (line starting with `- `, `* `, `1. `, `a)`) → switch to list mode
  4. Detect heading transitions (short line followed by longer text, ALL CAPS lines, lines ending with colon and followed by content)
- **Multilingual**: Use Unicode sentence boundary detection (Intl.Segmenter where available)

#### 8.4.2 Q&A Detection
- **Triggers**: Lines ending with `?` followed by non-question content
- **Patterns**: "Q:", "Question:", numbered questions, interview format
- **Output**: Paired Q&A display nodes with visual distinction

#### 8.4.3 Dialogue Detection
- **Triggers**: Quotation marks, em-dashes at line start, "Speaker:" patterns
- **Output**: Dialogue nodes with optional speaker labels and visual indentation

#### 8.4.4 Argument/Example Separation
- **Triggers**: Discourse markers ("For example,", "In contrast,", "However,", "Therefore,")
- **Output**: Visual separation between argumentative moves (subtle left-border color coding)

### 8.5 Render Components

```typescript
// src/components/document/ReadabilityRenderer.tsx
interface ReadabilityRendererProps {
  nodes: DisplayNode[];
  density: "compact" | "comfortable" | "spacious";
  showStructureHints: boolean;  // Show colored borders indicating detected structure
  fontSize: "sm" | "base" | "lg";
}
```

Each `DisplayNode` type maps to a themed React component:
- `HeadingBlock` — uses `--doc-heading` token
- `ParagraphBlock` — uses `--doc-fg` token, proper line-height
- `ListBlock` — indented, with proper markers
- `QABlock` — question in `--info` color, answer in default
- `DialogueBlock` — speaker in `font-medium`, content indented
- `CodeBlock` — `--doc-code-bg`, `font-mono`
- `QuoteBlock` — left border in `--doc-quote-border`, italic

### 8.6 Caching Strategy

- Readability transforms are **deterministic** for the same input text
- Cache the `DisplayNode[]` array keyed by `sha256(text + options)`
- Store in IndexedDB for persistence across sessions
- Invalidate when text changes or user adjusts readability settings

### 8.7 Application Points

The readability system must apply uniformly across:
- Document full view (primary)
- Chunk content display (when showing chunk internals)
- Notebook chunk rendering
- Smart notes display
- Lab notebook protocol steps
- Wiki page content
- Discussion post content (simplified version)
- AI chat responses (simplified version)

---

## 9. Buttons / Menus / Panels / Modals / Sidebars Audit and Redesign Plan

### 9.1 Systematic Audit Framework

For every interactive element on every page, verify:

| Check | Question |
|-------|----------|
| **Functionality** | Does clicking it actually do something? |
| **Data dependency** | Does it require loaded data to work? If so, is it disabled when data isn't available? |
| **Empty state** | What happens when there's nothing to show? |
| **Loading state** | Does it show a spinner/skeleton while loading? |
| **Error state** | Does it handle API errors gracefully? |
| **Disabled state** | Is it visually distinct when disabled? |
| **Tooltip** | Does it have a tooltip explaining its function? |
| **Keyboard** | Can it be activated via keyboard? |
| **Theme** | Does it look correct in all 4 themes? |
| **Mobile** | Is it accessible on mobile? |

### 9.2 Known Issues to Address

#### Z-Index Management
Current z-index usage is ad hoc. Establish a layering system:

```css
--z-background: 0;
--z-content: 10;
--z-sticky: 20;       /* Sticky headers, floating actions */
--z-sidebar: 50;       /* Already used for sidebar */
--z-dropdown: 100;     /* Dropdowns, popovers */
--z-modal: 200;        /* Modals, dialogs */
--z-toast: 300;        /* Toasts, notifications */
--z-tooltip: 400;      /* Tooltips */
--z-command: 500;      /* Command palette */
```

#### Panel Overlap
- AI Chat window (draggable, 480x620px) can overlap with sidebar, TopBar, and page content
- Solution: AI Chat respects sidebar bounds, snaps to viewport edges, minimizes to a floating icon

#### Button Clusters
- Publications page: Filter + Sort + View Toggle + Add + Import/Export — 5 action areas in the header
- Solution: Group into: Primary (Add), Secondary (Filter dropdown with all filters), Tertiary (overflow menu with Import/Export/Sort/View)

### 9.3 Control Consolidation Patterns

**Pattern 1: Primary/Secondary/Overflow**
```
[+ New Document]  [Filter ▾]  [···]
                              ├── Sort by...
                              ├── View as...
                              ├── Import
                              ├── Export
                              └── Settings
```

**Pattern 2: Contextual Actions (appear on hover/select)**
```
Card default: Title, metadata, status badge
Card hover:   [Edit] [Archive] [···] appear in top-right corner
Card select:  Bulk action bar appears at top of list
```

**Pattern 3: Inline Expansion Actions**
```
Collapsed: Title + preview + [Expand ▾]
Expanded:  Full content + inline action bar at bottom
           [Edit] [Annotate] [Version History] [Anchor to Chain] [Share]
```

### 9.4 Globe Menus / Advanced Analysis Tools

These are referenced but not yet implemented. Plan:

1. **Globe Menu**: A floating action button with radial menu for quick access to:
   - AI analysis of selected text
   - Readability score
   - Segmentation preview
   - Citation lookup
   - Related content search
   
2. **Implementation**: Use a `Popover` triggered by a fixed-position button in the bottom-right (above AI chat). Only visible on document/chunk pages.

3. **Alternative**: Instead of a globe menu, use Ctrl+K command palette with document-specific commands when on document pages.

### 9.5 Modal/Dialog Audit

Current modal usage across the platform:

| Modal | Page | Purpose | Assessment |
|-------|------|---------|------------|
| EditProfileModal | Profile | Edit profile details | Good — extract to file |
| AddPublicationModal | Publications | Add new publication | Good — keep |
| ConnectionModal | Repositories | Connect new repo | Good — keep |
| DisconnectDialog | Repositories | Confirm disconnect | Good — keep |
| EditConnectionModal | Repositories | Edit repo settings | Good — keep |
| KeyboardShortcutsHelp | Global | Show shortcuts | Good — keep as dialog |
| AIChatAuthDialog | AI Chat | Auth for AI | Good — keep |
| CallOverlay | Messenger | Video call UI | Good — keep as overlay |

**Principle**: Modals for destructive/confirmation actions and complex forms. Inline expansion for viewing details. Sheets for mobile-equivalent of modals.

---

## 10. File Import / Export / Interoperability Plan

### 10.1 Current State

- `ImportExportManager` component exists in repositories
- PDF export via `jspdf` (lab notebook protocols, chat export)
- No unified file upload/parsing pipeline
- No document import (PDF, DOCX, Markdown, BibTeX, LaTeX)

### 10.2 Unified Ingestion Architecture

```
┌─────────────────────────────────────────┐
│          Upload Entry Points             │
│                                         │
│  • Publications: Import paper           │
│  • Lab Notebook: Import protocol        │
│  • Wiki: Import page                    │
│  • Documents (new): Import document     │
│  • References: Import BibTeX/RIS        │
│  • Notebooks: Import structured notes   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Shared Ingestion Pipeline          │
│      src/lib/ingestion/                 │
│                                         │
│  1. File Type Detection                 │
│     (mime type + extension + magic bytes)│
│                                         │
│  2. Parser Selection                    │
│     • .pdf → PDF parser                 │
│     • .docx → DOCX parser              │
│     • .md → Markdown parser             │
│     • .tex → LaTeX parser               │
│     • .bib → BibTeX parser              │
│     • .ris → RIS parser                 │
│     • .txt → Plain text parser          │
│     • .json → JSON parser               │
│                                         │
│  3. Content Extraction                  │
│     → Raw text + structural metadata    │
│                                         │
│  4. Normalization                       │
│     → Consistent internal format        │
│                                         │
│  5. Segmentation (if requested)         │
│     → Chunk array                       │
│                                         │
│  6. Readability Transform (if display)  │
│     → DisplayNode array                 │
└─────────────────────────────────────────┘
```

### 10.3 Supported File Types (Phase 1)

| Format | Import | Export | Parser Location |
|--------|--------|--------|-----------------|
| Markdown (.md) | ✅ | ✅ | Frontend (react-markdown already installed) |
| Plain Text (.txt) | ✅ | ✅ | Frontend |
| BibTeX (.bib) | ✅ | ✅ | Frontend (custom parser) |
| RIS (.ris) | ✅ | ✅ | Frontend (custom parser) |
| PDF (.pdf) | ✅ | ✅ | Backend (pdf-parse or Lovable Cloud function) |
| DOCX (.docx) | ✅ | ❌ | Backend (mammoth.js or Cloud function) |
| LaTeX (.tex) | ✅ | ✅ | Frontend (partial, structure extraction) |
| JSON (.json) | ✅ | ✅ | Frontend |
| CSV (.csv) | ✅ | ✅ | Frontend |

### 10.4 Export Formats

| Target | Pages | Format |
|--------|-------|--------|
| PDF | Publications, Lab Notebook, Notebooks | jspdf (existing) + enhanced templates |
| Markdown | Documents, Notebooks, Wiki | Generated from content model |
| BibTeX | Citations, References, Publications | Standard .bib format |
| JSON | Any | Full data model export |
| DOCX | Documents (future) | Server-side generation |

### 10.5 Implementation

1. Create `src/lib/ingestion/` directory with:
   - `detector.ts` — file type detection
   - `parsers/markdown.ts` — Markdown parser
   - `parsers/bibtex.ts` — BibTeX parser
   - `parsers/ris.ts` — RIS parser
   - `parsers/plaintext.ts` — Plain text normalizer
   - `parsers/latex.ts` — LaTeX structure extractor
   - `index.ts` — unified `ingestFile(file: File): Promise<IngestedDocument>` function

2. Create shared `FileUploadZone` component:
   - Drag-and-drop area
   - File type validation
   - Progress indicator
   - Error handling with user-friendly messages
   - Reusable across all upload points

---

## 11. Research-Lab Stability and Build Architecture Plan

### 11.1 Current Issues

The `/research-lab` route does not exist in the current `App.tsx` routes. Neither does `/frontend`. These need to be created as new pages.

### 11.2 Architectural Cleanup

1. **Import Alias Audit**:
   - All imports use `@/` prefix correctly (verified in vite.config.ts with `@` → `src/`)
   - No broken aliases detected in current codebase
   - New pages must follow the same pattern

2. **Shared Utilities**:
   - `src/lib/utils.ts` — only contains `cn()`. This is correct and minimal.
   - `src/lib/api.ts` — API abstraction layer. Currently points to mock/local endpoints.
   - `src/lib/blockchain-service.ts` — well-structured, ready for real backend.
   - `src/lib/blockchain-utils.ts` — SHA-256 hashing utilities.
   - All new features should add utilities to `src/lib/` following the same patterns.

3. **Route Registration**:
   All new pages must be:
   - Lazy-loaded with `const Page = lazy(() => import("./pages/Page"))`
   - Added to `App.tsx` Routes
   - Added to sidebar navigation in `AppSidebar.tsx`
   - Added to command palette in `CommandPalette.tsx`

4. **Component Organization**:
   ```
   src/components/
   ├── ui/              # shadcn primitives (DO NOT modify structure)
   ├── shared/          # Reusable across pages (SearchInput, StatsCard, EmptyState)
   ├── layout/          # App structure (AppSidebar, TopBar, AppLayout)
   ├── document/        # NEW: Document viewing, editing, readability
   ├── chunks/          # NEW: Chunk cards, editors, grids
   ├── notebooks/       # NEW: Notebook components
   ├── segmentation/    # NEW: Segmentation controls, previews
   ├── version-control/ # NEW: Diff views, branch selectors, commit history
   ├── blockchain/      # Existing: Verification badges, anchoring
   ├── feed/            # Feed-specific components
   ├── messenger/       # Messenger components
   ├── ai-chat/         # AI chat components
   ├── collaboration/   # Collaboration components
   ├── ...              # Other domain-specific folders
   ```

### 11.3 New Route Plan

```typescript
// New routes to add to App.tsx
const Frontend = lazy(() => import("./pages/Frontend"));
const ResearchLab = lazy(() => import("./pages/ResearchLab"));
const DocumentView = lazy(() => import("./pages/DocumentView"));
const DocumentEdit = lazy(() => import("./pages/DocumentEdit"));

// Routes
<Route path="/frontend" element={<Frontend />} />
<Route path="/research-lab" element={<ResearchLab />} />
<Route path="/documents/:id" element={<DocumentView />} />
<Route path="/documents/:id/edit" element={<DocumentEdit />} />
```

---

## 12. GitHub-for-Science / GitHub-for-Writing Product Evolution Plan

### 12.1 Core Metaphor Mapping

| Git Concept | Scholar-Friendly Term | think!hub Implementation |
|-------------|----------------------|--------------------------|
| Repository | Knowledge Repository / Research Project | A collection of versioned scholarly artifacts |
| Commit | Recorded Change / Checkpoint | A saved state with message, author, timestamp |
| Branch | Draft Line / Theory Variant / Revision Path | Parallel versions of the same work |
| Main/Master | Published Version / Canonical Version | The accepted/approved state |
| Merge | Integration / Acceptance | Combining changes from a branch into main |
| Pull Request | Contribution Proposal / Review Request | Request to merge a branch with review workflow |
| Fork | Derivative Work / Scholarly Fork | An independent copy that evolves separately |
| Tag/Release | Milestone / Official Version | A frozen, attestable point-in-time version |
| Issue | Research Question / Task / Problem | Tracked items requiring attention |
| Diff | Change Comparison / Version Comparison | Side-by-side view of what changed |
| Conflict | Overlapping Changes | Two edits to the same section that must be reconciled |
| Clone | Copy to My Workspace | Create a local working copy |
| Push | Submit Changes | Send local changes to the shared repository |
| Pull | Sync Updates | Receive changes from collaborators |

### 12.2 Dual Vocabulary System

The UI should offer two vocabulary modes:
- **Scholarly Mode** (default): Uses scholar-friendly terms
- **Developer Mode** (toggle in Settings): Uses Git-native terms

Implementation: A `useVocabulary()` hook that returns term translations based on user preference.

```typescript
// src/hooks/use-vocabulary.ts
const SCHOLARLY_TERMS = {
  commit: "Checkpoint",
  branch: "Draft Line",
  merge: "Integrate",
  pullRequest: "Review Request",
  fork: "Derivative",
  tag: "Milestone",
  diff: "Compare Versions",
  push: "Submit",
  pull: "Sync",
  repository: "Knowledge Repository",
  conflict: "Overlapping Changes",
};

const DEVELOPER_TERMS = {
  commit: "Commit",
  branch: "Branch",
  merge: "Merge",
  pullRequest: "Pull Request",
  fork: "Fork",
  tag: "Tag",
  diff: "Diff",
  push: "Push",
  pull: "Pull",
  repository: "Repository",
  conflict: "Conflict",
};
```

### 12.3 Knowledge Repository Structure

A Knowledge Repository contains:

```
my-research-project/
├── README.md                    # Project overview
├── metadata.json                # Authors, institution, visibility, tags
├── theory/
│   ├── main-thesis.md           # Core theoretical framework
│   ├── alternative-approach.md  # Branch-worthy: alternative theory
│   └── literature-review.md     # Review of existing work
├── methods/
│   ├── experimental-design.md   # Methodology description
│   ├── data-collection.md       # Data gathering protocol
│   └── analysis-pipeline.md     # Analysis methodology
├── data/
│   ├── raw/                     # Raw data references (links, not files)
│   ├── processed/               # Processed data descriptions
│   └── codebook.md              # Variable descriptions
├── results/
│   ├── findings.md              # Core findings
│   ├── figures/                  # Figure descriptions and captions
│   └── tables/                   # Table data
├── discussion/
│   ├── interpretation.md        # Results interpretation
│   ├── limitations.md           # Known limitations
│   └── future-work.md           # Future directions
├── reviews/
│   ├── peer-review-1.md         # Received reviews
│   └── response-to-review-1.md  # Author responses
├── outputs/
│   ├── paper-v1.md              # Generated paper (tag: "submitted-v1")
│   ├── thesis-chapter-3.md      # Generated thesis chapter
│   ├── public-summary.md        # Plain-language summary
│   └── lecture-notes.md         # Teaching version
├── citations.bib                # Bibliography
└── contributors.json            # CRediT-mapped contributions
```

### 12.4 Version Control Data Model

```typescript
interface KnowledgeRepository {
  id: string;
  name: string;
  description: string;
  owner: string;
  collaborators: Collaborator[];
  visibility: "private" | "lab" | "public";
  defaultBranch: string;
  branches: Branch[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  attestations: Attestation[];  // Blockchain anchored milestones
}

interface Branch {
  name: string;
  label: string;               // Scholar-friendly name
  headCommitId: string;
  description: string;
  author: string;
  createdAt: string;
  status: "active" | "merged" | "abandoned";
}

interface Commit {
  id: string;                   // SHA-256 hash of content
  parentIds: string[];          // Parent commit(s) — enables merge history
  repositoryId: string;
  branch: string;
  author: string;
  message: string;              // "Updated methodology section with reviewer feedback"
  timestamp: string;
  changes: Change[];
  attestation?: Attestation;    // Optional blockchain anchor
}

interface Change {
  filePath: string;
  changeType: "added" | "modified" | "deleted" | "renamed";
  hunks: DiffHunk[];            // Line-level changes
}

interface DiffHunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
}

interface DiffLine {
  type: "context" | "add" | "remove";
  content: string;
  lineNumber: number;
}

interface Tag {
  name: string;
  label: string;                // "Thesis Submission v1", "Nature Submission"
  commitId: string;
  message: string;
  author: string;
  timestamp: string;
  attestation?: Attestation;    // Frozen milestone on-chain
  type: "milestone" | "submission" | "release" | "preregistration";
}

interface ContributionProposal {  // "Pull Request"
  id: string;
  title: string;
  description: string;
  author: string;
  sourceBranch: string;
  targetBranch: string;
  status: "open" | "reviewing" | "approved" | "merged" | "rejected";
  reviewers: Reviewer[];
  comments: Comment[];
  changes: Change[];
  createdAt: string;
  updatedAt: string;
}
```

### 12.5 Scholarly Diff Types

Beyond line-level text diffs, think!hub should support domain-specific diff views:

1. **Text Diff** (standard): Line-by-line comparison with additions/removals highlighted
2. **Citation Diff**: Which citations were added, removed, or renumbered
3. **Claim Diff**: How the paper's claims changed between versions (requires NLP)
4. **Method Diff**: Changes to methodology description (structural comparison)
5. **Conclusion Drift Detection**: How conclusions shifted between versions
6. **Dataset Version Diff**: Changes in referenced dataset versions
7. **Author Contribution Diff**: Changes in contributor roles between versions

**Phase 1 implementation:** Text diff only (standard line-level diff)
**Phase 2:** Citation diff (compare BibTeX entries)
**Phase 3+:** Claim/method/conclusion diffs (requires NLP pipeline)

### 12.6 UI Components for Version Control

1. **CommitHistory** — Timeline of checkpoints with author, message, timestamp
2. **BranchSelector** — Dropdown to switch between draft lines
3. **DiffViewer** — Side-by-side or inline diff view with `--diff-add`, `--diff-remove` colors
4. **ContributionProposalView** — Review request detail with comments, changes, approval buttons
5. **TagList** — List of milestones/releases with attestation badges
6. **MergeDialog** — Conflict resolution interface when overlapping changes exist
7. **VersionCompare** — Select two versions and see what changed

---

## 13. Version-Controlled Knowledge Architecture Plan

### 13.1 Repository as Knowledge Object

Unlike Git repositories (which contain code files), a think!hub Knowledge Repository is a **semantic container** for evolving scholarly work. The content is not just text files — it's structured knowledge with typed modules.

### 13.2 Multi-View Generation

One repository can generate multiple views:

| View Type | Description | Use Case |
|-----------|-------------|----------|
| **Paper** | Formatted academic paper (Introduction → Methods → Results → Discussion) | Journal submission |
| **Thesis Chapter** | Chapter-formatted with thesis-specific structure | Thesis integration |
| **Lecture Notes** | Simplified, pedagogical version | Teaching |
| **Public Explainer** | Plain-language summary for non-experts | Outreach, media |
| **Peer Review Response** | Point-by-point response to reviewer comments | Revision process |
| **Preprint** | Pre-review version with appropriate caveats | arXiv, bioRxiv |
| **Policy Summary** | Short, actionable summary for policymakers | Policy impact |
| **Poster** | Key findings in visual/structured format | Conference presentation |

**Implementation**: Each view type is a **template** that maps repository sections to output sections. The template pulls content from the repository's versioned files and composes them into the target format.

```typescript
interface ViewTemplate {
  id: string;
  name: string;                   // "Academic Paper"
  sections: TemplateSection[];
  outputFormat: "markdown" | "pdf" | "html";
  style: "formal" | "accessible" | "pedagogical";
}

interface TemplateSection {
  heading: string;
  sourceFiles: string[];          // Repository file paths to include
  transformations: string[];      // "summarize", "simplify", "formalize"
  order: number;
}
```

### 13.3 Branching Semantics for Scholarly Work

| Branch Pattern | Scholarly Meaning | Example |
|---------------|-------------------|---------|
| `main` | Canonical/accepted version | The current best version |
| `revision/reviewer-1` | Addressing reviewer feedback | Changes requested by reviewer 1 |
| `theory/alternative-framework` | Alternative theoretical approach | Exploring a different theoretical lens |
| `method/bayesian-approach` | Alternative methodology | Trying Bayesian instead of frequentist |
| `replication/dataset-b` | Replication with different data | Testing findings with new data |
| `teaching/simplified` | Simplified for teaching | Pedagogical adaptation |
| `translation/german` | Language translation | Translated version |

### 13.4 Semantic Diff Architecture

For scholarly-specific diffs, the system needs:

1. **Citation Graph Diff**: Parse BibTeX from two versions, compute added/removed/modified references
2. **Structural Section Diff**: Compare section headings and their relative ordering
3. **Claim Extraction + Comparison**: (Future, NLP-dependent) Extract claim statements and compare semantic similarity
4. **Equation Diff**: (Future) Compare LaTeX equations structurally

**Phase 1**: Standard text diff with unified/split view
**Phase 2**: Citation diff (BibTeX comparison), structural diff (section heading comparison)
**Phase 3**: AI-assisted semantic diff (requires NLP pipeline)

---

## 14. Competitive Landscape and Differentiation Analysis

### 14.1 Why This Exact Platform Does Not Exist

The combination that think!hub proposes — version-controlled knowledge infrastructure + social network + blockchain attestation + scholarly workflow — has not been built as a unified platform because:

1. **Fragmented user needs**: Researchers use 5-15 different tools (editor, reference manager, file sharing, email, Git, social network, journal portal). No single tool has attempted full integration.

2. **Tool conservatism in academia**: Scientists are notoriously conservative about tools. Adoption requires either institutional mandate or extreme pain-point relief.

3. **Misaligned incentives**: Journal publishers control the reward system. They have no incentive to fund transparent, version-controlled alternatives.

4. **Technical complexity**: Building Git-like version control with scholarly-aware semantics, plus social features, plus blockchain integration, is genuinely hard.

5. **Chicken-and-egg problem**: The value of a scholarly social network scales with users. Early adoption is the hardest phase.

### 14.2 Competitive Analysis

| Platform | What It Does | Where think!hub Differs |
|----------|-------------|------------------------|
| **Git + LaTeX** | Version control for code/docs | Not scholar-friendly. No social layer. No built-in review workflow. Requires developer skills. |
| **Overleaf** | Collaborative LaTeX editing | LaTeX-only. No structured knowledge model. No version control beyond history. No social features. No attribution tracking. |
| **Authorea** | Web-based scientific writing | Better UX than LaTeX, but no deep version control. No chunk-level analysis. Limited social features. No blockchain. |
| **OSF (Open Science Framework)** | Project management for open science | File storage focus. Limited editing. No real version control. No social feed. Poor UX. |
| **arXiv** | Preprint repository | Static submissions. No collaboration. No version control. No editing. |
| **ResearchGate** | Scientific social network | Social-only. No writing tools. No version control. No structured knowledge. Declining engagement. |
| **Manubot** | Open scholarly writing | Developer-focused (GitHub-based). Not accessible to non-technical researchers. |
| **Google Docs** | Collaborative editing | No scholarly semantics. No citation management. No version control beyond history. No attribution tracking. |
| **Notion** | Knowledge management | Too generic. No scholarly awareness. No citation handling. No review workflow. No blockchain. |
| **ResearchHub** | Open science + crypto incentives | Token-based incentives alienate traditional academics. Narrow focus on paper discussion. |

### 14.3 True Innovation of think!hub

The genuine innovation is the **integration** of:
1. Structured scholarly writing with semantic awareness
2. Git-like version control with scholar-friendly vocabulary
3. Contribution tracking with CRediT-compatible role mapping
4. Cryptographic milestone attestation (optional, non-intrusive)
5. Review/approval workflows built into the version control
6. Social discovery and collaboration layer
7. Graded transparency (private → lab → public)
8. Multi-view generation from single knowledge repository

No existing platform combines all of these. Each competitor has 1-2 of these features. The bet is that the integration creates enough value to overcome switching costs.

### 14.4 Realistic Assessment

**Strengths of the thesis:**
- Real pain points exist (attribution disputes, version chaos, review opacity)
- Open science policies increasingly mandate transparency
- PhD students and early-career researchers are more tool-flexible than senior faculty
- Institutional mandates (thesis submission workflows) can drive adoption

**Risks:**
- Feature bloat risk — trying to do too much at once
- Adoption barrier — needs critical mass in a department/lab to be useful
- "GitHub is enough" objection from technically skilled researchers
- "Word/Overleaf is enough" objection from less technical researchers
- Blockchain association may alienate crypto-skeptical academics

**Mitigation:**
- Start with thesis workflow MVP (narrow, high-pain-point use case)
- Do not lead with blockchain — it's a trust layer, not a selling point
- Focus on UX excellence — make it genuinely easier than current workflows
- Seek institutional partnerships for pilot programs

---

## 15. Transparency Stages / Private-Lab-Public / Adoption Psychology Plan

### 15.1 Three-Stage Visibility Model

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│ PRIVATE  │ ───► │   LAB    │ ───► │  PUBLIC  │
│          │      │          │      │          │
│ Only me  │      │ My team/ │      │ Anyone   │
│          │      │ lab/dept │      │          │
│ Drafts,  │      │ Internal │      │ Published│
│ ideas,   │      │ review,  │      │ versions,│
│ early    │      │ feedback,│      │ certified│
│ work     │      │ iteration│      │ releases │
└──────────┘      └──────────┘      └──────────┘
```

### 15.2 Implementation

```typescript
type Visibility = "private" | "lab" | "public";

interface VisibilityConfig {
  level: Visibility;
  labMembers?: string[];          // User IDs with lab access
  labName?: string;               // Lab/team/department name
  publicSince?: string;           // When made public
  attestationOnPublic?: boolean;  // Auto-anchor to blockchain when going public
}
```

**UI Component**: `VisibilityBadge` — consistent across all pages

```tsx
// Color mapping using design tokens
const VISIBILITY_STYLES: Record<Visibility, { bg: string; text: string; icon: LucideIcon }> = {
  private: { bg: "bg-muted", text: "text-muted-foreground", icon: Lock },
  lab: { bg: "bg-info-muted", text: "text-info", icon: Users },
  public: { bg: "bg-success-muted", text: "text-success", icon: Globe },
};
```

### 15.3 Adoption Psychology Analysis

**Fear of intermediate sharing:**
- Researchers fear showing unfinished work because it could be stolen, misinterpreted, or used to judge them unfairly
- The lab stage mitigates this — sharing only with trusted collaborators
- Blockchain timestamping provides proof-of-existence for ideas even at private/lab stage

**Does transparency motivate or discourage?**
- **Motivates**: When researchers see that their incremental progress is tracked and attributed
- **Discourages**: When researchers feel surveilled or rushed
- **Solution**: Make transparency opt-in at every stage. Private is the default. No pressure to go public.

**Does timestamping reduce fear of idea theft?**
- **Partially yes**: Cryptographic proof-of-existence at a specific timestamp is powerful evidence
- **But**: It proves existence, not authorship (unless combined with identity verification)
- **And**: It doesn't prevent idea theft — it provides evidence for disputes
- **Key insight**: The value is in **deterrence**, not enforcement. If everyone knows timestamping exists, theft becomes riskier.

**What timestamping proves:**
- ✅ This content existed at this time
- ✅ This hash was created by this account
- ⚠️ This person authored this content (only if identity is verified — ORCID, institutional email)
- ❌ This idea is novel (requires prior art search)
- ❌ Legal ownership (requires formal IP processes)
- ❌ DOI equivalence (DOI is a persistent identifier, not a proof system)

**Would some users avoid the platform because plagiarism becomes harder?**
- Yes, but this is a feature, not a bug
- If the platform becomes a standard in a field, reluctant actors face a legitimacy gap
- This is realistic only at scale — not relevant in early adoption

### 15.4 Product Presentation Strategy

1. **Never lead with blockchain**: Present it as "timestamp verification" or "proof-of-existence"
2. **Make it optional**: Users can fully use the platform without ever anchoring anything
3. **Auto-suggest at milestones**: When tagging a version as "submitted" or "published", suggest timestamping
4. **Show value passively**: "This document was first recorded on [date] — verified ✓"
5. **Avoid crypto jargon**: No "mining", "gas fees", "tokens", "wallet". Just "verification" and "timestamp".

---

## 16. Blockchain / Timestamp / Attestation Architecture Plan

### 16.1 Current Implementation Assessment

The current blockchain layer is well-structured:
- `blockchain-service.ts`: SHA-256 hashing, Hedera HCS anchoring, audit trails
- `blockchain-utils.ts`: Hash generation utilities
- `blockchain-notification-service.ts`: Real-time event notifications
- `BlockchainVerificationBadge`: Visual verification indicators
- `AnchorToChainButton`: User-triggered anchoring
- Settings panel for API URL, topic ID, network selection

**Assessment**: The infrastructure is solid. The main gap is that it's not yet connected to a real backend (mock data only).

### 16.2 What Should Be On-Chain vs Off-Chain

| Data | Storage | Reason |
|------|---------|--------|
| Content hash (SHA-256) | On-chain (HCS) | Proof of existence — small, immutable |
| Consensus timestamp | On-chain (HCS) | Trustworthy timestamp |
| Transaction ID | On-chain (HCS) | Verification reference |
| Full document content | Off-chain (database) | Too large for chain, privacy |
| Author identity | Off-chain (with ORCID link) | Privacy, mutability |
| Contribution details | Off-chain (database) | Detailed data |
| Milestone metadata | On-chain (HCS message) | Attestation record |
| SBT/credential metadata | On-chain (token) | Permanent credential |

### 16.3 Attestation Use Cases (Priority Order)

1. **Milestone Attestation** (highest value): When a version is tagged as "submitted", "approved", "published" — anchor the hash
2. **Contribution Proof**: When a significant contribution is verified by collaborators — anchor the record
3. **Idea Timestamp**: When a researcher wants to prove they had an idea at a specific time — anchor the idea hash
4. **Review Completion**: When a peer review is completed — anchor the review timestamp
5. **Data Integrity**: When a dataset version is published — anchor the data hash

### 16.4 Privacy Preservation

- Only **hashes** go on-chain — never raw content
- The hash proves existence without revealing content
- To verify, the claimant must provide the original content for hash comparison
- This is compatible with private and lab visibility stages

### 16.5 Identity Verification Layer

For attestations to be meaningful, identity must be verified:

1. **Level 0**: Unverified account (email only)
2. **Level 1**: Institutional email verified (`.edu`, `.ac.uk`, etc.)
3. **Level 2**: ORCID connected and verified
4. **Level 3**: Institutional affiliation confirmed (future: institutional API integration)

Attestations should display the identity verification level alongside the blockchain proof.

### 16.6 Alternative to Full Blockchain: RFC 3161 Timestamps

For institutions uncomfortable with blockchain, offer RFC 3161-compatible timestamping as an alternative:
- Uses trusted timestamp authorities (TSAs) instead of blockchain
- Legally recognized in many jurisdictions
- Can run alongside blockchain attestation
- Same SHA-256 hashing infrastructure

**Implementation**: Add a `timestampProvider` option in settings: "Hedera Hashgraph" | "RFC 3161 TSA" | "Both"

### 16.7 Anti-Hype Design Principles

1. Blockchain is a **tool**, not a **feature** — users interact with "Verify" and "Timestamp", not with blockchain
2. No cryptocurrency, no tokens, no wallets exposed to users
3. No transaction fees visible to users (backend handles any costs)
4. Verification results displayed as simple badges, not blockchain explorer dumps
5. Blockchain configuration is in Settings > Advanced, not prominently displayed

---

## 17. Realistic University-Adoption MVP Plan

### 17.1 The Right Initial Product Thesis

> **MVP thesis**: think!hub is a thesis/dissertation workspace where graduate students and their supervisors track progress, attribute contributions, and produce verifiable milestone records — with less friction than email + Word + Dropbox.

### 17.2 Why This Wedge

- **Pain point is acute**: Thesis supervision is chaotic. Versions are lost. Contributions are disputed. Progress is hard to track.
- **Users are captive**: PhD students spend 3-6 years on their thesis. They need a tool for this specific duration.
- **Supervisors have authority**: A supervisor can mandate a tool for their lab.
- **Small group size**: A lab has 3-15 people. Network effects needed are small.
- **Institutional alignment**: Universities want better thesis tracking for quality assurance.

### 17.3 Target Users (First Wave)

1. **Primary**: PhD students in STEM fields (tech-comfortable, writing-heavy)
2. **Secondary**: Thesis supervisors/advisors
3. **Tertiary**: Multi-author research teams within a lab
4. **NOT first wave**: Entire departments, undergraduate students, humanities scholars

### 17.4 MVP Feature Set (What to Include)

#### Core Workspace
- ✅ Knowledge Repository for thesis/project
- ✅ Structured file organization (theory, methods, results, discussion)
- ✅ Markdown-based document editor with live preview
- ✅ Basic formatting: headings, lists, bold/italic, code blocks, equations (KaTeX)

#### Version Control
- ✅ Checkpoint/commit with message
- ✅ Version history timeline
- ✅ Simple diff view (text-level)
- ✅ Restore previous version
- ❌ Branching (Phase 2)
- ❌ Merge (Phase 2)

#### Contribution Tracking
- ✅ Author attribution per change
- ✅ CRediT-compatible role assignment
- ✅ Contribution summary generator
- ✅ Activity timeline per contributor

#### Milestone & Review
- ✅ Milestone tags with descriptions
- ✅ Supervisor approval workflow (approve/request changes)
- ✅ Comment threads on specific sections
- ✅ Frozen milestone snapshots (read-only tagged versions)

#### Visibility
- ✅ Private (default)
- ✅ Lab (shared with specified collaborators)
- ❌ Public (Phase 2)

#### Attestation (Optional)
- ✅ One-click milestone timestamping
- ✅ Verification badge on timestamped milestones
- ✅ Proof-of-existence receipt (downloadable)
- ❌ SBTs (Phase 3)
- ❌ Full blockchain explorer integration (Phase 3)

#### Export
- ✅ PDF export of current version
- ✅ Markdown export
- ✅ BibTeX export of references
- ❌ DOCX export (Phase 2)
- ❌ LaTeX export (Phase 2)

#### Collaboration
- ✅ Invite collaborators by email
- ✅ Role assignment (author, reviewer, supervisor)
- ✅ Comment/annotation on sections
- ❌ Real-time co-editing (Phase 3)
- ❌ Video calls (exists in platform, but not MVP-critical)

### 17.5 What NOT to Include in MVP

- Full social network features (feed, community, groups, events)
- AI assistant (nice-to-have, not core)
- Segmentation engine (advanced feature)
- Readability reconstruction (advanced feature)
- Knowledge graph
- Conference management
- Reputation scoring
- Full blockchain dashboard
- Multiple view generation from repository
- Branching and merging (too complex for first version)

### 17.6 MVP Phases

**Phase 1 (Month 1-2): Core Editor + Version History**
- Document editor with Markdown support
- Save/load documents
- Version checkpoint with message
- Version history list
- Basic diff view
- File organization within a repository

**Phase 2 (Month 3-4): Collaboration + Contribution**
- Invite collaborators
- Role-based permissions (owner, editor, viewer, supervisor)
- Per-change author attribution
- Comment threads on sections
- Contribution summary

**Phase 3 (Month 5-6): Milestones + Review + Attestation**
- Milestone tagging
- Supervisor approval workflow
- Frozen snapshots
- Optional timestamp attestation
- Export (PDF, Markdown)

**Phase 4 (Month 7-8): Polish + Pilot**
- UX refinement based on internal testing
- Onboarding flow for new users
- Help documentation
- Pilot with 2-3 university labs
- Feedback collection and iteration

### 17.7 How to Avoid Crypto-Native Alienation

1. Never mention "blockchain" in marketing or onboarding
2. Call it "Verified Timestamps" or "Digital Notarization"
3. Make it one optional checkbox: "☐ Create a verified timestamp for this milestone"
4. Show the result as a simple badge: "✓ Verified · March 15, 2026"
5. Only show technical details (txId, hash) in an expandable "Technical Details" section
6. Never require a wallet, token, or crypto knowledge

### 17.8 How to Avoid Requiring Users to Become Developers

1. No Git CLI. No terminal commands. No config files.
2. "Save" = commit. "Version History" = log. "Compare" = diff.
3. Visual branch metaphor (if/when branching is added): Kanban-like parallel columns, not ASCII graphs
4. Conflict resolution: Simple "Choose Version A or B" interface, not manual merge editing
5. All actions are GUI-driven with clear labels and tooltips

---

## 18. Contribution Tracking / Authorship Plan

### 18.1 CRediT Taxonomy Integration

The Contributor Roles Taxonomy (CRediT) defines 14 roles:

| Role | Description | think!hub Tracking Method |
|------|-------------|--------------------------|
| Conceptualization | Ideas, hypothesis formation | Tagged at idea/hypothesis creation |
| Data curation | Data management, annotation | Tracked in data-related file changes |
| Formal analysis | Statistical, mathematical analysis | Tracked in methods/results changes |
| Funding acquisition | Financial support | Linked from Funding page |
| Investigation | Research execution | Tracked across all research-related changes |
| Methodology | Development of methodology | Tracked in methods file changes |
| Project administration | Management, coordination | Tracked via milestone/task management |
| Resources | Materials, instruments, computing | Tracked in resources/materials sections |
| Software | Programming, software development | Tracked in code-related files |
| Supervision | Oversight, mentorship | Tracked via review/approval actions |
| Validation | Verification, replication | Tracked via replication branches |
| Visualization | Data visualization, figures | Tracked in figure-related changes |
| Writing – original draft | Initial writing | Tracked in document creation/major additions |
| Writing – review & editing | Critical review, editing | Tracked in review changes and comments |

### 18.2 Automatic Role Detection

Based on the type of change a contributor makes, automatically suggest CRediT roles:

```typescript
function suggestRoles(changes: Change[]): CreditRole[] {
  const roles: Set<CreditRole> = new Set();
  
  for (const change of changes) {
    if (change.filePath.startsWith("theory/")) roles.add("conceptualization");
    if (change.filePath.startsWith("methods/")) roles.add("methodology");
    if (change.filePath.startsWith("data/")) roles.add("data-curation");
    if (change.filePath.startsWith("results/")) roles.add("formal-analysis");
    if (change.filePath.startsWith("discussion/")) roles.add("writing-original-draft");
    if (change.changeType === "modified" && change.hunks.length < 5) roles.add("writing-review-editing");
    // ... more heuristics
  }
  
  return Array.from(roles);
}
```

### 18.3 Contribution Dashboard

A per-repository view showing:
- Each contributor's changes over time (contribution graph — already exists as `ContributionGraph` component)
- Role assignment per contributor (checkboxes for CRediT roles)
- Auto-suggested roles based on change analysis
- Contribution statement generator: "A.B. contributed to conceptualization, methodology, and writing – original draft. C.D. contributed to data curation and formal analysis."
- Export contribution statement in standard formats for journal submission

### 18.4 Dispute Reduction

When contributors disagree about attribution:
1. Version history provides objective evidence of who changed what and when
2. Blockchain timestamps provide immutable proof of change timing
3. CRediT role assignments are versioned — changes to attribution are tracked
4. Supervisor can resolve disputes with approval authority

---

## 19. Review / Approval / Frozen Snapshot / Milestone Plan

### 19.1 Review Workflow Model

```typescript
interface ReviewRequest {
  id: string;
  repositoryId: string;
  commitId: string;                // The version being reviewed
  author: string;                   // Who requests review
  reviewers: Reviewer[];
  status: "pending" | "in_review" | "approved" | "changes_requested" | "rejected";
  type: "milestone" | "submission" | "chapter" | "section" | "general";
  title: string;
  description: string;
  comments: ReviewComment[];
  decision?: ReviewDecision;
  createdAt: string;
  resolvedAt?: string;
}

interface Reviewer {
  userId: string;
  role: "supervisor" | "co-author" | "external" | "committee-member";
  status: "pending" | "reviewing" | "approved" | "changes_requested";
  submittedAt?: string;
}

interface ReviewComment {
  id: string;
  reviewerId: string;
  type: "general" | "section-specific" | "line-specific";
  targetSection?: string;
  targetLines?: { start: number; end: number };
  content: string;
  severity: "suggestion" | "minor" | "major" | "critical";
  resolved: boolean;
  createdAt: string;
}

interface ReviewDecision {
  decision: "approve" | "request_changes" | "reject";
  summary: string;
  decidedBy: string;
  decidedAt: string;
  attestation?: Attestation;       // Optional blockchain anchor of decision
}
```

### 19.2 Milestone Types

| Type | Description | Typical Use |
|------|-------------|-------------|
| **Draft Checkpoint** | Regular save point | Weekly progress saves |
| **Chapter Complete** | A thesis chapter is ready for review | Thesis writing |
| **Internal Review** | Ready for co-author/team review | Multi-author papers |
| **Supervisor Review** | Ready for supervisor feedback | Thesis supervision |
| **Pre-submission** | Final version before journal/conference submission | Publication workflow |
| **Submitted** | The exact version submitted to a venue | Publication tracking |
| **Camera-ready** | The accepted, final version | Post-review |
| **Preregistration** | Locked hypothesis/method (before data collection) | Open science |
| **Defense Ready** | The version presented at thesis defense | Thesis lifecycle |

### 19.3 Frozen Snapshots

When a milestone is "frozen":
1. The exact content at that point is immutable — no edits allowed to that version
2. A hash of the content is computed (SHA-256)
3. The hash can optionally be anchored to blockchain
4. A downloadable "proof receipt" is generated (PDF with hash, timestamp, attestation details)
5. Future changes create new versions — the frozen snapshot remains accessible

### 19.4 Approval Workflow UI

```
┌─────────────────────────────────────────────────┐
│ Review Request: "Chapter 3 - Methodology"       │
│ Status: 🟡 Changes Requested                    │
│ Requested by: Alice (PhD Student)               │
│ Reviewer: Prof. Bob (Supervisor) — 🔴 Changes   │
│ Reviewer: Dr. Carol (Co-author) — 🟢 Approved   │
├─────────────────────────────────────────────────┤
│ Comments (3):                                    │
│ ├── [Major] "Section 3.2 needs stronger..."     │
│ ├── [Minor] "Consider rephrasing the..."        │
│ └── [Suggestion] "You might also cite..."       │
├─────────────────────────────────────────────────┤
│ [View Changes] [Respond to Comments] [Revise]   │
└─────────────────────────────────────────────────┘
```

---

## 20. Knowledge Graph / Search / Discovery Long-Term Plan

### 20.1 Knowledge Graph Architecture (Phase 3+)

The knowledge graph is a **long-term strategic feature** — not for MVP, but the data model must be designed now to not preclude it.

#### Node Types
- **Concept**: A scientific concept, theory, or term
- **Claim**: A specific assertion made in a document
- **Method**: A research method or technique
- **Dataset**: A referenced or used dataset
- **Person**: A researcher (linked to profile)
- **Institution**: A university, lab, or organization
- **Publication**: A published work
- **Repository**: A knowledge repository in think!hub

#### Edge Types
- `cites` — Publication → Publication
- `uses_method` — Publication → Method
- `supports` / `contradicts` — Claim → Claim
- `authored_by` — Publication → Person
- `affiliated_with` — Person → Institution
- `derived_from` — Repository → Repository (fork relationship)
- `related_to` — Concept → Concept
- `uses_dataset` — Publication → Dataset

### 20.2 Search Architecture

**Phase 1 (Current)**: Client-side search over mock data (already functional)
**Phase 2**: Server-side full-text search over documents and metadata
**Phase 3**: Semantic search using embeddings (requires backend NLP pipeline)
**Phase 4**: Graph-based search ("find all claims that contradict claim X")

### 20.3 Discovery Features (Future)

- **Related Work Discovery**: Given a document, find similar documents in the platform
- **Collaborator Matching**: Based on shared interests, complementary skills, citation overlap
- **Contradiction Detection**: Surface claims that contradict each other across different repositories
- **Gap Detection**: Identify uncited but relevant work
- **Theory Lineage**: Trace how a theoretical framework evolved across multiple repositories

### 20.4 Data Model Compatibility

The key decision for now: design the `KnowledgeRepository`, `Commit`, and `Change` models so they can later be indexed into a graph database without restructuring.

This means:
- Every entity has a stable, unique ID
- Relationships are explicit (not inferred from position)
- Metadata is structured (not buried in free text)
- Citations are parsed and stored as structured references (not just BibTeX strings)

---

## 21. AI Assistance Layer Plan

### 21.1 Justified AI Use Cases

| Feature | Justification | Priority | Method |
|---------|--------------|----------|--------|
| **Segmentation Mode Recommender** | Users don't know which of 18 modes to use | Medium | LLM classification |
| **Readability Improver** | Suggest paragraph breaks, heading insertions | Medium | Rule-based + LLM |
| **Terminology Harmonizer** | Flag inconsistent term usage across a document | Medium | NLP (concordance analysis) |
| **Review Summarizer** | Summarize reviewer comments into action items | High | LLM summarization |
| **Contribution Statement Generator** | Auto-generate CRediT statements from change history | High | Template + data |
| **Citation Suggestion** | Suggest relevant citations based on content | Medium | Embedding similarity |
| **Overclaiming Detector** | Flag statements that overstate the evidence | Low | LLM analysis |
| **Section Simplifier** | Create simplified versions for teaching/public | Low | LLM rewriting |
| **Version Drift Detector** | Alert when conclusions shift between versions | Low | NLP comparison |
| **Structure Assistant** | Suggest document structure based on content type | Medium | LLM + templates |

### 21.2 What NOT to Use AI For

- **Authorship detection**: Unreliable and ethically fraught
- **Automated peer review**: Too consequential, too unreliable
- **Plagiarism detection**: Better handled by specialized services (Turnitin)
- **Auto-writing content**: Undermines scholarly integrity
- **Automatic approval/rejection**: Human judgment required

### 21.3 AI Integration Architecture

The existing `ThinkHubAIChat` system supports multi-provider AI (OpenAI, Anthropic, Gemini, Local). This infrastructure can be reused:

1. AI features call the same `src/lib/api/aiChat.ts` abstraction
2. Each feature sends a specific system prompt + user content
3. Results are displayed in context (not in a separate chat window)
4. Users can accept, reject, or modify AI suggestions
5. AI suggestions are never automatically applied — always human-confirmed

### 21.4 Current AI Infrastructure Assessment

- `ThinkHubAIChat`: Multi-provider, draggable/resizable, conversation history
- `AICopilotPanel`: In messenger, provides contextual AI assistance
- `AIResearchAssistant`: On Index page, general research suggestions

**Plan**: Extend the AI abstraction to support **contextual AI actions** — right-click or select text → "AI: Simplify" / "AI: Find citations" / "AI: Check consistency"

---

## 22. Minimal / Reduced-Chaos Modes Plan

### 22.1 Focus Mode

A platform-wide toggle that strips non-essential UI for deep work:

**What disappears in Focus Mode:**
- Feed/social widgets
- Notification badge counts (notifications still work, just no visual distraction)
- Trending topics, suggested researchers
- Onboarding widgets
- Quick stats that aren't directly relevant to current task
- AI chat floating button (still accessible via Ctrl+Shift+A)
- Collaboration indicators (online status dots)

**What remains:**
- Sidebar navigation (but collapsed by default)
- TopBar (simplified: just search + menu + minimal user avatar)
- Main content area (full width)
- Document editor/viewer
- Essential page controls

### 22.2 Implementation

```typescript
// src/hooks/use-focus-mode.ts
interface FocusModeContext {
  focusMode: boolean;
  toggleFocusMode: () => void;
}

// Toggle in Settings + keyboard shortcut (Ctrl+Shift+F)
// Stored in localStorage
```

**UI integration:**
- Sidebar: Check `focusMode` → auto-collapse
- TopBar: Check `focusMode` → show minimal version
- Index page: Check `focusMode` → hide social widgets
- Any widget component: Check `focusMode` → conditionally render

### 22.3 Density Mode

Already planned in Settings (Section 5.9). Three levels:

| Mode | Line Height | Padding | Font Size | Card Gap |
|------|-------------|---------|-----------|----------|
| Compact | 1.3 | Reduced | 0.8125rem | 0.5rem |
| Comfortable (default) | 1.5 | Standard | 0.875rem | 0.75rem |
| Spacious | 1.7 | Generous | 1rem | 1rem |

Implementation via CSS custom properties:
```css
.density-compact { --density-padding: 0.375rem; --density-gap: 0.5rem; --density-text: 0.8125rem; }
.density-comfortable { --density-padding: 0.75rem; --density-gap: 0.75rem; --density-text: 0.875rem; }
.density-spacious { --density-padding: 1rem; --density-gap: 1rem; --density-text: 1rem; }
```

### 22.4 Page-Specific Simplified Views

Some pages may benefit from a "simple/advanced" toggle:

- **Publications**: Simple = list with title, author, year, status. Advanced = current full view.
- **Contribution Tracking**: Simple = hide hashes, show only attribution summary. Advanced = current view.
- **Blockchain Dashboard**: Simple = verification count + recent items. Advanced = full analytics.

---

## 23. Risk Management / Testing / Migration / Anti-Regression Plan

### 23.1 Migration Order

The implementation must follow a strict dependency order:

```
Phase 0: Foundation
├── Design token extensions (new CSS variables)
├── Shared animation variants
├── Shared component audit + extraction
├── Z-index system
└── Focus mode / density mode infrastructure

Phase 1: Core Abstractions
├── Readability engine (src/lib/readability/)
├── Ingestion pipeline (src/lib/ingestion/)
├── Version control data model (src/types/version-control.ts)
├── Vocabulary hook (src/hooks/use-vocabulary.ts)
└── CRediT taxonomy types (src/types/credit.ts)

Phase 2: UI Components
├── Document components (src/components/document/)
├── Chunk components (src/components/chunks/)
├── Version control components (src/components/version-control/)
├── Contribution components (src/components/contributions/)
└── Review components (src/components/review/)

Phase 3: Pages
├── /frontend (Knowledge Workspace)
├── /research-lab (Analysis Lab)
├── /documents/:id (Document View)
├── /documents/:id/edit (Document Edit)
└── Refactor existing pages (decomposition)

Phase 4: Integration
├── Connect version control to blockchain attestation
├── Connect contribution tracking to CRediT
├── Connect review workflow to milestone system
├── Connect visibility stages across all pages
└── Connect search to new content types
```

### 23.2 Testing Strategy

#### Unit Tests (vitest — already configured)
- Test all pure functions: readability transforms, segmentation algorithms, hash computations, diff algorithms
- Test hooks: `useVocabulary`, `useFocusMode`, `useOnboarding`
- Target: 80% coverage for `src/lib/` and `src/hooks/`

#### Component Tests (@testing-library/react — already configured)
- Test key interactive components: ChunkCard, DiffViewer, VisibilityBadge, ReviewRequest
- Test state transitions: focus mode toggle, density changes, visibility changes
- Test theme rendering: Verify no hardcoded colors (snapshot testing)

#### E2E Tests (Playwright — already configured)
- Critical user flows:
  1. Create document → edit → save checkpoint → view history → restore version
  2. Create review request → add comments → approve → freeze milestone
  3. Change visibility → verify access control
  4. Export document → verify PDF output
- Run on every PR merge

### 23.3 Anti-Regression Checklist

Before merging any significant change:

- [ ] All 4 themes render correctly (light, hi-tech, dark, system)
- [ ] Mobile viewport (360px) displays correctly
- [ ] Tablet viewport (768px) displays correctly
- [ ] No hardcoded colors in new components
- [ ] No z-index outside the defined system
- [ ] Empty states present for all new lists/grids
- [ ] Loading states present for all new async operations
- [ ] All new buttons have tooltips
- [ ] All new interactive elements are keyboard-accessible
- [ ] No console errors in any theme
- [ ] Existing tests still pass
- [ ] New code has tests for pure functions
- [ ] PageLoadingFallback or appropriate skeleton is shown during lazy load
- [ ] Sidebar navigation updated if new routes added
- [ ] Command palette updated if new routes added

### 23.4 Feature Flags

```typescript
// src/lib/feature-flags.ts
const FEATURE_FLAGS = {
  VERSION_CONTROL: "ff_version_control",
  KNOWLEDGE_REPO: "ff_knowledge_repo",
  SEGMENTATION_ENGINE: "ff_segmentation",
  READABILITY_ENGINE: "ff_readability",
  CREDIT_TRACKING: "ff_credit_tracking",
  FOCUS_MODE: "ff_focus_mode",
  RESEARCH_LAB: "ff_research_lab",
} as const;

export function isFeatureEnabled(flag: string): boolean {
  return localStorage.getItem(flag) === "true";
}
```

New features are gated behind flags until stable. Enable in Settings > Developer > Feature Flags.

### 23.5 Performance Considerations

- **Bundle size**: Monitor with `vite-plugin-visualizer`. Current dependency list is reasonable.
- **Lazy loading**: Already in place for all pages. New pages must follow the same pattern.
- **Large lists**: Use `react-window` (already installed) for any list > 50 items
- **Memoization**: `useMemo` and `useCallback` for expensive computations (many pages already do this)
- **Image optimization**: Lazy load images below the fold
- **Debouncing**: Already used for search inputs (`useDebounce` hook exists)

### 23.6 Documentation Needs

1. **Architecture Decision Records (ADRs)**: For each major architectural choice, create a short ADR in `docs/adr/`
2. **Component Documentation**: JSDoc comments on all shared components
3. **API Contract Documentation**: TypeScript interfaces serve as the contract — ensure they're well-commented
4. **User-Facing Help**: In-app tooltips and a `/help` page (future)

---

## 24. Phased Implementation Roadmap

### Phase 1: Foundation Hardening (Months 1-2)

**Month 1:**
- [ ] Extend design tokens (doc-*, diff-*, stage-* variables)
- [ ] Create z-index system
- [ ] Create shared animation variants (`src/lib/animations.ts`)
- [ ] Create focus mode infrastructure
- [ ] Create density mode infrastructure
- [ ] Extract large pages into smaller components (start with LabNotebook 721 lines, IdeaProvenance 656 lines, Publications 640 lines)
- [ ] Audit all pages for hardcoded colors → replace with tokens
- [ ] Create `VisibilityBadge` component

**Month 2:**
- [ ] Complete page decomposition (all pages under 250 lines)
- [ ] Create `FileUploadZone` shared component
- [ ] Create ingestion pipeline skeleton (`src/lib/ingestion/`)
- [ ] Create `src/types/version-control.ts` data models
- [ ] Create `src/types/credit.ts` CRediT taxonomy types
- [ ] Create `useVocabulary` hook
- [ ] Deduplicate sidebar icons
- [ ] Add missing empty states across all pages
- [ ] Add missing loading skeletons

### Phase 2: Knowledge Infrastructure Core (Months 3-5)

**Month 3:**
- [ ] Build basic document editor (Markdown, live preview)
- [ ] Create `/documents/:id` and `/documents/:id/edit` pages
- [ ] Implement version checkpoint (save with message)
- [ ] Implement version history list
- [ ] Create `CommitHistory` component
- [ ] Create basic text `DiffViewer` component

**Month 4:**
- [ ] Implement Knowledge Repository model
- [ ] Create repository creation workflow
- [ ] Implement file organization within repository
- [ ] Create `ReadabilityRenderer` component
- [ ] Implement basic readability transforms (paragraph reconstruction, heading detection, list formatting)
- [ ] Create `/frontend` page (Knowledge Workspace)

**Month 5:**
- [ ] Implement contribution attribution per change
- [ ] Create CRediT role assignment UI
- [ ] Create contribution dashboard per repository
- [ ] Implement contribution statement generator
- [ ] Create `ContributionDashboard` component
- [ ] Connect contributions page to new CRediT model

### Phase 3: Scholarly Workflow Engine (Months 6-8)

**Month 6:**
- [ ] Implement review request workflow
- [ ] Create `ReviewRequestView` component
- [ ] Implement comment threads on sections
- [ ] Implement supervisor approval flow
- [ ] Create `ReviewComment` component with severity levels

**Month 7:**
- [ ] Implement milestone tagging
- [ ] Implement frozen snapshots (immutable versions)
- [ ] Connect milestone tagging to blockchain attestation
- [ ] Create downloadable proof receipts
- [ ] Implement graded visibility (private/lab/public) across all content types

**Month 8:**
- [ ] Implement invite collaborators workflow
- [ ] Implement role-based permissions (owner, editor, viewer, supervisor)
- [ ] Build export pipeline (PDF, Markdown, BibTeX)
- [ ] Create onboarding flow for new users
- [ ] Polish and test MVP feature set

### Phase 4: Intelligence Layer (Months 9-11)

**Month 9:**
- [ ] Implement segmentation engine (Tier 1: Paragraph, Sentence, Heading, Fixed Size, Page)
- [ ] Create `/research-lab` page
- [ ] Create segmentation mode selector UI
- [ ] Create chunk preview component
- [ ] Implement segmentation quality metrics

**Month 10:**
- [ ] Implement Tier 2 segmentation modes (Discourse, Q&A, Dialogue, List, Argument, Topic Shift, Section)
- [ ] Implement advanced readability transforms (Q&A separation, dialogue detection, argument/example separation)
- [ ] Create notebook system (model, UI, editor)
- [ ] Create chunk grid/list views

**Month 11:**
- [ ] Implement AI-assisted features (review summarizer, terminology harmonizer, structure assistant)
- [ ] Implement contextual AI actions (select text → AI action)
- [ ] Implement Tier 3 segmentation modes (Semantic, Code Block, Citation Zone, Narrative, Hybrid, Custom)
- [ ] Build segmentation comparison tool

### Phase 5: Platform Maturity (Months 12-18)

**Months 12-13:**
- [ ] Implement branching and merging for knowledge repositories
- [ ] Implement contribution proposals (pull requests)
- [ ] Implement conflict resolution UI
- [ ] Build scholarly diff types (citation diff, structural diff)

**Months 14-15:**
- [ ] Implement multi-view generation (paper, thesis chapter, public summary)
- [ ] Build knowledge graph foundations (entity extraction, relationship mapping)
- [ ] Implement semantic search
- [ ] University pilot program launch

**Months 16-18:**
- [ ] Implement public discovery layer
- [ ] Build collaborator matching
- [ ] Implement contradiction detection (experimental)
- [ ] RFC 3161 timestamping alternative
- [ ] Identity verification tiers (institutional email, ORCID)
- [ ] Scale testing and performance optimization
- [ ] Documentation and help system

---

## 25. Highest-Priority Changes to Apply First

These are the changes that should be implemented immediately, before any new feature work:

### Priority 1: Architectural Hygiene (Week 1-2)

1. **Decompose large page files**: LabNotebook (721 lines), IdeaProvenance (656 lines), Publications (640 lines), Settings (611 lines), Profile (547 lines), Index (509 lines). Each should be under 250 lines with extracted components.

2. **Deduplicate sidebar icons**: Fix FlaskConical used for both Projects and Blockchain Dashboard. Fix Calendar used for both Events and Conferences.

3. **Create shared animation variants**: Extract common framer-motion patterns into `src/lib/animations.ts`.

4. **Audit hardcoded colors**: Search all components for non-token colors (e.g., direct hex/rgb values, Tailwind color classes like `text-gray-*`). Replace with semantic tokens.

### Priority 2: Design System Extensions (Week 3-4)

5. **Add new design tokens**: Document tokens (--doc-*), diff tokens (--diff-*), stage tokens (--stage-*) to index.css and tailwind.config.ts.

6. **Create z-index system**: Define layering constants and audit current z-index usage.

7. **Create VisibilityBadge component**: Reusable across all content types.

8. **Create focus mode infrastructure**: Hook + Settings toggle + keyboard shortcut.

### Priority 3: Data Model Foundation (Week 5-6)

9. **Create version control types**: `src/types/version-control.ts` with Repository, Commit, Branch, Tag, Change, DiffHunk interfaces.

10. **Create CRediT types**: `src/types/credit.ts` with role taxonomy and contribution mapping interfaces.

11. **Create ingestion types**: `src/lib/ingestion/types.ts` with IngestedDocument, FileTypeDetection interfaces.

12. **Create vocabulary hook**: `src/hooks/use-vocabulary.ts` for dual terminology (scholarly/developer).

### Priority 4: Core Component Library (Week 7-8)

13. **ReadabilityRenderer**: Display node model + renderer component with theme-aware styling.

14. **DiffViewer**: Basic unified/split diff view with --diff-* token colors.

15. **CommitHistory**: Timeline component for version checkpoints.

16. **FileUploadZone**: Shared drag-and-drop upload component with type validation.

---

## Appendix A: File Impact Map

| Area | New Files | Modified Files |
|------|-----------|----------------|
| Types | `src/types/version-control.ts`, `src/types/credit.ts`, `src/types/document.ts` | — |
| Hooks | `src/hooks/use-vocabulary.ts`, `src/hooks/use-focus-mode.ts`, `src/hooks/use-density.ts`, `src/hooks/use-onboarding.ts` | `src/hooks/use-theme.tsx` |
| Lib | `src/lib/animations.ts`, `src/lib/ingestion/`, `src/lib/readability/`, `src/lib/segmentation/`, `src/lib/diff.ts`, `src/lib/feature-flags.ts` | `src/lib/api.ts` |
| Components | `src/components/document/`, `src/components/chunks/`, `src/components/notebooks/`, `src/components/version-control/`, `src/components/review/`, `src/components/shared/VisibilityBadge.tsx`, `src/components/shared/FileUploadZone.tsx` | Multiple existing components (decomposition) |
| Pages | `src/pages/Frontend.tsx`, `src/pages/ResearchLab.tsx`, `src/pages/DocumentView.tsx`, `src/pages/DocumentEdit.tsx` | All existing pages (decomposition), `src/App.tsx` (new routes) |
| Styles | — | `src/index.css` (new tokens), `tailwind.config.ts` (new token mappings) |

## Appendix B: Dependency Considerations

**Current dependencies that support the plan:**
- `react-markdown` — Document rendering ✅
- `jspdf` — PDF export ✅
- `framer-motion` — Animations ✅
- `react-window` — Virtualized lists ✅
- `recharts` — Charts/graphs ✅
- `react-resizable-panels` — Split views for diff ✅

**Dependencies that may be needed:**
- `diff` or `jsdiff` — Text diffing library (for DiffViewer)
- `@codemirror/view` or `monaco-editor` — Document editor (if Markdown textarea is insufficient)
- `katex` — Equation rendering in documents
- `prosemirror` or `tiptap` — Rich text editing (if needed beyond Markdown)
- `idb` — IndexedDB wrapper for readability cache

**Dependencies to evaluate:**
- No new dependencies should be added without clear justification
- Prefer lightweight libraries over heavy frameworks
- Test bundle impact before committing to a dependency

---

*This document is a living plan. Each phase should be re-evaluated upon completion based on user feedback, pilot results, and technical discoveries.*
