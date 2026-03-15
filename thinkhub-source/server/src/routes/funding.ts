import { Router, Request, Response } from "express";
import { z } from "zod";

export const fundingRouter = Router();

// ─── Mock Data ───
interface GrantMilestone {
  id: string;
  title: string;
  due: string;
  status: "done" | "in_progress" | "upcoming";
  projectId?: string;
}

interface BudgetAllocation {
  projectId: string;
  projectTitle: string;
  allocated: number;
  spent: number;
}

interface Grant {
  id: string;
  title: string;
  funder: string;
  status: string;
  amount: number;
  currency: string;
  spent: number;
  startDate: string;
  endDate: string;
  deadline?: string;
  pi: string;
  coPIs: string[];
  tags: string[];
  description: string;
  milestones: GrantMilestone[];
  linkedProjects: string[];
  budgetAllocations: BudgetAllocation[];
}

const grants: Grant[] = [
  {
    id: "g-001",
    title: "Quantum Error Correction for Scalable Computing",
    funder: "NSF — National Science Foundation",
    status: "active",
    amount: 450000,
    currency: "USD",
    spent: 187500,
    startDate: "2025-09-01",
    endDate: "2028-08-31",
    pi: "Dr. Elena Vasquez",
    coPIs: ["Prof. James Chen", "Dr. Yuki Tanaka"],
    tags: ["quantum computing", "error correction", "surface codes"],
    description: "Development of novel topological approaches to quantum error correction using surface code braiding techniques.",
    linkedProjects: ["proj-001"],
    budgetAllocations: [
      { projectId: "proj-001", projectTitle: "Surface Code Braiding Simulator", allocated: 280000, spent: 142000 },
      { projectId: "proj-002", projectTitle: "Noise Model Calibration Tool", allocated: 170000, spent: 45500 },
    ],
    milestones: [
      { id: "m-001", title: "Literature review & baseline", due: "2025-12-31", status: "done", projectId: "proj-001" },
      { id: "m-002", title: "Prototype simulation framework", due: "2026-06-30", status: "in_progress", projectId: "proj-001" },
      { id: "m-003", title: "Experimental validation", due: "2027-06-30", status: "upcoming", projectId: "proj-002" },
      { id: "m-004", title: "Final report & publication", due: "2028-06-30", status: "upcoming" },
    ],
  },
  {
    id: "g-002",
    title: "Federated Learning for Privacy-Preserving Medical Imaging",
    funder: "NIH — National Institutes of Health",
    status: "active",
    amount: 780000,
    currency: "USD",
    spent: 312000,
    startDate: "2025-06-01",
    endDate: "2028-05-31",
    pi: "Prof. James Chen",
    coPIs: ["Dr. Elena Vasquez"],
    tags: ["federated learning", "medical imaging", "privacy"],
    description: "Multi-institutional federated learning framework for training diagnostic models without sharing patient data.",
    linkedProjects: ["proj-003"],
    budgetAllocations: [
      { projectId: "proj-003", projectTitle: "FL Training Pipeline", allocated: 500000, spent: 230000 },
      { projectId: "proj-004", projectTitle: "Privacy Audit Module", allocated: 280000, spent: 82000 },
    ],
    milestones: [
      { id: "m-005", title: "Protocol design & IRB approval", due: "2025-12-31", status: "done", projectId: "proj-003" },
      { id: "m-006", title: "Distributed training infrastructure", due: "2026-06-30", status: "in_progress", projectId: "proj-003" },
      { id: "m-007", title: "Clinical validation study", due: "2027-12-31", status: "upcoming", projectId: "proj-004" },
      { id: "m-008", title: "Open-source release", due: "2028-03-31", status: "upcoming" },
    ],
  },
  {
    id: "g-003",
    title: "Arctic Permafrost Carbon Feedback Modeling",
    funder: "ERC — European Research Council",
    status: "pending",
    amount: 1200000,
    currency: "EUR",
    spent: 0,
    startDate: "2026-10-01",
    endDate: "2031-09-30",
    deadline: "2026-04-15",
    pi: "Dr. Ingrid Nørgaard",
    coPIs: ["Dr. Sofia Martínez", "Prof. Amir Khalil"],
    tags: ["climate science", "permafrost", "carbon cycle", "modeling"],
    description: "Comprehensive modeling framework for Arctic permafrost carbon feedback loops under various warming scenarios.",
    linkedProjects: [],
    budgetAllocations: [],
    milestones: [],
  },
  {
    id: "g-004",
    title: "CRISPR-Cas13 Therapeutic Development Grant",
    funder: "Wellcome Trust",
    status: "completed",
    amount: 350000,
    currency: "GBP",
    spent: 348200,
    startDate: "2023-01-01",
    endDate: "2025-12-31",
    pi: "Dr. Sofia Martínez",
    coPIs: [],
    tags: ["CRISPR", "gene therapy", "molecular biology"],
    description: "Development and preclinical validation of CRISPR-Cas13 based therapeutic approaches for viral infections.",
    linkedProjects: ["proj-005"],
    budgetAllocations: [
      { projectId: "proj-005", projectTitle: "Cas13 Off-Target Profiling", allocated: 350000, spent: 348200 },
    ],
    milestones: [
      { id: "m-009", title: "Target validation", due: "2023-06-30", status: "done", projectId: "proj-005" },
      { id: "m-010", title: "In vitro efficacy", due: "2024-06-30", status: "done", projectId: "proj-005" },
      { id: "m-011", title: "Animal model studies", due: "2025-06-30", status: "done" },
      { id: "m-012", title: "Publication & data sharing", due: "2025-12-31", status: "done" },
    ],
  },
  {
    id: "g-005",
    title: "Neuromorphic Computing for Edge AI Applications",
    funder: "DARPA",
    status: "draft",
    amount: 950000,
    currency: "USD",
    spent: 0,
    startDate: "2027-01-01",
    endDate: "2029-12-31",
    deadline: "2026-05-30",
    pi: "Dr. Elena Vasquez",
    coPIs: ["Dr. Yuki Tanaka"],
    tags: ["neuromorphic", "edge computing", "AI"],
    description: "Design of brain-inspired computing architectures for ultra-low-power AI inference at the edge.",
    linkedProjects: [],
    budgetAllocations: [],
    milestones: [],
  },
  {
    id: "g-006",
    title: "Multi-Omics Data Integration for Precision Medicine",
    funder: "Chan Zuckerberg Initiative",
    status: "rejected",
    amount: 500000,
    currency: "USD",
    spent: 0,
    startDate: "",
    endDate: "",
    pi: "Prof. Amir Khalil",
    coPIs: ["Prof. James Chen"],
    tags: ["multi-omics", "precision medicine", "bioinformatics"],
    description: "Novel statistical framework for integrating genomics, proteomics, and metabolomics data for personalized treatment.",
    linkedProjects: [],
    budgetAllocations: [],
    milestones: [],
  },
];

