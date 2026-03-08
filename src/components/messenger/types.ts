/* ─── Messenger Types ─── */

export interface Contact {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  status: "online" | "away" | "offline" | "busy";
  lastSeen?: string;
  role?: string;
  institution?: string;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Attachment {
  type: "image" | "file" | "voice" | "location" | "link" | "code";
  name: string;
  url?: string;
  duration?: string;
  size?: string;
  preview?: string;
  language?: string;
}

export interface EvidenceTag {
  type: "idea" | "hypothesis" | "result" | "method" | "citation";
  label: string;
  timestamp: number;
  hash?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  replyTo?: { id: string; author: string; text: string };
  reactions: Reaction[];
  edited?: boolean;
  pinned?: boolean;
  attachments?: Attachment[];
  forwarded?: boolean;
  deleted?: boolean;
  evidenceTag?: EvidenceTag;
  bookmarked?: boolean;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string;
  initials: string;
  avatar?: string;
  participants: Contact[];
  lastMessage: string;
  lastMessageTime: string;
  lastMessageTimestamp: number;
  unread: number;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  online?: boolean;
  typing?: boolean;
  description?: string;
  linkedProject?: string;
  blockchainEnabled?: boolean;
}

export const statusColor: Record<string, string> = {
  online: "bg-success",
  away: "bg-gold",
  busy: "bg-destructive",
  offline: "bg-muted-foreground/40",
};

export const statusLabel: Record<string, string> = {
  online: "Online",
  away: "Away",
  busy: "Do Not Disturb",
  offline: "Offline",
};

export const quickReactions = ["👍", "❤️", "💡", "🔬", "🎉", "😂"];

export const evidenceTypes = [
  { type: "idea" as const, label: "Key Idea", icon: "💡", color: "text-gold" },
  { type: "hypothesis" as const, label: "Hypothesis", icon: "🔬", color: "text-info" },
  { type: "result" as const, label: "Result", icon: "📊", color: "text-success" },
  { type: "method" as const, label: "Method", icon: "⚗️", color: "text-highlight" },
  { type: "citation" as const, label: "Citation", icon: "📎", color: "text-accent" },
];

export const emojiCategories = [
  { label: "Recent", emojis: ["👍","❤️","💡","🔬","😂","🎉","🔥","✨","👏","🤔"] },
  { label: "Science", emojis: ["🔬","🧬","⚗️","🧪","💡","📊","📈","🔭","🧮","🧲","⚛️","🔋","💻","📚","✏️","📝","🗂️","📎","🔗","🏆","🎯","⭐","🌟","✨","💫","🔥"] },
  { label: "Faces", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😗","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤨","😐","😏","😒","🙄","😬","😌","😔","😴"] },
  { label: "Hands", emojis: ["👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✌️","🤟","🤘","👌","🤏","👈","👉","👆","👇","✋","🤚","👋","🤙","💪"] },
];
