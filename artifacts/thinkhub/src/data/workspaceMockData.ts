export type DocType = "research" | "notes" | "outline" | "literature" | "mentor" | "minutes" | "free";
export type SheetType = "literature" | "comparison" | "hypothesis" | "pipeline" | "milestone" | "extraction" | "free";
export type CellType = "text" | "number" | "date" | "status" | "url" | "percent";

export interface WorkspaceDocument {
  id: string;
  title: string;
  type: DocType;
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  pinned: boolean;
  tags: string[];
}

export interface SheetColumn {
  id: string;
  name: string;
  type: CellType;
  width: number;
}

export interface SheetRow {
  id: string;
  cells: Record<string, string>;
}

export interface WorkspaceSheet {
  id: string;
  title: string;
  type: SheetType;
  columns: SheetColumn[];
  rows: SheetRow[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  tags: string[];
}

export const DOC_TYPE_META: Record<DocType, { label: string; color: string; description: string }> = {
  research:   { label: "Research Draft",     color: "text-blue-400",   description: "Full-length research writing" },
  notes:      { label: "Research Notes",     color: "text-emerald-400",description: "Structured research notes" },
  outline:    { label: "Outline",            color: "text-violet-400", description: "Document outline & structure" },
  literature: { label: "Literature Review",  color: "text-amber-400",  description: "Critical review of literature" },
  mentor:     { label: "Mentor Prep",        color: "text-rose-400",   description: "Advisor meeting preparation" },
  minutes:    { label: "Meeting Minutes",    color: "text-sky-400",    description: "Structured meeting notes" },
  free:       { label: "Free Form",          color: "text-muted-foreground", description: "General purpose document" },
};

export const SHEET_TYPE_META: Record<SheetType, { label: string; color: string; description: string }> = {
  literature:  { label: "Literature Matrix",    color: "text-blue-400",   description: "Compare papers & sources" },
  comparison:  { label: "Comparison Table",     color: "text-violet-400", description: "Side-by-side comparison" },
  hypothesis:  { label: "Hypothesis Tracker",   color: "text-emerald-400",description: "Claims & evidence log" },
  pipeline:    { label: "Research Pipeline",    color: "text-amber-400",  description: "Track research progress" },
  milestone:   { label: "Milestone Tracker",    color: "text-rose-400",   description: "Project goals & deadlines" },
  extraction:  { label: "Data Extraction",      color: "text-sky-400",    description: "Extract structured data" },
  free:        { label: "Free Form Sheet",      color: "text-muted-foreground", description: "General purpose table" },
};

export const DOC_TEMPLATES: Array<{ type: DocType; title: string; content: string }> = [
  {
    type: "research",
    title: "Research Draft",
    content: `<h1>Research Draft</h1><h2>Abstract</h2><p>Provide a concise summary of the research question, methods, key findings, and implications.</p><h2>Introduction</h2><p>Introduce the problem, context, and research gap. State the research question and objectives clearly.</p><h2>Literature Review</h2><p>Summarize and critically evaluate the existing body of knowledge relevant to your research question.</p><h2>Methodology</h2><p>Describe the research design, data collection methods, and analytical approach.</p><h2>Results</h2><p>Present the key findings from your analysis. Use tables or figures where appropriate.</p><h2>Discussion</h2><p>Interpret your findings in the context of existing literature. Address limitations.</p><h2>Conclusion</h2><p>Summarize the key contributions and propose directions for future research.</p><h2>References</h2><ul><li>Author, A. (Year). Title of work. <em>Journal Name, Volume</em>(Issue), pages.</li></ul>`,
  },
  {
    type: "literature",
    title: "Literature Review",
    content: `<h1>Literature Review</h1><h2>Overview</h2><p>Describe the scope of this literature review: topic, date range, databases searched, inclusion/exclusion criteria.</p><h2>Thematic Areas</h2><h3>Theme 1: [Name]</h3><p>Summarize the key papers and their contributions. Note patterns, agreements, contradictions.</p><h3>Theme 2: [Name]</h3><p>Summarize this thematic cluster.</p><h2>Synthesis</h2><p>Draw together the themes. Where does the consensus lie? What remains contested?</p><h2>Research Gaps</h2><ul><li>Gap 1: …</li><li>Gap 2: …</li><li>Gap 3: …</li></ul><h2>Bibliography</h2><p>List all cited works in your preferred citation style.</p>`,
  },
  {
    type: "mentor",
    title: "Advisor Meeting Prep",
    content: `<h1>Advisor Meeting — Preparation Sheet</h1><p><strong>Date:</strong> </p><p><strong>Meeting with:</strong> </p><p><strong>Duration:</strong> </p><h2>Progress Since Last Meeting</h2><ul><li>…</li><li>…</li></ul><h2>Current Blockers / Challenges</h2><ul><li>…</li><li>…</li></ul><h2>Questions for Advisor</h2><ol><li>…</li><li>…</li><li>…</li></ol><h2>Next Steps Proposed</h2><ul><li>…</li></ul><h2>Resources Needed</h2><ul><li>…</li></ul><h2>Notes from Meeting</h2><p><em>(Fill during / after meeting)</em></p>`,
  },
  {
    type: "minutes",
    title: "Meeting Minutes",
    content: `<h1>Meeting Minutes</h1><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><p><strong>Facilitator:</strong> </p><p><strong>Note-taker:</strong> </p><h2>Agenda Items</h2><ol><li>…</li><li>…</li></ol><h2>Discussion</h2><h3>Item 1</h3><p>Summary of discussion…</p><h2>Decisions Made</h2><ul><li>…</li></ul><h2>Action Items</h2><ul><li><strong>[Name]</strong> — Task — Due: …</li></ul><h2>Next Meeting</h2><p><strong>Date:</strong> </p>`,
  },
  {
    type: "notes",
    title: "Research Notes",
    content: `<h1>Research Notes</h1><p><strong>Topic:</strong> </p><p><strong>Date:</strong> </p><p><strong>Source / Context:</strong> </p><h2>Key Points</h2><ul><li>…</li><li>…</li></ul><h2>Observations & Insights</h2><p>…</p><h2>Quotes Worth Keeping</h2><blockquote><p>"…" — Author, Year, p. X</p></blockquote><h2>Open Questions</h2><ul><li>…</li></ul><h2>Connections to Other Work</h2><ul><li>…</li></ul>`,
  },
  {
    type: "outline",
    title: "Document Outline",
    content: `<h1>Document Outline</h1><h2>I. Introduction</h2><ul><li>Background</li><li>Problem statement</li><li>Objectives</li><li>Scope</li></ul><h2>II. Section Two</h2><ul><li>Subsection A</li><li>Subsection B</li></ul><h2>III. Section Three</h2><ul><li>Subsection A</li><li>Subsection B</li></ul><h2>IV. Conclusion</h2><ul><li>Summary</li><li>Contributions</li><li>Future work</li></ul>`,
  },
];

export const SHEET_TEMPLATES: Array<{ type: SheetType; title: string; columns: SheetColumn[]; rows: SheetRow[] }> = [
  {
    type: "literature",
    title: "Literature Matrix",
    columns: [
      { id: "c1", name: "Author(s)", type: "text", width: 160 },
      { id: "c2", name: "Year", type: "number", width: 70 },
      { id: "c3", name: "Title", type: "text", width: 240 },
      { id: "c4", name: "Journal", type: "text", width: 160 },
      { id: "c5", name: "Method", type: "text", width: 120 },
      { id: "c6", name: "Key Finding", type: "text", width: 200 },
      { id: "c7", name: "Relevance", type: "status", width: 100 },
      { id: "c8", name: "Notes", type: "text", width: 200 },
    ],
    rows: [
      { id: "r1", cells: { c1: "Smith, J. et al.", c2: "2023", c3: "Attention mechanisms in modern transformers", c4: "Nature AI", c5: "Empirical", c6: "Improved attention convergence by 34%", c7: "High", c8: "Core reference for chapter 2" } },
      { id: "r2", cells: { c1: "García, M.", c2: "2022", c3: "Reproducibility in computational biology", c4: "PLOS ONE", c5: "Meta-analysis", c6: "Only 52% of studies reproducible", c7: "High", c8: "Use in intro for motivation" } },
      { id: "r3", cells: { c1: "", c2: "", c3: "", c4: "", c5: "", c6: "", c7: "", c8: "" } },
    ],
  },
  {
    type: "hypothesis",
    title: "Hypothesis Tracker",
    columns: [
      { id: "c1", name: "Hypothesis", type: "text", width: 260 },
      { id: "c2", name: "Status", type: "status", width: 110 },
      { id: "c3", name: "Evidence For", type: "text", width: 200 },
      { id: "c4", name: "Evidence Against", type: "text", width: 200 },
      { id: "c5", name: "Confidence", type: "percent", width: 100 },
      { id: "c6", name: "Next Step", type: "text", width: 200 },
    ],
    rows: [
      { id: "r1", cells: { c1: "Increased model depth improves generalization on out-of-distribution data", c2: "Testing", c3: "Preliminary results on benchmark A", c4: "Counter-example in dataset B", c5: "60", c6: "Run controlled ablation study" } },
      { id: "r2", cells: { c1: "Regularization reduces overfitting more than early stopping alone", c2: "Supported", c3: "3 replicated experiments", c4: "", c5: "85", c6: "Write up results" } },
      { id: "r3", cells: { c1: "", c2: "", c3: "", c4: "", c5: "", c6: "" } },
    ],
  },
  {
    type: "milestone",
    title: "Milestone Tracker",
    columns: [
      { id: "c1", name: "Milestone", type: "text", width: 220 },
      { id: "c2", name: "Due Date", type: "date", width: 120 },
      { id: "c3", name: "Status", type: "status", width: 110 },
      { id: "c4", name: "Owner", type: "text", width: 130 },
      { id: "c5", name: "Progress", type: "percent", width: 90 },
      { id: "c6", name: "Notes", type: "text", width: 220 },
    ],
    rows: [
      { id: "r1", cells: { c1: "Complete literature review", c2: "2026-03-31", c3: "In Progress", c4: "Dr. Researcher", c5: "70", c6: "Need 5 more papers on topic B" } },
      { id: "r2", cells: { c1: "Submit to conference", c2: "2026-05-15", c3: "Not Started", c4: "Dr. Researcher", c5: "0", c6: "NeurIPS deadline" } },
      { id: "r3", cells: { c1: "Final dissertation submission", c2: "2026-09-01", c3: "Not Started", c4: "Dr. Researcher", c5: "0", c6: "" } },
    ],
  },
  {
    type: "comparison",
    title: "Researcher Comparison",
    columns: [
      { id: "c1", name: "Criterion", type: "text", width: 200 },
      { id: "c2", name: "Option A", type: "text", width: 200 },
      { id: "c3", name: "Option B", type: "text", width: 200 },
      { id: "c4", name: "Option C", type: "text", width: 200 },
      { id: "c5", name: "Notes", type: "text", width: 180 },
    ],
    rows: [
      { id: "r1", cells: { c1: "Research focus", c2: "", c3: "", c4: "", c5: "" } },
      { id: "r2", cells: { c1: "Publication record", c2: "", c3: "", c4: "", c5: "" } },
      { id: "r3", cells: { c1: "Methodology expertise", c2: "", c3: "", c4: "", c5: "" } },
      { id: "r4", cells: { c1: "Lab resources", c2: "", c3: "", c4: "", c5: "" } },
      { id: "r5", cells: { c1: "Mentoring style", c2: "", c3: "", c4: "", c5: "" } },
    ],
  },
];

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function createBlankDocument(type: DocType = "free"): WorkspaceDocument {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: "Untitled Document",
    type,
    content: "<p></p>",
    createdAt: now,
    updatedAt: now,
    wordCount: 0,
    pinned: false,
    tags: [],
  };
}

