/* ─── Conversation Persistence (localStorage-based, backend-ready) ─── */
import type { SavedConversation, ChatMessage, AIProviderType } from "@/components/ai-chat/types";

const CONVERSATIONS_KEY = "thinkhub-ai-conversations";
const MAX_CONVERSATIONS = 50;

function loadAll(): SavedConversation[] {
  try {
    return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");
  } catch { return []; }
}

function saveAll(convs: SavedConversation[]) {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs.slice(-MAX_CONVERSATIONS)));
}

export function saveConversation(
  id: string,
  providerId: AIProviderType,
  messages: ChatMessage[],
  title?: string
): SavedConversation {
  const all = loadAll();
  const existing = all.find(c => c.id === id);
  const autoTitle = title || messages.find(m => m.role === "user")?.content.slice(0, 40) || "New Chat";

  if (existing) {
    existing.messages = messages;
    existing.updatedAt = Date.now();
    if (title) existing.title = title;
    saveAll(all);
    return existing;
  }

  const conv: SavedConversation = {
    id,
    providerId,
    title: autoTitle,
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pinned: false,
  };
  all.push(conv);
  saveAll(all);
  return conv;
}

export function loadConversation(id: string): SavedConversation | null {
  return loadAll().find(c => c.id === id) ?? null;
}

export function listConversations(providerId?: AIProviderType): SavedConversation[] {
  const all = loadAll();
  const filtered = providerId ? all.filter(c => c.providerId === providerId) : all;
  return filtered.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export function deleteConversation(id: string): void {
  saveAll(loadAll().filter(c => c.id !== id));
}

export function togglePin(id: string): void {
  const all = loadAll();
  const conv = all.find(c => c.id === id);
  if (conv) {
    conv.pinned = !conv.pinned;
    saveAll(all);
  }
}
