import { Router, Request, Response } from "express";

export const notificationsRouter = Router();

const notifications = [
  { id: "n1", type: "citation", title: "Your paper was cited", message: "Dr. Elena Vasquez cited your paper 'Attention Mechanisms in Scientific Text Mining'", read: false, createdAt: "2026-03-06T14:30:00Z" },
  { id: "n2", type: "review", title: "Review request", message: "You have been invited to review a manuscript for Nature Methods", read: false, createdAt: "2026-03-06T10:00:00Z" },
  { id: "n3", type: "social", title: "New follower", message: "Prof. Sofia Reyes started following you", read: true, createdAt: "2026-03-05T18:00:00Z" },
  { id: "n4", type: "citation", title: "Milestone reached", message: "Your paper 'Federated Learning for Brain Imaging' reached 20 citations", read: false, createdAt: "2026-03-04T09:00:00Z" },
  { id: "n5", type: "social", title: "Collaboration request", message: "Dr. Yuki Tanaka invited you to collaborate on 'Quantum Biology'", read: true, createdAt: "2026-03-03T12:00:00Z" },
];

notificationsRouter.get("/", (req: Request, res: Response) => {
  const { type, unread } = req.query;
  let result = [...notifications];
  if (type && typeof type === "string") result = result.filter(n => n.type === type);
  if (unread === "true") result = result.filter(n => !n.read);
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ notifications: result, total: result.length, unread: result.filter(n => !n.read).length });
});

notificationsRouter.patch("/:id/read", (req: Request, res: Response) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: "Notification not found" });
  notif.read = true;
  res.json(notif);
});

notificationsRouter.post("/mark-all-read", (_req: Request, res: Response) => {
  notifications.forEach(n => { n.read = true; });
  res.json({ success: true, markedRead: notifications.length });
});

notificationsRouter.delete("/:id", (req: Request, res: Response) => {
  const idx = notifications.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Notification not found" });
  notifications.splice(idx, 1);
  res.json({ success: true });
});

notificationsRouter.get("/count", (_req: Request, res: Response) => {
  res.json({ total: notifications.length, unread: notifications.filter(n => !n.read).length });
});
