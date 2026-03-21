/* ────────────────────────────────────────────────────────────────
   canvasData.ts  —  Research Canvas: types · storage · templates
──────────────────────────────────────────────────────────────── */

/* ── Node Types ─────────────────────────────────────────────── */
export type NodeType =
  | "note"        // free-form sticky note
  | "insight"     // key finding / insight
  | "question"    // open research question
  | "hypothesis"  // hypothesis to explore
  | "citation"    // paper / reference card
  | "evidence"    // supporting evidence
  | "task"        // action item
  | "document"    // rich-text document (created or uploaded)
  | "image"       // uploaded image
  | "pdf"         // uploaded PDF
  | "section";    // zone label / frame divider

export interface NodeTypeMeta {
  label: string;
  shortLabel: string;
  defaultColor: string;
  description: string;
}

export const NODE_TYPE_META: Record<NodeType, NodeTypeMeta> = {
  note:       { label: "Note",       shortLabel: "Note",    defaultColor: "amber",  description: "Free-form note" },
  insight:    { label: "Insight",    shortLabel: "Insight", defaultColor: "green",  description: "Key finding or insight" },
  question:   { label: "Question",   shortLabel: "Q",       defaultColor: "purple", description: "Open research question" },
  hypothesis: { label: "Hypothesis", shortLabel: "Hyp",     defaultColor: "blue",   description: "Hypothesis to explore" },
  citation:   { label: "Citation",   shortLabel: "Ref",     defaultColor: "slate",  description: "Paper or reference" },
  evidence:   { label: "Evidence",   shortLabel: "Ev",      defaultColor: "teal",   description: "Supporting evidence" },
  task:       { label: "Task",       shortLabel: "Task",    defaultColor: "rose",   description: "Action item" },
  document:   { label: "Document",   shortLabel: "Doc",     defaultColor: "blue",   description: "Text document" },
  image:      { label: "Image",      shortLabel: "Img",     defaultColor: "sky",    description: "Uploaded image" },
  pdf:        { label: "PDF",        shortLabel: "PDF",     defaultColor: "red",    description: "Uploaded PDF" },
  section:    { label: "Section",    shortLabel: "Sec",     defaultColor: "slate",  description: "Zone label / frame" },
};

/* ── Node Colors ─────────────────────────────────────────────── */
export interface NodeColorDef {
  bg: string;
  border: string;
  icon: string;
  tag: string;
  label: string;
  stroke: string; // SVG stroke for connection arrows
}

export const NODE_COLORS: Record<string, NodeColorDef> = {
  blue:   { bg: "bg-card", border: "border-blue-400/60",    icon: "text-blue-400",    tag: "text-blue-400",    label: "Blue",   stroke: "#60a5fa" },
  purple: { bg: "bg-card", border: "border-purple-400/60",  icon: "text-purple-400",  tag: "text-purple-400",  label: "Purple", stroke: "#c084fc" },
  green:  { bg: "bg-card", border: "border-emerald-400/60", icon: "text-emerald-400", tag: "text-emerald-400", label: "Green",  stroke: "#34d399" },
  amber:  { bg: "bg-card", border: "border-amber-400/60",   icon: "text-amber-400",   tag: "text-amber-400",   label: "Amber",  stroke: "#fbbf24" },
  rose:   { bg: "bg-card", border: "border-rose-400/60",    icon: "text-rose-400",    tag: "text-rose-400",    label: "Rose",   stroke: "#fb7185" },
  slate:  { bg: "bg-card", border: "border-slate-400/60",   icon: "text-slate-400",   tag: "text-slate-400",   label: "Slate",  stroke: "#94a3b8" },
  teal:   { bg: "bg-card", border: "border-teal-400/60",    icon: "text-teal-400",    tag: "text-teal-400",    label: "Teal",   stroke: "#2dd4bf" },
  sky:    { bg: "bg-card", border: "border-sky-400/60",     icon: "text-sky-400",     tag: "text-sky-400",     label: "Sky",    stroke: "#38bdf8" },
  red:    { bg: "bg-card", border: "border-red-400/60",     icon: "text-red-400",     tag: "text-red-400",     label: "Red",    stroke: "#f87171" },
};

