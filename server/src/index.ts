import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { publicationsRouter } from "./routes/publications.js";
import { projectsRouter } from "./routes/projects.js";
import { communityRouter } from "./routes/community.js";
import { notificationsRouter } from "./routes/notifications.js";
import { analyticsRouter } from "./routes/analytics.js";
import { searchRouter } from "./routes/search.js";
import { authRouter } from "./routes/auth.js";
import { repositoriesRouter } from "./routes/repositories.js";
import { blockchainRouter } from "./routes/blockchain.js";
import type { Request, Response, NextFunction } from "express";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8080"], credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/publications", publicationsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/community", communityRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/search", searchRouter);
app.use("/api/repositories", repositoriesRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

app.listen(PORT, () => {
  console.log(`🔬 SciConnect API server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

export default app;
