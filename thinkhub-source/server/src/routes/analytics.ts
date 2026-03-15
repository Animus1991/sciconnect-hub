import { Router, Request, Response } from "express";

export const analyticsRouter = Router();

const monthlyData = [
  { month: "Jul", citations: 12, reads: 340, downloads: 89 },
  { month: "Aug", citations: 18, reads: 420, downloads: 102 },
  { month: "Sep", citations: 15, reads: 380, downloads: 95 },
  { month: "Oct", citations: 22, reads: 510, downloads: 134 },
  { month: "Nov", citations: 28, reads: 620, downloads: 167 },
  { month: "Dec", citations: 35, reads: 780, downloads: 201 },
  { month: "Jan", citations: 31, reads: 690, downloads: 189 },
  { month: "Feb", citations: 42, reads: 890, downloads: 245 },
  { month: "Mar", citations: 48, reads: 1020, downloads: 278 },
];

analyticsRouter.get("/overview", (_req: Request, res: Response) => {
  const totalCitations = monthlyData.reduce((sum, m) => sum + m.citations, 0);
  const totalReads = monthlyData.reduce((sum, m) => sum + m.reads, 0);
  const totalDownloads = monthlyData.reduce((sum, m) => sum + m.downloads, 0);
  res.json({
    kpis: {
      totalCitations,
      hIndex: 19,
      totalReads,
      totalDownloads,
      collaborators: 31,
      publications: 24,
      globalRank: 847,
    },
    trends: {
      citationGrowth: "+28%",
      readGrowth: "+34%",
      downloadGrowth: "+22%",
    },
  });
});

analyticsRouter.get("/monthly", (req: Request, res: Response) => {
  const { months } = req.query;
  const limit = months ? parseInt(months as string, 10) : 9;
  res.json({ data: monthlyData.slice(-limit) });
});

analyticsRouter.get("/field-distribution", (_req: Request, res: Response) => {
  res.json({
    distribution: [
      { name: "Machine Learning", value: 42, color: "#8b5cf6" },
      { name: "Neuroscience", value: 28, color: "#ec4899" },
      { name: "Climate Science", value: 15, color: "#10b981" },
      { name: "Quantum Computing", value: 10, color: "#f59e0b" },
      { name: "Other", value: 5, color: "#6b7280" },
    ],
  });
});

analyticsRouter.get("/collaborations", (_req: Request, res: Response) => {
  res.json({
    countries: [
      { country: "USA", collaborators: 12, papers: 8 },
      { country: "UK", collaborators: 7, papers: 5 },
      { country: "Germany", collaborators: 5, papers: 3 },
      { country: "Japan", collaborators: 4, papers: 2 },
      { country: "Canada", collaborators: 3, papers: 2 },
    ],
  });
});

analyticsRouter.get("/achievements", (_req: Request, res: Response) => {
  res.json({
    achievements: [
      { icon: "trophy", label: "h-index crossed 19", time: "This month" },
      { icon: "paper", label: "100th citation on LLM paper", time: "2 weeks ago" },
      { icon: "globe", label: "5th international collaboration", time: "Last month" },
      { icon: "star", label: "Top 5% in your field", time: "Q1 2026" },
      { icon: "chart", label: "1000+ monthly paper reads", time: "Mar 2026" },
    ],
  });
});