/* ── Node Data ───────────────────────────────────────────────── */
export interface CanvasNodeData {
  id: string;
  type: NodeType;
  title: string;
  content: string;      // HTML for text types; empty for image/pdf
  url?: string;         // blob URL (ephemeral — lost on reload)
  mimeType?: string;
  fileSize?: number;
  x: number;
  y: number;
  colorKey: string;
  pinned?: boolean;
  tags: string[];
  status?: "open" | "resolved" | "pending" | "done";
  // Citation-specific
  author?: string;
  year?: number;
  doi?: string;
  journal?: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Connections ─────────────────────────────────────────────── */
export type ConnType = "supports" | "contradicts" | "related" | "derived" | "compare" | "questions" | "custom";

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  connType: ConnType;
}

export const CONN_TYPE_META: Record<ConnType, { label: string; stroke: string; dash?: string }> = {
  supports:    { label: "supports",     stroke: "#34d399" },
  contradicts: { label: "contradicts",  stroke: "#f87171", dash: "5,3" },
  related:     { label: "related to",   stroke: "#94a3b8" },
  derived:     { label: "derived from", stroke: "#60a5fa" },
  compare:     { label: "compare with", stroke: "#fbbf24", dash: "3,3" },
  questions:   { label: "questions",    stroke: "#c084fc", dash: "2,4" },
  custom:      { label: "→",            stroke: "#94a3b8" },
};

/* ── Board ───────────────────────────────────────────────────── */
export interface Board {
  id: string;
  name: string;
  description?: string;
  templateId?: string;
  nodes: CanvasNodeData[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}

/* ── Persistence ─────────────────────────────────────────────── */
const STORAGE_KEY = "thinkhub_research_canvas_v2";

export function loadBoards(): Board[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Board[];
  } catch {
    return [];
  }
}

