import { Router, Request, Response } from "express";

export const searchRouter = Router();

const searchableItems = [
  { type: "publication", id: "pub1", title: "Attention Mechanisms in Scientific Text Mining", subtitle: "NeurIPS 2025", tags: ["NLP", "Transformers"] },
  { type: "publication", id: "pub2", title: "Federated Learning for Multi-Site Brain Imaging", subtitle: "Nature Methods", tags: ["Federated Learning", "Neuroimaging"] },
  { type: "researcher", id: "r1", title: "Dr. Elena Vasquez", subtitle: "MIT — Cognitive Science", tags: ["Neuroscience", "fMRI"] },
  { type: "researcher", id: "r2", title: "Prof. Marcus Chen", subtitle: "Stanford — AI & ML", tags: ["Deep Learning", "NLP"] },
  { type: "project", id: "proj1", title: "Quantum-Classical Hybrid Neural Networks", subtitle: "Active — 65% progress", tags: ["Quantum ML"] },
  { type: "event", id: "evt1", title: "ICML 2026", subtitle: "Jul 19-25, 2026 — Vienna", tags: ["Conference", "ML"] },
  { type: "wiki", id: "w1", title: "Transformer Architecture Overview", subtitle: "Machine Learning", tags: ["Deep Learning", "Attention"] },
  { type: "opportunity", id: "o1", title: "NIH R01 — AI for Drug Discovery", subtitle: "Grant — $1.5M", tags: ["AI", "Funding"] },
  { type: "course", id: "c1", title: "Advanced Machine Learning for Scientific Research", subtitle: "Prof. Marcus Chen — Stanford", tags: ["ML", "Deep Learning"] },
];

searchRouter.get("/", (req: Request, res: Response) => {
  const { q, type, limit } = req.query;
  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return res.status(400).json({ error: "Query must be at least 2 characters" });
  }

  const query = q.toLowerCase();
  let results = searchableItems.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.subtitle.toLowerCase().includes(query) ||
    item.tags.some(t => t.toLowerCase().includes(query))
  );

  if (type && typeof type === "string") {
    results = results.filter(item => item.type === type);
  }

  const maxResults = limit ? Math.min(parseInt(limit as string, 10), 50) : 20;
  results = results.slice(0, maxResults);

  res.json({
    query: q,
    results,
    total: results.length,
    types: {
      publications: results.filter(r => r.type === "publication").length,
      researchers: results.filter(r => r.type === "researcher").length,
      projects: results.filter(r => r.type === "project").length,
      events: results.filter(r => r.type === "event").length,
      wiki: results.filter(r => r.type === "wiki").length,
      opportunities: results.filter(r => r.type === "opportunity").length,
      courses: results.filter(r => r.type === "course").length,
    },
  });
});

searchRouter.get("/suggestions", (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== "string") return res.json({ suggestions: [] });

  const query = q.toLowerCase();
  const allTags = [...new Set(searchableItems.flatMap(item => item.tags))];
  const suggestions = allTags.filter(tag => tag.toLowerCase().includes(query)).slice(0, 5);

  res.json({ suggestions });
});