const createGrantSchema = z.object({
  title: z.string().min(1).max(500),
  funder: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.enum(["USD", "EUR", "GBP", "CHF", "JPY"]),
  description: z.string().max(2000).optional(),
  deadline: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  linkedProjects: z.array(z.string()).optional(),
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
      upcomingDeadlines: grants.filter(g => g.deadline && new Date(g.deadline) > new Date()).length,
    },
  });
});

// GET /api/funding/stats/summary — MUST be before /:id
fundingRouter.get("/stats/summary", (_req: Request, res: Response) => {
  const active = grants.filter(g => g.status === "active");
  const allAllocations = grants.flatMap(g => g.budgetAllocations);
  res.json({
    totalFunding: active.reduce((s, g) => s + g.amount, 0),
    totalSpent: active.reduce((s, g) => s + g.spent, 0),
    totalAllocated: allAllocations.reduce((s, a) => s + a.allocated, 0),
    active: active.length,
    pending: grants.filter(g => g.status === "pending").length,
    completed: grants.filter(g => g.status === "completed").length,
    linkedProjects: new Set(grants.flatMap(g => g.linkedProjects)).size,
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

  const newGrant: Grant = {
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
    linkedProjects: parsed.data.linkedProjects || [],
    budgetAllocations: [],
  };
  grants.push(newGrant);
  res.status(201).json(newGrant);
});

// PATCH /api/funding/:id
fundingRouter.patch("/:id", (req: Request, res: Response) => {
  const g = grants.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: "Grant not found" });
  Object.assign(g, req.body);
  res.json(g);
});

// POST /api/funding/:id/link-project
fundingRouter.post("/:id/link-project", (req: Request, res: Response) => {
  const g = grants.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: "Grant not found" });
  const { projectId, projectTitle, allocated } = req.body;
  if (!projectId) return res.status(400).json({ error: "projectId required" });
  if (!g.linkedProjects.includes(projectId)) g.linkedProjects.push(projectId);
  g.budgetAllocations.push({ projectId, projectTitle: projectTitle || projectId, allocated: allocated || 0, spent: 0 });
  res.json(g);
});

// DELETE /api/funding/:id/link-project/:projectId
fundingRouter.delete("/:id/link-project/:projectId", (req: Request, res: Response) => {
  const g = grants.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: "Grant not found" });
  g.linkedProjects = g.linkedProjects.filter(p => p !== req.params.projectId);
  g.budgetAllocations = g.budgetAllocations.filter(a => a.projectId !== req.params.projectId);
  res.json(g);
});

// POST /api/funding/:id/milestones
fundingRouter.post("/:id/milestones", (req: Request, res: Response) => {
  const g = grants.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: "Grant not found" });
  const milestone: GrantMilestone = {
    id: `m-${Date.now()}`,
    title: req.body.title,
    due: req.body.due,
    status: req.body.status || "upcoming",
    projectId: req.body.projectId,
  };
  g.milestones.push(milestone);
  res.status(201).json(milestone);
});

// PATCH /api/funding/:grantId/milestones/:milestoneId
fundingRouter.patch("/:grantId/milestones/:milestoneId", (req: Request, res: Response) => {
  const g = grants.find(x => x.id === req.params.grantId);
  if (!g) return res.status(404).json({ error: "Grant not found" });
  const m = g.milestones.find(x => x.id === req.params.milestoneId);
  if (!m) return res.status(404).json({ error: "Milestone not found" });
  Object.assign(m, req.body);
  res.json(m);
});