export function createBlankSheet(type: SheetType = "free"): WorkspaceSheet {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: "Untitled Sheet",
    type,
    columns: [
      { id: "c1", name: "Column A", type: "text", width: 200 },
      { id: "c2", name: "Column B", type: "text", width: 200 },
      { id: "c3", name: "Column C", type: "text", width: 200 },
    ],
    rows: [
      { id: generateId(), cells: { c1: "", c2: "", c3: "" } },
      { id: generateId(), cells: { c1: "", c2: "", c3: "" } },
      { id: generateId(), cells: { c1: "", c2: "", c3: "" } },
    ],
    createdAt: now,
    updatedAt: now,
    pinned: false,
    tags: [],
  };
}

export function createFromDocTemplate(template: typeof DOC_TEMPLATES[number]): WorkspaceDocument {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: template.title,
    type: template.type,
    content: template.content,
    createdAt: now,
    updatedAt: now,
    wordCount: template.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length,
    pinned: false,
    tags: [],
  };
}

export function createFromSheetTemplate(template: typeof SHEET_TEMPLATES[number]): WorkspaceSheet {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: template.title,
    type: template.type,
    columns: template.columns.map(c => ({ ...c })),
    rows: template.rows.map(r => ({ ...r, id: generateId() })),
    createdAt: now,
    updatedAt: now,
    pinned: false,
    tags: [],
  };
}

