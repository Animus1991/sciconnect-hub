/* ─── AI Chat System Types ─── */

export type AIProviderType = "openai" | "anthropic" | "gemini" | "local";

export interface AIProvider {
  id: AIProviderType;
  name: string;
  icon: string; // emoji
  color: string; // tailwind accent
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
  images?: string[]; // base64
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
