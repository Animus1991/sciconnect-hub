/* ─── Mock AI Chat API Layer ─── */
import type { AIProvider, AIProviderType, ChatMessage } from "@/components/ai-chat/types";

const PROVIDERS: AIProvider[] = [
  { id: "gemini", name: "Gemini", icon: "✦", color: "accent", model: "gemini-3-flash", autoConnect: true, status: "connected" },
  { id: "openai", name: "OpenAI", icon: "◎", color: "accent", model: "gpt-4o", autoConnect: false, status: "disconnected" },
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

const MOCK_RESPONSES: Record<string, string> = {
  summarize: "**Summary:**\nBased on your conversation context, the key points are:\n1. ML reproducibility with containerization shows 78% σ reduction\n2. Blockchain verification adds tamper-proof audit trails\n3. Next step: formalize as a protocol and submit to workshop",
  cite: "**Relevant Citations:**\n1. Pineau et al. (2021) — *Improving Reproducibility in ML Research* — JMLR\n2. Bouthillier et al. (2019) — *Unreproducible Research is Reproducible* — ICML\n3. Gundersen & Kjensmo (2018) — *State of the Art: Reproducibility in AI* — AAAI",
  help: "**Commands:**\n- `/summarize` — Summarize context\n- `/cite [topic]` — Find citations\n- `/draft [section]` — Draft paper section\n- `/analyze` — Analyze data\n- `/translate` — Translate text\n\nOr just ask anything!",
};

export async function chatCompletion(
  provider: AIProviderType,
  messages: ChatMessage[]
): Promise<ChatMessage> {
  await new Promise(r => setTimeout(r, 600 + Math.random() * 1200));

  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";
  let content: string;
  if (last.includes("/summarize") || last.includes("summarize")) content = MOCK_RESPONSES.summarize;
  else if (last.includes("/cite") || last.includes("citation")) content = MOCK_RESPONSES.cite;
  else if (last.includes("/help") || last.includes("help")) content = MOCK_RESPONSES.help;
  else if (last.includes("hello") || last.includes("hi")) content = "Hello! I'm your Think!Hub AI. Type `/help` for commands.";
  else content = `Interesting question about "${messages[messages.length - 1]?.content.slice(0, 50)}..."\n\nBased on your research context:\n1. This relates to your ongoing ML reproducibility work\n2. Consider reviewing recent literature\n3. Document findings in your lab notebook\n\nWant me to elaborate?`;

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