export function saveBoards(boards: Board[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (e) {
    console.warn("Canvas save failed:", e);
  }
}

/* ── ID + Factory Helpers ────────────────────────────────────── */
export function genId(prefix = "n"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createNode(
  type: NodeType,
  x: number,
  y: number,
  overrides: Partial<CanvasNodeData> = {}
): CanvasNodeData {
  const now = new Date().toISOString();
  return {
    id: genId(),
    type,
    title: NODE_TYPE_META[type].label,
    content: "",
    x, y,
    colorKey: NODE_TYPE_META[type].defaultColor,
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createBoard(
  name: string,
  nodes: CanvasNodeData[] = [],
  connections: Connection[] = [],
  templateId?: string,
  description?: string
): Board {
  const now = new Date().toISOString();
  return { id: genId("board"), name, description, templateId, nodes, connections, createdAt: now, updatedAt: now };
}

/* ── Template Node Helpers ───────────────────────────────────── */
function sec(title: string, x: number, y: number, colorKey = "slate") {
  return createNode("section", x, y, { title, colorKey });
}
function n(title: string, content: string, x: number, y: number, colorKey = "amber") {
  return createNode("note", x, y, { title, content, colorKey });
}
function cit(title: string, author: string, year: number, x: number, y: number) {
  return createNode("citation", x, y, { title, author, year, colorKey: "slate" });
}
function q(title: string, x: number, y: number) {
  return createNode("question", x, y, { title, colorKey: "purple" });
}
function ins(title: string, content: string, x: number, y: number) {
  return createNode("insight", x, y, { title, content, colorKey: "green" });
}
function hyp(title: string, content: string, x: number, y: number) {
  return createNode("hypothesis", x, y, { title, content, colorKey: "blue" });
}
function ev(title: string, content: string, x: number, y: number, colorKey = "teal") {
  return createNode("evidence", x, y, { title, content, colorKey });
}
function tsk(title: string, content: string, x: number, y: number) {
  return createNode("task", x, y, { title, content, colorKey: "rose" });
}

/* ── Board Templates ─────────────────────────────────────────── */
export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  category: "research" | "planning" | "analysis" | "preparation";
  create: () => Board;
}

export const BOARD_TEMPLATES: BoardTemplate[] = [
  /* 1 — Literature Review */
  {
    id: "lit-review",
    name: "Literature Review",
    description: "Track papers across reading stages: Inbox → Reading → Extracted → Synthesized.",
    category: "research",
    create: () => createBoard(
      "Literature Review",
      [
        sec("INBOX",       60,  60, "slate"),
        sec("READING NOW", 360, 60, "blue"),
        sec("EXTRACTED",   660, 60, "purple"),
        sec("SYNTHESIZED", 960, 60, "green"),
        cit("Vaswani et al. (2017) — Attention Is All You Need", "Vaswani et al.", 2017, 60, 130),
        cit("Brown et al. (2020) — Language Models are Few-Shot Learners", "Brown et al.", 2020, 60, 250),
        cit("LeCun et al. (2015) — Deep Learning", "LeCun et al.", 2015, 360, 130),
        n("Synthesis Note", "Transformer scaling shows emergent capabilities not predicted by small-scale experiments.", 960, 130, "green"),
        q("What are the limits of scale for language models?", 960, 250),
        n("How to use", "1. Add citations to Inbox.\n2. Move to Reading Now when actively reading.\n3. Add Extracted notes for key findings.\n4. Write Synthesis notes once you have a view.", 60, 370, "amber"),
      ],
      [],
      "lit-review",
      "Organize papers from inbox to synthesis"
    ),
  },
  /* 2 — Concept Map */
  {
    id: "concept-map",
    name: "Concept Map",
    description: "Map relationships between concepts, theories, and ideas in your field.",
    category: "research",
    create: () => {
      const central = ins("Central Concept", "Define your core concept. What is the central idea you are mapping?", 380, 180);
      const q1 = q("How does X relate to Y?", 80, 80);
      const q2 = q("What evidence supports this?", 680, 80);
      const h1 = hyp("Sub-theory A", "A possible sub-mechanism or explanation.", 60, 320);
      const h2 = hyp("Sub-theory B", "An alternative explanation or mechanism.", 720, 320);
      const n1 = n("Open Issues", "What remains unresolved? What would change your view?", 380, 360, "amber");
      const conns: Connection[] = [
        { id: genId("c"), fromId: central.id, toId: q1.id, label: "raises", connType: "questions" },
        { id: genId("c"), fromId: central.id, toId: q2.id, label: "raises", connType: "questions" },
        { id: genId("c"), fromId: h1.id, toId: central.id, label: "supports", connType: "supports" },
        { id: genId("c"), fromId: h2.id, toId: central.id, label: "supports", connType: "supports" },
      ];
      return createBoard("Concept Map", [central, q1, q2, h1, h2, n1], conns, "concept-map", "Map concepts and relationships");
    },
  },
  /* 3 — Mentor / Advisor Meeting Prep */
  {
    id: "mentor-prep",
    name: "Advisor Meeting Prep",
    description: "Structure your agenda, progress updates, questions, and blockers before a supervisor meeting.",
    category: "preparation",
    create: () => createBoard(
      "Advisor Meeting Prep",
      [
        sec("AGENDA",            60,  60,  "blue"),
        sec("PROGRESS",          360, 60,  "green"),
        sec("OPEN QUESTIONS",    660, 60,  "purple"),
        sec("BLOCKERS",          960, 60,  "rose"),
        n("Topic 1: Research direction",  "Discuss feasibility of the current approach vs. alternatives.", 60,  130, "blue"),
        n("Topic 2: Timeline review",     "Review chapter deadline and current writing progress.", 60, 250, "blue"),
        n("Completed: Baseline results",  "Ran baselines on dataset A. Results are promising. See attached table.", 360, 130, "green"),
        n("In progress: Literature search","~60% through the shortlist from Semantic Scholar.", 360, 250, "green"),
        q("Is my current approach novel enough for the venue?", 660, 130),
        q("Should I switch to a different evaluation benchmark?", 660, 250),
        tsk("Prepare 3-slide update",    "Summarize progress in 3 slides before the meeting.", 960, 130),
        tsk("Send agenda 24h in advance", "", 960, 250),
      ],
      [],
      "mentor-prep",
      "Prepare structured advisor meetings"
    ),
  },
  /* 4 — Paper Comparison */
  {
    id: "paper-comparison",
    name: "Paper Comparison",
    description: "Compare multiple papers side by side on method, results, and limitations.",
    category: "analysis",
    create: () => createBoard(
      "Paper Comparison",
      [
        sec("PAPER A",  60,  60, "blue"),
        sec("PAPER B",  440, 60, "purple"),
        sec("PAPER C",  820, 60, "green"),
        cit("Paper A — Full Title", "Author A et al.", 2023, 60,  130),
        cit("Paper B — Full Title", "Author B et al.", 2022, 440, 130),
        cit("Paper C — Full Title", "Author C et al.", 2024, 820, 130),
        n("Method",      "Describe the method of Paper A.", 60,  250, "slate"),
        n("Method",      "Describe the method of Paper B.", 440, 250, "slate"),
        n("Method",      "Describe the method of Paper C.", 820, 250, "slate"),
        n("Key Result",  "Main finding from Paper A.", 60,  370, "blue"),
        n("Key Result",  "Main finding from Paper B.", 440, 370, "purple"),
        n("Key Result",  "Main finding from Paper C.", 820, 370, "green"),
        sec("SYNTHESIS", 60,  510, "amber"),
        ins("Key Difference", "What fundamentally distinguishes these approaches?", 60, 570, "amber"),
        q("Which approach is most applicable to my work?", 440, 570),
      ],
      [],
      "paper-comparison",
      "Compare multiple papers on key dimensions"
    ),
  },
  /* 5 — Hypothesis Explorer */
  {
    id: "hypothesis-explorer",
    name: "Hypothesis Explorer",
    description: "Systematically develop, challenge, and refine a research hypothesis with evidence mapping.",
    category: "analysis",
    create: () => {
      const h  = hyp("Main Hypothesis", "State your hypothesis. What do you believe to be true, and why?", 380, 80);
      const e1 = ev("Supporting Evidence 1", "First supporting piece of evidence.", 80,  270);
      const e2 = ev("Supporting Evidence 2", "Second supporting piece of evidence.", 360, 270);
      const e3 = ev("Counter-evidence", "First counter-evidence or limitation.", 640, 270, "rose");
      const q1 = q("What would falsify this hypothesis?", 80, 420);
      const q2 = q("What experiment would directly test this?", 380, 420);
      const t1 = tsk("Design experiment", "Outline methodology to test the hypothesis.", 660, 420);
      const conns: Connection[] = [
        { id: genId("c"), fromId: e1.id, toId: h.id, label: "supports",     connType: "supports" },
        { id: genId("c"), fromId: e2.id, toId: h.id, label: "supports",     connType: "supports" },
        { id: genId("c"), fromId: e3.id, toId: h.id, label: "contradicts",  connType: "contradicts" },
        { id: genId("c"), fromId: q1.id, toId: h.id, label: "questions",    connType: "questions" },
      ];
      return createBoard("Hypothesis Explorer", [h, e1, e2, e3, q1, q2, t1], conns, "hypothesis-explorer", "Map evidence for and against a hypothesis");
    },
  },
  /* 6 — Reading Pipeline */
  {
    id: "reading-pipeline",
    name: "Reading Pipeline",
    description: "Manage your research reading queue and extract insights as you read.",
    category: "research",
    create: () => createBoard(
      "Reading Pipeline",
      [
        sec("INBOX",          60,  60, "slate"),
        sec("THIS WEEK",      360, 60, "amber"),
        sec("KEY EXTRACTS",   660, 60, "green"),
        cit("Add your first paper here", "Various", 2024, 60, 130),
        n("How to use", "1. Add citations to Inbox.\n2. Move to This Week when reading.\n3. Extract key insights to Key Extracts.\n4. Link extracts back to your hypothesis/question nodes.", 60, 250, "amber"),
        q("What is the current state of the art in my field?", 660, 130),
        ins("First insight from reading", "Write the most important takeaway from your reading session.", 660, 250),
      ],
      [],
      "reading-pipeline",
      "Manage your reading queue and extract insights"
    ),
  },
  /* 7 — Argument Map */
  {
    id: "argument-map",
    name: "Argument Map",
    description: "Map claims, evidence, and counter-arguments for a position or debate.",
    category: "analysis",
    create: () => {
      const claim = ins("Central Claim", "State the claim or position you are mapping.", 380, 80);
      const p1 = ev("Supporting Argument 1", "First argument that supports the claim.", 80, 240);
      const p2 = ev("Supporting Argument 2", "Second argument that supports the claim.", 340, 240);
      const c1 = ev("Counter-argument 1", "First objection or counter-argument.", 600, 240, "rose");
      const c2 = ev("Counter-argument 2", "Second objection or counter-argument.", 840, 240, "rose");
      const rebuttal = n("Rebuttal", "How do you respond to the counter-arguments?", 700, 380, "amber");
      const conns: Connection[] = [
        { id: genId("c"), fromId: p1.id, toId: claim.id, label: "supports",    connType: "supports" },
        { id: genId("c"), fromId: p2.id, toId: claim.id, label: "supports",    connType: "supports" },
        { id: genId("c"), fromId: c1.id, toId: claim.id, label: "contradicts", connType: "contradicts" },
        { id: genId("c"), fromId: c2.id, toId: claim.id, label: "contradicts", connType: "contradicts" },
        { id: genId("c"), fromId: rebuttal.id, toId: c1.id, label: "responds to", connType: "related" },
        { id: genId("c"), fromId: rebuttal.id, toId: c2.id, label: "responds to", connType: "related" },
      ];
      return createBoard("Argument Map", [claim, p1, p2, c1, c2, rebuttal], conns, "argument-map", "Map claims, evidence, and counter-arguments");
    },
  },
  /* 8 — Thesis Chapter Plan */
  {
    id: "thesis-plan",
    name: "Thesis Chapter Plan",
    description: "Plan your thesis structure chapter by chapter, with goals and key content for each.",
    category: "planning",
    create: () => createBoard(
      "Thesis Chapter Plan",
      [
        sec("INTRODUCTION",    60,  60, "blue"),
        sec("LITERATURE",      360, 60, "purple"),
        sec("METHODOLOGY",     660, 60, "green"),
        sec("RESULTS",         960, 60, "amber"),
        sec("DISCUSSION",      60,  430, "teal"),
        sec("CONCLUSION",      360, 430, "slate"),
        n("Chapter 1 Goal",     "Motivate the problem. State the research gap. Outline contributions.", 60, 130, "blue"),
        n("Key papers to cite", "List the 3–5 most critical references to cover.", 60, 250, "blue"),
        n("Ch 2 Goal",          "Survey the field. Position your work relative to prior art.", 360, 130, "purple"),
        n("Coverage gaps",      "What areas is the literature weak on?", 360, 250, "purple"),
        n("Ch 3 Goal",          "Describe your methodology in reproducible detail.", 660, 130, "green"),
        n("Evaluation plan",    "Datasets, baselines, metrics.", 660, 250, "green"),
        n("Ch 4 Goal",          "Present results. Tables, figures, analysis.", 960, 130, "amber"),
        q("What is the story the results tell?", 960, 250),
        n("Ch 5 Goal",          "Interpret results. Relate back to research questions.", 60, 500, "teal"),
        n("Limitations",        "Honest assessment of scope and constraints.", 60, 620, "teal"),
        n("Ch 6 Goal",          "Summarize contributions. Future work directions.", 360, 500, "slate"),
        tsk("Draft outline by end of week", "", 660, 500),
      ],
      [],
      "thesis-plan",
      "Plan your thesis chapter by chapter"
    ),
  },
];