export const SEED_DOCUMENTS: WorkspaceDocument[] = [
  {
    id: "doc-seed-1",
    title: "Attention Mechanisms — Literature Review",
    type: "literature",
    content: `<h1>Attention Mechanisms — Literature Review</h1><h2>Overview</h2><p>This review covers recent advances in attention mechanisms in deep learning, with focus on transformer architectures and their application to scientific data.</p><h2>Key Papers</h2><h3>Vaswani et al. (2017) — Attention Is All You Need</h3><p>Introduced the transformer architecture, replacing recurrent networks with self-attention for sequence-to-sequence tasks. Established the foundation for modern large language models.</p><h3>Dosovitskiy et al. (2020) — ViT</h3><p>Extended attention mechanisms to computer vision through patch-based image tokenization. Showed competitive performance to CNNs at scale.</p><h2>Synthesis</h2><p>The consensus across 40+ reviewed papers is that attention-based models consistently outperform recurrent baselines when sufficient training data is available. Key open questions remain around efficiency at extreme sequence lengths and interpretability.</p><h2>Research Gaps</h2><ul><li>Efficient attention for sequences &gt; 100K tokens in scientific documents</li><li>Grounded scientific reasoning vs. statistical pattern matching</li></ul>`,
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-18T14:30:00Z",
    wordCount: 142,
    pinned: true,
    tags: ["transformers", "attention", "deep learning"],
  },
  {
    id: "doc-seed-2",
    title: "NeurIPS 2026 — Advisor Meeting Prep",
    type: "mentor",
    content: `<h1>Advisor Meeting — March 25, 2026</h1><p><strong>Date:</strong> March 25, 2026</p><p><strong>Meeting with:</strong> Prof. James Liu</p><p><strong>Duration:</strong> 60 min</p><h2>Progress Since Last Meeting</h2><ul><li>Completed ablation study on 3 regularization strategies</li><li>Submitted abstract to NeurIPS workshop track</li><li>Finished collecting dataset B (n=2,400 samples)</li></ul><h2>Current Blockers</h2><ul><li>GPU access for full model training (need cluster approval)</li><li>Uncertainty about whether to submit to main track or workshop</li></ul><h2>Questions for Advisor</h2><ol><li>Should we prioritize novelty or empirical rigor for the NeurIPS submission?</li><li>Can you review the methodology section before April 1st?</li><li>Recommendation for co-authors?</li></ol><h2>Next Steps</h2><ul><li>Write methods section draft by March 28</li><li>Schedule GPU cluster access</li></ul>`,
    createdAt: "2026-03-19T08:00:00Z",
    updatedAt: "2026-03-20T11:15:00Z",
    wordCount: 118,
    pinned: false,
    tags: ["NeurIPS", "advisor", "submission"],
  },
  {
    id: "doc-seed-3",
    title: "Research Pipeline — Weekly Notes",
    type: "notes",
    content: `<h1>Research Notes — Week of March 18, 2026</h1><p><strong>Topic:</strong> Reproducibility in neural network training</p><p><strong>Date:</strong> March 18–22, 2026</p><h2>Key Points</h2><ul><li>Found 3 new relevant papers from ICLR 2026 on training stability</li><li>Seed randomness is major hidden variable — must control for this in all experiments</li><li>Dataset B has 2.3% label noise — need to decide how to handle</li></ul><h2>Observations</h2><p>The variance in results between identical runs is higher than expected (~8%). This is likely due to GPU non-determinism with cuDNN. Need to fix random seeds globally.</p><h2>Open Questions</h2><ul><li>Is 8% variance acceptable in published results?</li><li>Should we report mean ± std across 5 runs?</li></ul><h2>Connections</h2><ul><li>Links to Garcia (2022) on reproducibility — cite in intro</li><li>Relevant to ongoing peer review work in platform</li></ul>`,
    createdAt: "2026-03-18T16:00:00Z",
    updatedAt: "2026-03-21T09:45:00Z",
    wordCount: 133,
    pinned: false,
    tags: ["reproducibility", "weekly notes"],
  },
];

