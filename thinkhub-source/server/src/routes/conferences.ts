import { Router, Request, Response } from "express";
import { z } from "zod";

export const conferencesRouter = Router();

const conferences = [
  { id: "conf-001", name: "International Conference on Machine Learning", acronym: "ICML 2026", type: "conference", field: "Machine Learning", location: "Vienna, Austria", startDate: "2026-07-21", endDate: "2026-07-27", website: "https://icml.cc/2026", attendees: 6000, acceptanceRate: 24.6, isAttending: true, isPresenting: false, deadlines: [{ label: "Full Paper", date: "2026-02-06", status: "passed" }, { label: "Notification", date: "2026-05-01", status: "upcoming" }], submissions: [{ id: "sub-001", title: "Scalable Federated Learning with Differential Privacy", type: "paper", status: "under_review" }], tags: ["ML", "deep learning"] },
  { id: "conf-002", name: "Quantum Information Processing", acronym: "QIP 2026", type: "conference", field: "Quantum Computing", location: "Singapore", startDate: "2026-06-15", endDate: "2026-06-19", website: "https://qip2026.org", attendees: 800, acceptanceRate: 35, isAttending: true, isPresenting: true, deadlines: [{ label: "Poster Submission", date: "2026-03-15", status: "upcoming" }], submissions: [{ id: "sub-002", title: "Surface Code Braiding", type: "talk", status: "submitted" }], tags: ["quantum", "QIP"] },
  { id: "conf-003", name: "AGU Fall Meeting 2026", acronym: "AGU 2026", type: "conference", field: "Earth Sciences", location: "San Francisco, CA", startDate: "2026-12-14", endDate: "2026-12-18", website: "https://agu.org", attendees: 25000, isAttending: false, isPresenting: false, deadlines: [{ label: "Abstract", date: "2026-08-01", status: "upcoming" }], submissions: [], tags: ["earth science", "climate"] },
];

const createConferenceSchema = z.object({
  name: z.string().min(1).max(500),
  acronym: z.string().max(50).optional(),
  type: z.enum(["conference", "workshop", "symposium", "seminar", "webinar"]),
  field: z.string().max(200),
  location: z.string().max(300),
  startDate: z.string(),
  endDate: z.string(),
  website: z.string().url().optional(),
});

// GET /api/conferences
conferencesRouter.get("/", (req: Request, res: Response) => {
  const { type, field } = req.query;
  let result = [...conferences];
  if (type && typeof type === "string") result = result.filter(c => c.type === type);
  if (field && typeof field === "string") result = result.filter(c => c.field.toLowerCase().includes(field.toString().toLowerCase()));
  result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  res.json({ conferences: result, total: result.length });
});

// GET /api/conferences/:id
conferencesRouter.get("/:id", (req: Request, res: Response) => {
  const c = conferences.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Conference not found" });
  res.json(c);
});

// POST /api/conferences
conferencesRouter.post("/", (req: Request, res: Response) => {
  const parsed = createConferenceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });

  const newConf = {
    id: `conf-${String(conferences.length + 1).padStart(3, "0")}`,
    ...parsed.data,
    acronym: parsed.data.acronym || parsed.data.name.slice(0, 20),
    website: parsed.data.website || "",
    attendees: 0,
    isAttending: false,
    isPresenting: false,
    deadlines: [],
    submissions: [],
    tags: [],
  };
  conferences.push(newConf as any);
  res.status(201).json(newConf);
});

// POST /api/conferences/:id/submissions
conferencesRouter.post("/:id/submissions", (req: Request, res: Response) => {
  const conf = conferences.find(c => c.id === req.params.id);
  if (!conf) return res.status(404).json({ error: "Conference not found" });

  const { title, type } = req.body;
  if (!title || !type) return res.status(400).json({ error: "title and type required" });

  const newSub = { id: `sub-${Date.now()}`, title, type, status: "draft" };
  conf.submissions.push(newSub as any);
  res.status(201).json(newSub);
});

// PATCH /api/conferences/:id/attend
conferencesRouter.patch("/:id/attend", (req: Request, res: Response) => {
  const conf = conferences.find(c => c.id === req.params.id);
  if (!conf) return res.status(404).json({ error: "Conference not found" });
  conf.isAttending = !conf.isAttending;
  res.json({ isAttending: conf.isAttending });
});

// GET /api/conferences/deadlines/upcoming
conferencesRouter.get("/deadlines/upcoming", (_req: Request, res: Response) => {
  const all: any[] = [];
  conferences.forEach(conf => {
    conf.deadlines.filter(d => d.status === "upcoming").forEach(d => {
      all.push({ conferenceId: conf.id, acronym: conf.acronym, ...d });
    });
  });
  all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json({ deadlines: all, total: all.length });
});
