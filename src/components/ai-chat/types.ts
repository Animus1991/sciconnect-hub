/* ─── AI Chat System Types ─── */

export type AIProviderType = "openai" | "anthropic" | "gemini" | "local";

export interface AIProvider {
  id: AIProviderType;
  name: string;
  icon: string;
  color: string;
  model: string;
  autoConnect: boolean;
  status: "connected" | "disconnected" | "error";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  provider?: AIProviderType;
  model?: string;
  images?: string[];
  feedback?: "up" | "down" | null;
  piiScrubbed?: boolean;
  sharedContext?: SharedContext;
}

export interface ChatWindow {
  id: string;
  providerId: AIProviderType;
  providerName: string;
  messages: ChatMessage[];
  position: { x: number; y: number };
  size: { w: number; h: number };
  zIndex: number;
  minimized: boolean;
  createdAt: number;
  conversationId?: string; // for persistence
}

export type LayoutMode = "floating" | "sticky";

export interface WindowLayout {
  positions: Record<string, { x: number; y: number }>;
  sizes: Record<string, { w: number; h: number }>;
  layoutMode: LayoutMode;
}

export interface AuthMethod {
  type: "oauth" | "email" | "apikey";
  label: string;
  icon: string;
}

/* ─── Feedback & Analytics ─── */
export interface FeedbackEntry {
  messageId: string;
  conversationId: string;
  provider: AIProviderType;
  feedback: "up" | "down";
  timestamp: number;
  messagePreview: string;
}

export interface FeedbackAnalytics {
  totalUp: number;
  totalDown: number;
  byProvider: Record<string, { up: number; down: number }>;
  recent: FeedbackEntry[];
}

/* ─── Shared Context ─── */
export interface SharedContext {
  type: "document" | "segment" | "project" | "workspace";
  title: string;
  content: string;
  source?: string;
}

/* ─── Conversation Persistence ─── */
export interface SavedConversation {
  id: string;
  providerId: AIProviderType;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
}

/* ─── PII Patterns ─── */
export const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string; label: string }> = [
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: "[EMAIL]", label: "Email" },
  { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: "[PHONE]", label: "Phone" },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[SSN]", label: "SSN" },
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: "[CARD]", label: "Credit Card" },
  { pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: "[IP]", label: "IP Address" },
  { pattern: /\b[A-Z]{2}\d{6,9}\b/g, replacement: "[PASSPORT]", label: "Passport" },
];
