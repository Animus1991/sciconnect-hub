/* ─── AI Chat Feedback & Analytics Store ─── */
import type { FeedbackEntry, FeedbackAnalytics, AIProviderType } from "@/components/ai-chat/types";

const FEEDBACK_KEY = "thinkhub-ai-feedback";
const MAX_RECENT = 100;

function load(): FeedbackEntry[] {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
  } catch { return []; }
}

function save(entries: FeedbackEntry[]) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries.slice(-MAX_RECENT)));
}

export function addFeedback(entry: FeedbackEntry): void {
  const entries = load();
  // Remove existing feedback for same message
  const filtered = entries.filter(e => e.messageId !== entry.messageId);
  filtered.push(entry);
  save(filtered);
}

export function removeFeedback(messageId: string): void {
  const entries = load().filter(e => e.messageId !== messageId);
  save(entries);
}

export function getFeedback(messageId: string): "up" | "down" | null {
  const entry = load().find(e => e.messageId === messageId);
  return entry?.feedback ?? null;
}

export function getAnalytics(): FeedbackAnalytics {
  const entries = load();
  const byProvider: Record<string, { up: number; down: number }> = {};

  let totalUp = 0;
  let totalDown = 0;

  for (const e of entries) {
    if (e.feedback === "up") totalUp++;
    else totalDown++;

    if (!byProvider[e.provider]) byProvider[e.provider] = { up: 0, down: 0 };
    if (e.feedback === "up") byProvider[e.provider].up++;
    else byProvider[e.provider].down++;
  }

  return {
    totalUp,
    totalDown,
    byProvider,
    recent: entries.slice(-20).reverse(),
  };
}