export const SEED_SHEETS: WorkspaceSheet[] = [
  {
    id: "sheet-seed-1",
    title: "Paper Review Matrix — Transformers",
    type: "literature",
    columns: [
      { id: "c1", name: "Author(s)", type: "text", width: 150 },
      { id: "c2", name: "Year", type: "number", width: 70 },
      { id: "c3", name: "Title", type: "text", width: 220 },
      { id: "c4", name: "Venue", type: "text", width: 120 },
      { id: "c5", name: "Method", type: "text", width: 120 },
      { id: "c6", name: "Result / Finding", type: "text", width: 200 },
      { id: "c7", name: "Relevance", type: "status", width: 100 },
      { id: "c8", name: "Notes", type: "text", width: 180 },
    ],
    rows: [
      { id: "sr1", cells: { c1: "Vaswani et al.", c2: "2017", c3: "Attention Is All You Need", c4: "NeurIPS", c5: "Self-attention", c6: "BLEU 28.4 on WMT14 EN-DE", c7: "High", c8: "Foundational — cite in every section" } },
      { id: "sr2", cells: { c1: "Dosovitskiy et al.", c2: "2020", c3: "An Image is Worth 16x16 Words", c4: "ICLR", c5: "Patch tokenization", c6: "Matches CNNs at scale", c7: "High", c8: "Vision extension — good for background" } },
      { id: "sr3", cells: { c1: "Liu et al.", c2: "2021", c3: "Swin Transformer", c4: "ICCV", c5: "Hierarchical attention", c6: "SOTA on ImageNet-1K", c7: "Medium", c8: "Check if relevant to our domain" } },
      { id: "sr4", cells: { c1: "Brown et al.", c2: "2020", c3: "Language Models are Few-Shot Learners", c4: "NeurIPS", c5: "Scaling + prompting", c6: "GPT-3 175B few-shot SOTA", c7: "High", c8: "Essential context for scale discussion" } },
      { id: "sr5", cells: { c1: "", c2: "", c3: "", c4: "", c5: "", c6: "", c7: "", c8: "" } },
    ],
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-20T15:00:00Z",
    pinned: true,
    tags: ["transformers", "literature"],
  },
  {
    id: "sheet-seed-2",
    title: "Dissertation Milestones",
    type: "milestone",
    columns: [
      { id: "c1", name: "Milestone", type: "text", width: 240 },
      { id: "c2", name: "Due Date", type: "date", width: 120 },
      { id: "c3", name: "Status", type: "status", width: 120 },
      { id: "c4", name: "Progress", type: "percent", width: 90 },
      { id: "c5", name: "Notes", type: "text", width: 220 },
    ],
    rows: [
      { id: "sr1", cells: { c1: "Complete literature review", c2: "2026-03-31", c3: "In Progress", c4: "70", c5: "5 more papers needed" } },
      { id: "sr2", cells: { c1: "Run all ablation experiments", c2: "2026-04-30", c3: "In Progress", c4: "35", c5: "Blocked by GPU access" } },
      { id: "sr3", cells: { c1: "Write chapters 1–3", c2: "2026-06-01", c3: "Not Started", c4: "0", c5: "" } },
      { id: "sr4", cells: { c1: "Submit to NeurIPS", c2: "2026-05-15", c3: "In Progress", c4: "20", c5: "Abstract accepted" } },
      { id: "sr5", cells: { c1: "Final defense preparation", c2: "2026-09-01", c3: "Not Started", c4: "0", c5: "" } },
    ],
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-03-19T10:30:00Z",
    pinned: false,
    tags: ["dissertation", "milestones"],
  },
];
