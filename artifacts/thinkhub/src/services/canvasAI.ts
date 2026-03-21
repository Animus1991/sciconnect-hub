/* ────────────────────────────────────────────────────────────────
   canvasAI.ts  —  Frontend AI service for Research Canvas
   All calls route through the API server's canvas-ai endpoints.
──────────────────────────────────────────────────────────────── */

import type { CanvasNodeData, AINodeSuggestion, AIConnectionSuggestion, ConnType } from "@/data/canvasData";

/* ── Base URL ─────────────────────────────────────────────────── */
function apiBase(): string {
  const base = import.meta.env.BASE_URL ?? "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${apiBase()}/api/canvas-ai${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/* ── Types ────────────────────────────────────────────────────── */
export interface ExtractResult {
  nodes: AINodeSuggestion[];
}

export interface ConnectionsResult {
  connections: AIConnectionSuggestion[];
}

export interface SynthesisResult {
  synthesis: {
    title: string;
    content: string;
    rationale: string;
  };
}

export interface QuestionsResult {
  questions: Array<{
    id: string;
    title: string;
    rationale: string;
    confidence: number;
  }>;
}

export interface ChatResult {
  reply: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* ── Node serializer (safe for API) ─────────────────────────────── */
function serializeNode(n: CanvasNodeData) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    content: n.content ? n.content.replace(/<[^>]+>/g, "").slice(0, 200) : "",
    author: n.author,
    year: n.year,
    journal: n.journal,
    tags: n.tags?.slice(0, 5),
  };
}

/* ── Extract nodes from text ─────────────────────────────────── */
export async function extractNodesFromText(
  text: string,
  boardNodes: CanvasNodeData[] = []
): Promise<ExtractResult> {
  const boardContext = boardNodes.length > 0
    ? `Board has ${boardNodes.length} nodes: ${boardNodes.slice(0, 5).map(n => n.title).join(", ")}${boardNodes.length > 5 ? "…" : ""}`
    : undefined;

  return post<ExtractResult>("/extract", { text, boardContext });
}

/* ── Suggest connections between nodes ───────────────────────── */
export async function suggestConnections(
  selectedNodes: CanvasNodeData[]
): Promise<ConnectionsResult> {
  return post<ConnectionsResult>("/connections", {
    nodes: selectedNodes.map(serializeNode),
  });
}

/* ── Synthesize a cluster into a summary insight ─────────────── */
export async function synthesizeCluster(
  nodes: CanvasNodeData[]
): Promise<SynthesisResult> {
  return post<SynthesisResult>("/synthesize", {
    nodes: nodes.map(serializeNode),
  });
}

/* ── Generate research questions from board content ──────────── */
export async function generateResearchQuestions(
  nodes: CanvasNodeData[],
  focus?: string
): Promise<QuestionsResult> {
  return post<QuestionsResult>("/questions", {
    nodes: nodes.map(serializeNode),
    focus,
  });
}

/* ── Chat about board content ────────────────────────────────── */
export async function chatWithBoard(
  message: string,
  nodes: CanvasNodeData[],
  history: ChatMessage[] = []
): Promise<ChatResult> {
  return post<ChatResult>("/chat", {
    message,
    nodes: nodes.map(serializeNode),
    history: history.slice(-8),
  });
}

/* ── Estimate AI availability ────────────────────────────────── */
export async function checkAIAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/api/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/* ── Connection type color helper ────────────────────────────── */
export function connTypeToColor(connType: ConnType): string {
  const map: Record<ConnType, string> = {
    supports: "#34d399",
    contradicts: "#f87171",
    related: "#94a3b8",
    derived: "#60a5fa",
    compare: "#fbbf24",
    questions: "#c084fc",
    custom: "#94a3b8",
  };
  return map[connType] ?? "#94a3b8";
}
