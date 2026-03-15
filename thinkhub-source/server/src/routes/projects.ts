import { Router, Request, Response } from "express";

export const projectsRouter = Router();

const projects = [
  { id: "proj1", title: "Quantum-Classical Hybrid Neural Networks", description: "Exploring quantum advantage in neural network architectures for drug discovery.", status: "active", progress: 65, collaborators: 4, repos: 3, deadline: "Jun 2026", tags: ["Quantum ML", "Drug Discovery"], funding: "NIH R01", createdAt: "2025-09-01" },
  { id: "proj2", title: "Open Neuroscience Data Platform", description: "Building an open-access platform for sharing neuroimaging datasets.", status: "active", progress: 40, collaborators: 7, repos: 2, deadline: "Dec 2026", tags: ["Neuroscience", "Open Science"], funding: "NSF", createdAt: "2025-06-15" },
  { id: "proj3", title: "Climate Model Ensemble Framework", description: "Developing ensemble methods for regional climate prediction.", status: "planning", progress: 15, collaborators: 3, repos: 1, deadline: "Mar 2027", tags: ["Climate", "Modeling"], funding: "EU Horizon", createdAt: "2026-01-10" },
];

projectsRouter.get("/", (_req: Request, res: Response) => {
  const { status } = _req.query;
  let result = [...projects];
  if (status && typeof status === "string") result = result.filter(p => p.status === status);
  res.json({ projects: result, total: result.length });
});

projectsRouter.get("/:id", (req: Request, res: Response) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

projectsRouter.post("/", (req: Request, res: Response) => {
  const { title, description, tags } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const newProject = {
    id: `proj_${Date.now()}`,
    title,
    description: description || "",
    status: "planning" as const,
    progress: 0,
    collaborators: 1,
    repos: 0,
    deadline: "",
    tags: tags || [],
    funding: "",
    createdAt: new Date().toISOString().split("T")[0],
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});

projectsRouter.patch("/:id", (req: Request, res: Response) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  Object.assign(project, req.body);
  res.json(project);
});

projectsRouter.get("/stats/summary", (_req: Request, res: Response) => {
  res.json({
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    planning: projects.filter(p => p.status === "planning").length,
    completed: projects.filter(p => p.status === "completed").length,
    totalCollaborators: new Set(projects.flatMap(p => Array(p.collaborators))).size,
  });
});
