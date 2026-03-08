import { Router, Request, Response } from "express";
import { z } from "zod";

export const citationsRouter = Router();

const citations = [
  { id: "cit-001", title: "Suppressing quantum errors by scaling a surface code logical qubit", authors: ["Google Quantum AI"], journal: "Nature", year: 2023, doi: "10.1038/s41586-022-05434-1", type: "article", tags: ["quantum computing"], collections: ["col-1"], starred: true, citedBy: 1247, dateAdded: "2025-03-15" },
  { id: "cit-002", title: "Communication-Efficient Learning of Deep Networks from Decentralized Data", authors: ["McMahan, B."], journal: "AISTATS", year: 2017, doi: "10.48550/arXiv.1602.05629", type: "conference", tags: ["federated learning"], collections: ["col-2"], starred: true, citedBy: 8934, dateAdded: "2025-01-20" },
  { id: "cit-003", title: "Attention Is All You Need", authors: ["Vaswani, A."], journal: "NeurIPS", year: 2017, doi: "10.48550/arXiv.1706.03762", type: "conference", tags: ["transformers"], collections: ["col-2", "col-5"], starred: true, citedBy: 92456, dateAdded: "2024-12-01" },
];

const collections = [
  { id: "col-1", name: "Quantum Error Correction", count: 24 },
  { id: "col-2", name: "Federated Learning", count: 18 },
  { id: "col-3", name: "CRISPR Therapeutics", count: 31 },
  { id: "col-4", name: "Climate Modeling", count: 12 },
  { id: "col-5", name: "Neuromorphic Computing", count: 9 },
];

const createCitationSchema = z.object({
  title: z.string().min(1).max(1000),
  authors: z.array(z.string().max(200)).min(1),
  journal: z.string().max(300),
  year: z.number().int().min(1900).max(2100),
  doi: z.string().max(200).optional(),
  type: z.enum(["article", "book", "conference", "preprint", "thesis", "dataset"]),
  tags: z.array(z.string().max(50)).max(15).optional(),
  collections: z.array(z.string()).optional(),
});

// GET /api/citations
citationsRouter.get("/", (req: Request, res: Response) => {
  const { collection, type, q } = req.query;
  let result = [...citations];
  if (collection && typeof collection === "string") result = result.filter(c => c.collections.includes(collection));
  if (type && typeof type === "string") result = result.filter(c => c.type === type);
  if (q && typeof q === "string") {
    const query = q.toLowerCase();
    result = result.filter(c => c.title.toLowerCase().includes(query) || c.authors.some(a => a.toLowerCase().includes(query)));
  }
  res.json({ citations: result, total: result.length });
});

// GET /api/citations/collections
citationsRouter.get("/collections", (_req: Request, res: Response) => {
  res.json({ collections });
});

// POST /api/citations
citationsRouter.post("/", (req: Request, res: Response) => {
  const parsed = createCitationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });

  const newCitation = {
    id: `cit-${String(citations.length + 1).padStart(3, "0")}`,
    ...parsed.data,
    tags: parsed.data.tags || [],
    collections: parsed.data.collections || [],
    starred: false,
    citedBy: 0,
    dateAdded: new Date().toISOString().split("T")[0],
  };
  citations.push(newCitation as any);
  res.status(201).json(newCitation);
});

// POST /api/citations/import/bibtex
citationsRouter.post("/import/bibtex", (req: Request, res: Response) => {
  const { bibtex } = req.body;
  if (!bibtex || typeof bibtex !== "string") return res.status(400).json({ error: "bibtex string required" });
  // Simulate parsing
  const entryCount = (bibtex.match(/@\w+\{/g) || []).length;
  res.json({ imported: entryCount, message: `Parsed ${entryCount} BibTeX entries` });
});

// POST /api/citations/import/doi
citationsRouter.post("/import/doi", (req: Request, res: Response) => {
  const { dois } = req.body;
  if (!Array.isArray(dois)) return res.status(400).json({ error: "dois array required" });
  // Simulate DOI resolution
  res.json({ resolved: dois.length, message: `Resolved ${dois.length} DOIs` });
});

// PATCH /api/citations/:id/star
citationsRouter.patch("/:id/star", (req: Request, res: Response) => {
  const c = citations.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Citation not found" });
  c.starred = !c.starred;
  res.json({ starred: c.starred });
});

// POST /api/citations/export/bibtex
citationsRouter.post("/export/bibtex", (req: Request, res: Response) => {
  const { ids } = req.body;
  const toExport = ids ? citations.filter(c => ids.includes(c.id)) : citations;
  // Generate mock BibTeX
  const bibtex = toExport.map(c => `@${c.type}{${c.id},\n  title={${c.title}},\n  author={${c.authors.join(" and ")}},\n  journal={${c.journal}},\n  year={${c.year}}\n}`).join("\n\n");
  res.json({ bibtex, count: toExport.length });
});
