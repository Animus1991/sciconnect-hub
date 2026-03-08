import { Router, Request, Response } from "express";
import { z } from "zod";

export const labNotebookRouter = Router();

const protocols = [
  { id: "proto-001", title: "CRISPR-Cas13 Off-Target Detection in HEK293T Cells", category: "experimental", author: { name: "Dr. Sofia Martínez", initials: "SM" }, version: "3.2", status: "published", visibility: "public", description: "Protocol for detecting off-target effects of CRISPR-Cas13.", steps: 6, materials: 6, tags: ["CRISPR", "Cas13", "NGS"], forks: 12, stars: 34, views: 892, lastModified: "2026-03-01", collaborators: ["Dr. Elena Vasquez", "Prof. James Chen"] },
  { id: "proto-002", title: "Federated Learning Training Pipeline for Multi-Site MRI", category: "computational", author: { name: "Prof. James Chen", initials: "JC" }, version: "2.0", status: "published", visibility: "team", description: "FL pipeline for training diagnostic models.", steps: 5, materials: 5, tags: ["federated learning", "MRI"], forks: 8, stars: 21, views: 456, lastModified: "2026-02-15", collaborators: ["Dr. Elena Vasquez"] },
  { id: "proto-003", title: "Arctic Soil Core Sampling & Carbon Analysis", category: "field", author: { name: "Dr. Ingrid Nørgaard", initials: "IN" }, version: "1.1", status: "in_review", visibility: "public", description: "Field protocol for permafrost soil cores.", steps: 4, materials: 5, tags: ["permafrost", "carbon", "field work"], forks: 3, stars: 15, views: 234, lastModified: "2026-01-10", collaborators: ["Dr. Sofia Martínez"] },
];

const createProtocolSchema = z.object({
  title: z.string().min(1).max(500),
  category: z.enum(["experimental", "computational", "clinical", "field", "analytical"]),
  visibility: z.enum(["public", "private", "team"]),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(15).optional(),
});

// GET /api/protocols
labNotebookRouter.get("/", (req: Request, res: Response) => {
  const { category, status } = req.query;
  let result = [...protocols];
  if (category && typeof category === "string") result = result.filter(p => p.category === category);
  if (status && typeof status === "string") result = result.filter(p => p.status === status);
  res.json({ protocols: result, total: result.length });
});

// GET /api/protocols/:id
labNotebookRouter.get("/:id", (req: Request, res: Response) => {
  const p = protocols.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Protocol not found" });
  res.json(p);
});

// POST /api/protocols
labNotebookRouter.post("/", (req: Request, res: Response) => {
  const parsed = createProtocolSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });

  const newProto = {
    id: `proto-${String(protocols.length + 1).padStart(3, "0")}`,
    ...parsed.data,
    author: { name: "Current User", initials: "CU" },
    version: "1.0",
    status: "draft",
    description: parsed.data.description || "",
    steps: 0, materials: 0,
    tags: parsed.data.tags || [],
    forks: 0, stars: 0, views: 0,
    lastModified: new Date().toISOString().split("T")[0],
    collaborators: [],
  };
  protocols.push(newProto as any);
  res.status(201).json(newProto);
});

// POST /api/protocols/:id/fork
labNotebookRouter.post("/:id/fork", (req: Request, res: Response) => {
  const p = protocols.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Protocol not found" });
  p.forks += 1;
  res.json({ success: true, forks: p.forks });
});

// POST /api/protocols/:id/star
labNotebookRouter.post("/:id/star", (req: Request, res: Response) => {
  const p = protocols.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Protocol not found" });
  p.stars += 1;
  res.json({ success: true, stars: p.stars });
});
