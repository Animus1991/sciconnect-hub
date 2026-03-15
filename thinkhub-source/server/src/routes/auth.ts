import { Router } from "express";
import { z } from "zod";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  institution: z.string().optional(),
  field: z.string().optional(),
});

// Mock user store
const users = new Map<string, { id: string; email: string; name: string; institution: string; field: string; hIndex: number; publications: number; citations: number }>();

// Seed a demo user
users.set("demo@sciconnect.org", {
  id: "usr_demo",
  email: "demo@sciconnect.org",
  name: "Dr. Alex Researcher",
  institution: "MIT",
  field: "Machine Learning",
  hIndex: 19,
  publications: 24,
  citations: 1247,
});

authRouter.post("/login", (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Invalid input", details: result.error.flatten() });

  const user = users.get(result.data.email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ token: `tok_${Date.now()}`, user });
});

authRouter.post("/register", (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Invalid input", details: result.error.flatten() });

  if (users.has(result.data.email)) return res.status(409).json({ error: "Email already registered" });

  const newUser = {
    id: `usr_${Date.now()}`,
    email: result.data.email,
    name: result.data.name,
    institution: result.data.institution || "",
    field: result.data.field || "",
    hIndex: 0,
    publications: 0,
    citations: 0,
  };
  users.set(result.data.email, newUser);
  res.status(201).json({ token: `tok_${Date.now()}`, user: newUser });
});

authRouter.get("/me", (req, res) => {
  // In production, verify JWT from Authorization header
  const user = users.get("demo@sciconnect.org");
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user });
});
