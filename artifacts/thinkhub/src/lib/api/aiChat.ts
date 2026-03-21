/* ─── AI Chat API Layer with Simulated Streaming ─── */
import type { AIProvider, AIProviderType, ChatMessage } from "@/components/ai-chat/types";

const PROVIDERS: AIProvider[] = [
  { id: "gemini", name: "Gemini", icon: "✦", color: "accent", model: "gemini-3-flash", autoConnect: false, status: "connected" },
  { id: "openai", name: "OpenAI", icon: "◎", color: "accent", model: "gpt-5", autoConnect: false, status: "disconnected" },
  { id: "anthropic", name: "Anthropic", icon: "◈", color: "accent", model: "claude-sonnet-4", autoConnect: false, status: "disconnected" },
  { id: "local", name: "Local LLM", icon: "⚙", color: "accent", model: "llama-3.1", autoConnect: false, status: "disconnected" },
];

export async function listProviders(): Promise<AIProvider[]> {
  return PROVIDERS;
}

export async function getProviderStatus(id: AIProviderType): Promise<AIProvider> {
  return PROVIDERS.find(p => p.id === id) ?? PROVIDERS[0];
}

export async function checkSession(id: AIProviderType): Promise<boolean> {
  const p = PROVIDERS.find(pp => pp.id === id);
  return p?.status === "connected";
}

export async function connectProvider(id: AIProviderType, _method: string, _credentials?: Record<string, string>): Promise<boolean> {
  const p = PROVIDERS.find(pp => pp.id === id);
  if (p) p.status = "connected";
  return true;
}

export async function disconnectProvider(id: AIProviderType): Promise<void> {
  const p = PROVIDERS.find(pp => pp.id === id);
  if (p) p.status = "disconnected";
}

function generateResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("/summarize") || lower.includes("summarize"))
    return "**Summary:**\nBased on your conversation context, the key points are:\n1. ML reproducibility with containerization shows 78% σ reduction\n2. Blockchain verification adds tamper-proof audit trails\n3. Next step: formalize as a protocol and submit to workshop";
  if (lower.includes("/cite") || lower.includes("citation"))
    return "**Relevant Citations:**\n1. Pineau et al. (2021) — *Improving Reproducibility in ML Research* — JMLR\n2. Bouthillier et al. (2019) — *Unreproducible Research is Reproducible* — ICML\n3. Gundersen & Kjensmo (2018) — *State of the Art: Reproducibility in AI* — AAAI";
  if (lower.includes("/help") || lower.includes("help"))
    return "**Commands:**\n- `/summarize` — Summarize context\n- `/cite [topic]` — Find citations\n- `/draft [section]` — Draft paper section\n- `/analyze` — Analyze data\n- `/translate` — Translate text\n\nOr just ask anything!";
  if (lower.includes("hello") || lower.includes("hi"))
    return "Hello! I'm your Think!Hub AI. Type `/help` for commands.";
  return `Interesting question about "${input.slice(0, 50)}..."\n\nBased on your research context:\n1. This relates to your ongoing ML reproducibility work\n2. Consider reviewing recent literature\n3. Document findings in your lab notebook\n\nWould you like me to elaborate on any of these points?`;
}

/**
 * Streaming chat completion — simulates token-by-token delivery via callbacks.
 * When Lovable Cloud is enabled, replace with real SSE from edge function.
 */
export async function streamChatCompletion(
  provider: AIProviderType,
  messages: ChatMessage[],
  onDelta: (token: string) => void,
  onDone: () => void,
  signal?: AbortSignal
): Promise<void> {
  const last = messages[messages.length - 1]?.content ?? "";
  const fullResponse = generateResponse(last);
  const p = PROVIDERS.find(pp => pp.id === provider);

  // Simulate initial thinking delay
  await new Promise(r => setTimeout(r, 300));

  // Stream token by token (word-level chunks for realism)
  const words = fullResponse.split(/(\s+)/);
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) return;
    onDelta(words[i]);
    // Variable delay: faster for spaces/short words, slower for content
    const delay = words[i].trim() === "" ? 5 : 15 + Math.random() * 35;
    await new Promise(r => setTimeout(r, delay));
  }

  onDone();
}

/** Non-streaming fallback */
export async function chatCompletion(
  provider: AIProviderType,
  messages: ChatMessage[]
): Promise<ChatMessage> {
  const last = messages[messages.length - 1]?.content ?? "";
  const content = generateResponse(last);
  await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
  const p = PROVIDERS.find(pp => pp.id === provider);
  return {
    id: `ai_${Date.now()}`,
    role: "assistant",
    content,
    timestamp: Date.now(),
    provider,
    model: p?.model ?? "unknown",
  };
}
