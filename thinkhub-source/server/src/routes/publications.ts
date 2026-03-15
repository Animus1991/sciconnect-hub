import { Router, Request, Response } from "express";

export const publicationsRouter = Router();

const publications = [
  { id: "pub1", title: "Attention Mechanisms in Scientific Text Mining", authors: ["Dr. Alex Researcher", "Prof. Marcus Chen"], journal: "NeurIPS 2025", year: 2025, citations: 47, doi: "10.1234/neurips.2025.001", status: "published", tags: ["NLP", "Transformers", "Text Mining"], abstract: "We present a novel attention mechanism specifically designed for scientific literature analysis..." },
  { id: "pub2", title: "Federated Learning for Multi-Site Brain Imaging", authors: ["Dr. Alex Researcher", "Dr. Elena Vasquez"], journal: "Nature Methods", year: 2025, citations: 23, doi: "10.1038/nmeth.2025.042", status: "published", tags: ["Federated Learning", "Neuroimaging"], abstract: "A privacy-preserving framework for collaborative brain imaging studies across institutions..." },
  { id: "pub3", title: "Quantum-Enhanced Drug Discovery Pipelines", authors: ["Dr. Alex Researcher"], journal: "arXiv preprint", year: 2026, citations: 5, doi: "10.48550/arXiv.2026.01234", status: "preprint", tags: ["Quantum ML", "Drug Discovery"], abstract: "Exploring quantum computing advantages in molecular property prediction..." },
];

publicationsRouter.get("/", (_req: Request, res: Response) => {
  const { status, sort, q } = _req.query;
  let result = [...publications];
  if (status && typeof status === "string") result = result.filter(p => p.status === status);
  if (q && typeof q === "string") {
    const query = q.toLowerCase();
    result = result.filter(p => p.title.toLowerCase().includes(query) || p.tags.some(t => t.toLowerCase().includes(query)));
  }
  if (sort === "citations") result.sort((a, b) => b.citations - a.citations);
  if (sort === "year") result.sort((a, b) => b.year - a.year);
  res.json({ publications: result, total: result.length });
});

publicationsRouter.get("/:id", (req: Request, res: Response) => {
  const pub = publications.find(p => p.id === req.params.id);
  if (!pub) return res.status(404).json({ error: "Publication not found" });
  res.json(pub);
});

publicationsRouter.post("/", (req: Request, res: Response) => {
  const { title, journal, tags, abstract: abs } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const newPub = {
    id: `pub_${Date.now()}`,
    title,
    authors: ["Dr. Alex Researcher"],
    journal: journal || "Unpublished",
    year: new Date().getFullYear(),
    citations: 0,
    doi: "",
    status: "draft" as const,
    tags: tags || [],
    abstract: abs || "",
  };
  publications.push(newPub);
  res.status(201).json(newPub);
});

publicationsRouter.get("/stats/summary", (_req: Request, res: Response) => {
  const totalCitations = publications.reduce((sum, p) => sum + p.citations, 0);
  res.json({
    totalPublications: publications.length,
    totalCitations,
    published: publications.filter(p => p.status === "published").length,
    preprints: publications.filter(p => p.status === "preprint").length,
    drafts: publications.filter(p => p.status === "draft").length,
  });
});
