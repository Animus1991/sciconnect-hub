import { Router } from "express";
import OpenAI from "openai";

const router = Router();

function getOpenAI() {
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey  = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "placeholder";
  if (!baseURL) throw new Error("AI_INTEGRATIONS_OPENAI_BASE_URL not set");
  return new OpenAI({ baseURL, apiKey });
}

/* ── POST /api/canvas-ai/extract ─────────────────────────────────
   Extract structured research nodes from pasted text.
   Body: { text: string, boardContext?: string }
   Returns: { nodes: AINodeSuggestion[] }
────────────────────────────────────────────────────────────────── */
router.post("/extract", async (req, res) => {
  try {
    const { text, boardContext } = req.body as { text: string; boardContext?: string };
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return res.status(400).json({ error: "Text must be at least 10 characters." });
    }

    const openai = getOpenAI();

    const systemPrompt = `You are a research intelligence assistant embedded in a research canvas tool.
Your task is to extract structured research nodes from provided text.

Node types you can extract:
- "concept": a key concept, theory, or idea (use type "insight")
- "hypothesis": a testable claim or research hypothesis
- "question": an open research question or gap
- "evidence": an empirical finding, result, or piece of evidence
- "citation": a paper reference or bibliographic item
- "argument": a logical argument or claim (use type "insight")
- "task": an action item or next step
- "note": a general observation or note

Return a JSON array of nodes. Each node must have:
{
  "type": "insight" | "hypothesis" | "question" | "evidence" | "citation" | "task" | "note",
  "title": "concise title (max 60 chars)",
  "content": "brief description or key content (max 200 chars)",
  "rationale": "why this node was extracted from the text (max 100 chars)",
  "confidence": 0.0 to 1.0,
  "sourceText": "the key phrase or sentence from the source text that prompted this node (max 120 chars)"
}

Rules:
- Extract only genuinely meaningful nodes with research value
- Do NOT extract trivial information
- Prefer 3-8 nodes; extract more only if the text is very rich
- Do NOT invent information not present in the text
- For citations, use type "citation" and put author/year in title if available`;

    const userPrompt = `${boardContext ? `Current board context: ${boardContext}\n\n` : ""}Please extract research nodes from this text:\n\n${text.slice(0, 4000)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { nodes?: unknown[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    const nodes = Array.isArray(parsed.nodes) ? parsed.nodes : (Array.isArray(parsed) ? parsed : []);

    const validTypes = new Set(["insight", "hypothesis", "question", "evidence", "citation", "task", "note"]);
    const colorMap: Record<string, string> = {
      insight: "green", hypothesis: "blue", question: "purple",
      evidence: "teal", citation: "slate", task: "rose", note: "amber",
    };

    const suggestions = (nodes as Array<Record<string, unknown>>)
      .filter(n => n && typeof n === "object")
      .map((n, i) => ({
        id: `ai_sug_${Date.now()}_${i}`,
        type: validTypes.has(String(n.type)) ? String(n.type) : "note",
        title: String(n.title ?? "Extracted Node").slice(0, 80),
        content: String(n.content ?? "").slice(0, 300),
        colorKey: colorMap[String(n.type)] ?? "amber",
        rationale: String(n.rationale ?? "Extracted from source text").slice(0, 150),
        confidence: typeof n.confidence === "number" ? Math.max(0, Math.min(1, n.confidence)) : 0.75,
        sourceText: String(n.sourceText ?? "").slice(0, 150),
      }));

    return res.json({ nodes: suggestions });
  } catch (err: unknown) {
    console.error("canvas-ai/extract error:", err);
    const msg = err instanceof Error ? err.message : "AI extraction failed";
    return res.status(500).json({ error: msg });
  }
});

/* ── POST /api/canvas-ai/connections ─────────────────────────────
   Suggest meaningful connections between selected nodes.
   Body: { nodes: CanvasNodeSummary[], boardContext?: string }
   Returns: { connections: AIConnectionSuggestion[] }
────────────────────────────────────────────────────────────────── */
router.post("/connections", async (req, res) => {
  try {
    const { nodes, boardContext } = req.body as {
      nodes: Array<{ id: string; type: string; title: string; content?: string }>;
      boardContext?: string;
    };

    if (!Array.isArray(nodes) || nodes.length < 2) {
      return res.status(400).json({ error: "At least 2 nodes required." });
    }
    if (nodes.length > 15) {
      return res.status(400).json({ error: "Maximum 15 nodes for connection analysis." });
    }

    const openai = getOpenAI();

    const systemPrompt = `You are a research intelligence assistant. Analyze the provided research nodes and suggest meaningful semantic connections between them.

Connection types:
- "supports": Node A provides evidence or support for Node B
- "contradicts": Node A opposes or contradicts Node B  
- "related": Nodes share thematic or conceptual overlap
- "derived": Node A is derived from or builds upon Node B
- "compare": Nodes are worth comparing side-by-side
- "questions": Node A raises a question about Node B

Return a JSON object with a "connections" array. Each connection must have:
{
  "fromId": "source node ID",
  "toId": "target node ID",
  "connType": "supports" | "contradicts" | "related" | "derived" | "compare" | "questions",
  "label": "short verb phrase (max 30 chars)",
  "rationale": "why these two nodes are related (max 120 chars)",
  "confidence": 0.0 to 1.0
}

Rules:
- Only suggest connections with genuine inferential value
- Avoid trivially obvious connections
- Suggest 2-6 connections maximum
- Confidence should reflect how certain the relationship is
- Do NOT create connections between nodes that already have obvious direct connections implied by their types`;

    const nodesText = nodes.map((n, i) =>
      `[${i + 1}] ID: ${n.id}\nType: ${n.type}\nTitle: ${n.title}\nContent: ${(n.content ?? "").replace(/<[^>]+>/g, "").slice(0, 150)}`
    ).join("\n\n");

    const userPrompt = `${boardContext ? `Board context: ${boardContext}\n\n` : ""}Analyze these research nodes and suggest meaningful connections:\n\n${nodesText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { connections?: unknown[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    const connections = Array.isArray(parsed.connections) ? parsed.connections : [];
    const validTypes = new Set(["supports", "contradicts", "related", "derived", "compare", "questions", "custom"]);
    const nodeIds = new Set(nodes.map(n => n.id));

    const suggestions = (connections as Array<Record<string, unknown>>)
      .filter(c => c && nodeIds.has(String(c.fromId)) && nodeIds.has(String(c.toId)) && String(c.fromId) !== String(c.toId))
      .map((c, i) => ({
        id: `ai_conn_${Date.now()}_${i}`,
        fromId: String(c.fromId),
        toId: String(c.toId),
        connType: validTypes.has(String(c.connType)) ? String(c.connType) : "related",
        label: String(c.label ?? "related to").slice(0, 40),
        rationale: String(c.rationale ?? "AI-suggested relationship").slice(0, 150),
        confidence: typeof c.confidence === "number" ? Math.max(0, Math.min(1, c.confidence)) : 0.7,
      }));

    return res.json({ connections: suggestions });
  } catch (err: unknown) {
    console.error("canvas-ai/connections error:", err);
    const msg = err instanceof Error ? err.message : "AI connection analysis failed";
    return res.status(500).json({ error: msg });
  }
});

/* ── POST /api/canvas-ai/synthesize ─────────────────────────────
   Synthesize a cluster of nodes into a summary insight node.
   Body: { nodes: CanvasNodeSummary[] }
   Returns: { synthesis: { title, content, rationale } }
────────────────────────────────────────────────────────────────── */
router.post("/synthesize", async (req, res) => {
  try {
    const { nodes } = req.body as {
      nodes: Array<{ id: string; type: string; title: string; content?: string; author?: string; year?: number }>;
    };

    if (!Array.isArray(nodes) || nodes.length < 2) {
      return res.status(400).json({ error: "At least 2 nodes required for synthesis." });
    }

    const openai = getOpenAI();

    const systemPrompt = `You are a research intelligence assistant. Synthesize the provided research nodes into a single coherent insight or summary.

Return a JSON object with:
{
  "title": "synthesis title (max 70 chars)",
  "content": "a 2-4 sentence synthesis that integrates the key themes, findings, or arguments across all nodes. Be specific and intellectually substantive. Max 400 chars.",
  "rationale": "what is the core insight connecting these nodes (max 150 chars)"
}

Rules:
- Be genuinely synthesizing, not just summarizing
- Identify the key intellectual relationship or pattern
- Be specific to the actual content, not generic
- Write in academic/scholarly register`;

    const nodesText = nodes.map((n, i) =>
      `[${i + 1}] ${n.type.toUpperCase()}: "${n.title}"${n.author ? ` — ${n.author}${n.year ? ` (${n.year})` : ""}` : ""}\n${(n.content ?? "").replace(/<[^>]+>/g, "").slice(0, 200)}`
    ).join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: `Synthesize these ${nodes.length} research nodes:\n\n${nodesText}` },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { title?: string; content?: string; rationale?: string } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    return res.json({
      synthesis: {
        title: String(parsed.title ?? "Synthesis").slice(0, 100),
        content: String(parsed.content ?? "").slice(0, 600),
        rationale: String(parsed.rationale ?? "AI-synthesized cluster").slice(0, 200),
      }
    });
  } catch (err: unknown) {
    console.error("canvas-ai/synthesize error:", err);
    const msg = err instanceof Error ? err.message : "AI synthesis failed";
    return res.status(500).json({ error: msg });
  }
});

/* ── POST /api/canvas-ai/questions ──────────────────────────────
   Generate research questions from board content.
   Body: { nodes: CanvasNodeSummary[], focus?: string }
   Returns: { questions: { title, rationale, confidence }[] }
────────────────────────────────────────────────────────────────── */
router.post("/questions", async (req, res) => {
  try {
    const { nodes, focus } = req.body as {
      nodes: Array<{ type: string; title: string; content?: string }>;
      focus?: string;
    };

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({ error: "At least 1 node required." });
    }

    const openai = getOpenAI();

    const systemPrompt = `You are a research intelligence assistant. Based on the provided research board content, generate incisive research questions that reveal gaps, tensions, or productive next directions.

Return a JSON object with a "questions" array. Each question must have:
{
  "title": "a specific, focused research question (max 100 chars)",
  "rationale": "why this question is important given the board content (max 120 chars)",
  "confidence": 0.0 to 1.0
}

Rules:
- Generate 3-6 high-quality research questions
- Questions should be specific, not generic
- Prefer questions that reveal genuine gaps or tensions in the existing content
- Include methodological questions where appropriate
- Avoid yes/no questions; prefer questions that open productive inquiry`;

    const nodesText = nodes.slice(0, 20).map(n =>
      `${n.type.toUpperCase()}: "${n.title}" — ${(n.content ?? "").replace(/<[^>]+>/g, "").slice(0, 100)}`
    ).join("\n");

    const userPrompt = `${focus ? `Research focus: ${focus}\n\n` : ""}Board content:\n${nodesText}\n\nGenerate research questions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { questions?: unknown[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    const suggestions = (questions as Array<Record<string, unknown>>).map((q, i) => ({
      id: `ai_q_${Date.now()}_${i}`,
      title: String(q.title ?? "Research question").slice(0, 120),
      rationale: String(q.rationale ?? "AI-generated research question").slice(0, 150),
      confidence: typeof q.confidence === "number" ? Math.max(0, Math.min(1, q.confidence)) : 0.75,
    }));

    return res.json({ questions: suggestions });
  } catch (err: unknown) {
    console.error("canvas-ai/questions error:", err);
    const msg = err instanceof Error ? err.message : "AI question generation failed";
    return res.status(500).json({ error: msg });
  }
});

/* ── POST /api/canvas-ai/chat ────────────────────────────────────
   Chat about board content — ask questions, get analysis.
   Body: { message: string, nodes: CanvasNodeSummary[], history?: ChatMessage[] }
   Returns: { reply: string }
────────────────────────────────────────────────────────────────── */
router.post("/chat", async (req, res) => {
  try {
    const { message, nodes, history } = req.body as {
      message: string;
      nodes: Array<{ type: string; title: string; content?: string; author?: string; year?: number }>;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    const openai = getOpenAI();

    const boardSummary = nodes.slice(0, 30).map(n =>
      `[${n.type}] "${n.title}"${n.author ? ` — ${n.author}${n.year ? ` (${n.year})` : ""}` : ""}: ${(n.content ?? "").replace(/<[^>]+>/g, "").slice(0, 120)}`
    ).join("\n");

    const systemPrompt = `You are an intelligent research assistant embedded in a visual research canvas tool. You help researchers think through their ideas, identify gaps, and gain insight from their research materials.

The researcher's current board contains the following nodes:
${boardSummary}

Guidelines:
- Respond in a scholarly, thoughtful register
- Be specific and reference actual content from the board when relevant
- Help the researcher think, not just summarize
- If asked about gaps or tensions, be intellectually honest
- Keep responses focused and actionable (2-4 paragraphs max)
- Do not hallucinate information not in the board`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages,
    });

    const reply = response.choices[0]?.message?.content ?? "I could not generate a response.";
    return res.json({ reply });
  } catch (err: unknown) {
    console.error("canvas-ai/chat error:", err);
    const msg = err instanceof Error ? err.message : "AI chat failed";
    return res.status(500).json({ error: msg });
  }
});

export default router;
