import { Router, Request, Response } from "express";
import { z } from "zod";

export const fundingRouter = Router();

// ─── Mock Data ───
const grants = [
  { id: "g-001", title: "Quantum Error Correction for Scalable Computing", funder: "NSF", status: "active", amount: 450000, currency: "USD", spent: 187500, startDate: "2025-09-01", endDate: "2028-08-31", pi: "Dr. Elena Vasquez", coPIs: ["Prof. James Chen", "Dr. Yuki Tanaka"], tags: ["quantum computing", "error correction"], description: "Novel topological approaches to quantum error correction.", milestones: [{ title: "Literature review", due: "2025-12-31", status: "done" }, { title: "Prototype simulation", due: "2026-06-30", status: "in_progress" }] },
  { id: "g-002", title: "Federated Learning for Medical Imaging", funder: "NIH", status: "active", amount: 780000, currency: "USD", spent: 312000, startDate: "2025-06-01", endDate: "2028-05-31", pi: "Prof. James Chen", coPIs: ["Dr. Elena Vasquez"], tags: ["federated learning", "medical imaging"], description: "Multi-institutional federated learning framework.", milestones: [{ title: "IRB approval", due: "2025-12-31", status: "done" }, { title: "Training infra", due: "2026-06-30", status: "in_progress" }] },
  { id: "g-003", title: "Arctic Permafrost Carbon Modeling", funder: "ERC", status: "pending", amount: 1200000, currency: "EUR", spent: 0, startDate: "2026-10-01", endDate: "2031-09-30", deadline: "2026-04-15", pi: "Dr. Ingrid Nørgaard", coPIs: [], tags: ["climate", "permafrost"], description: "Comprehensive Arctic carbon feedback modeling.", milestones: [] },
];

const createGrantSchema = z.object({
  title: z.string().min(1).max(500),
  funder: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.enum(["USD", "EUR", "GBP", "CHF", "JPY"]),
  description: z.string().max(2000).optional(),
  deadline: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// GET /api/funding
fundingRouter.get("/", (_req: Request, res: Response) => {
  const active = grants.filter(g => g.status === "active");
  res.json({
    grants,
    total: grants.length,
    stats: {
      totalFunding: active.reduce((s, g) => s + g.amount, 0),
      totalSpent: active.reduce((s, g) => s + g.spent, 0),
      active: active.length,
      pending: grants.filter(g => g.status === "pending").length,
    },
  });
});

// GET /api/funding/:id
fundingRouter.get("/:id", (req: Request, res: Response) => {
  const g = grants.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: "Grant not found" });
  res.json(g);
});

// POST /api/funding
fundingRouter.post("/", (req: Request, res: Response) => {
  const parsed = createGrantSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });

  const newGrant = {
    id: `g-${String(grants.length + 1).padStart(3, "0")}`,
    ...parsed.data,
    status: "draft",
    spent: 0,
    startDate: "",
    endDate: "",
    pi: "Current User",
    coPIs: [],
    tags: parsed.data.tags || [],
    description: parsed.data.description || "",
    milestones: [],
  };
  grants.push(newGrant as any);
  res.status(201).json(newGrant);
});

// PATCH /api/funding/:id
fundingRouter.patch("/:id", (req: Request, res: Response) => {
  const g = grants.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: "Grant not found" });
  Object.assign(g, req.body);
  res.json(g);
});

// GET /api/funding/stats/summary
fundingRouter.get("/stats/summary", (_req: Request, res: Response) => {
  const active = grants.filter(g => g.status === "active");
  res.json({
    totalFunding: active.reduce((s, g) => s + g.amount, 0),
    totalSpent: active.reduce((s, g) => s + g.spent, 0),
    active: active.length,
    pending: grants.filter(g => g.status === "pending").length,
    completed: grants.filter(g => g.status === "completed").length,
  });
});
