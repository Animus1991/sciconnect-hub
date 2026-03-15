import { Router, Request, Response } from "express";

export const communityRouter = Router();

const researchers = [
  { id: "r1", name: "Dr. Elena Vasquez", institution: "MIT", field: "Cognitive Science", hIndex: 28, papers: 47, followers: 312, following: false },
  { id: "r2", name: "Prof. Marcus Chen", institution: "Stanford", field: "AI & Machine Learning", hIndex: 41, papers: 83, followers: 1240, following: true },
  { id: "r3", name: "Dr. Amara Osei", institution: "Oxford", field: "Philosophy of Science", hIndex: 15, papers: 29, followers: 178, following: false },
  { id: "r4", name: "Dr. Yuki Tanaka", institution: "University of Tokyo", field: "Computational Biology", hIndex: 33, papers: 61, followers: 892, following: false },
  { id: "r5", name: "Prof. Sofia Reyes", institution: "Universitat de Barcelona", field: "Behavioral Economics", hIndex: 22, papers: 38, followers: 445, following: false },
];

communityRouter.get("/researchers", (req: Request, res: Response) => {
  const { q, field, sort } = req.query;
  let result = [...researchers];
  if (q && typeof q === "string") {
    const query = q.toLowerCase();
    result = result.filter(r => r.name.toLowerCase().includes(query) || r.institution.toLowerCase().includes(query) || r.field.toLowerCase().includes(query));
  }
  if (field && typeof field === "string") result = result.filter(r => r.field === field);
  if (sort === "hIndex") result.sort((a, b) => b.hIndex - a.hIndex);
  else if (sort === "papers") result.sort((a, b) => b.papers - a.papers);
  else result.sort((a, b) => b.followers - a.followers);
  res.json({ researchers: result, total: result.length });
});

communityRouter.get("/researchers/:id", (req: Request, res: Response) => {
  const researcher = researchers.find(r => r.id === req.params.id);
  if (!researcher) return res.status(404).json({ error: "Researcher not found" });
  res.json(researcher);
});

communityRouter.post("/researchers/:id/follow", (req: Request, res: Response) => {
  const researcher = researchers.find(r => r.id === req.params.id);
  if (!researcher) return res.status(404).json({ error: "Researcher not found" });
  researcher.following = !researcher.following;
  if (researcher.following) researcher.followers++;
  else researcher.followers--;
  res.json({ following: researcher.following, followers: researcher.followers });
});

communityRouter.get("/stats", (_req: Request, res: Response) => {
  res.json({
    totalResearchers: researchers.length,
    following: researchers.filter(r => r.following).length,
    institutions: new Set(researchers.map(r => r.institution)).size,
    fields: new Set(researchers.map(r => r.field)).size,
  });
});
