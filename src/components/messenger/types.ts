/* ─── Messenger Types ─── */

export interface Contact {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  status: "online" | "away" | "offline" | "busy";
  lastSeen?: string;
  role?: string;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Attachment {
  type: "image" | "file" | "voice" | "location" | "link";
  name: string;
  url?: string;
  duration?: string;
  size?: string;
  preview?: string;
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
}

export const statusColor: Record<string, string> = {
  online: "bg-success",
  away: "bg-gold",
  busy: "bg-destructive",
  offline: "bg-muted-foreground/40",
};

export const quickReactions = ["👍", "❤️", "😂", "🔥", "😮", "😢", "🎉", "💡"];

export const emojiCategories = [
  { label: "Smileys", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😗","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮"] },
  { label: "Gestures", emojis: ["👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✌️","🤟","🤘","👌","🤏","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","👋","🤙","💪","🦾","🖕"] },
  { label: "Science", emojis: ["🔬","🧬","⚗️","🧪","💡","📊","📈","🔭","🧮","🧲","⚛️","🔋","💻","📚","✏️","📝","🗂️","📎","🔗","🏆","🎯","⭐","🌟","✨","💫","🔥","❤️","🧡","💛","💚","💙","💜"] },
];
