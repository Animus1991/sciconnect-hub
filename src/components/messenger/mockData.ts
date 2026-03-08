import type { Contact, Conversation, Message } from "./types";

export const currentUser: Contact = {
  id: "me", name: "You", initials: "YO", status: "online", role: "Researcher"
};

export const contacts: Contact[] = [
  { id: "u1", name: "Dr. Sarah Chen", initials: "SC", status: "online", role: "ML Researcher" },
  { id: "u2", name: "Prof. Marcus Lee", initials: "ML", status: "online", role: "Computer Science" },
  { id: "u3", name: "Dr. Elena Volkov", initials: "EV", status: "away", lastSeen: "15m ago", role: "Climate Science" },
  { id: "u4", name: "Dr. Yuki Tanaka", initials: "YT", status: "online", role: "Bioinformatics" },
  { id: "u5", name: "Prof. Omar Hassan", initials: "OH", status: "offline", lastSeen: "2h ago", role: "Bioethics" },
  { id: "u6", name: "Dr. Lisa Park", initials: "LP", status: "busy", role: "Neuroscience" },
  { id: "u7", name: "Dr. Priya Sharma", initials: "PS", status: "online", role: "Gene Therapy" },
  { id: "u8", name: "Dr. James Okafor", initials: "JK", status: "offline", lastSeen: "1d ago", role: "Publishing" },
];

const now = Date.now();
const hour = 3600000;
const day = 86400000;

export const conversations: Conversation[] = [
  { id: "c1", type: "direct", name: "Dr. Sarah Chen", initials: "SC", participants: [contacts[0]], lastMessage: "I'll send you the dataset link shortly", lastMessageTime: "2m ago", lastMessageTimestamp: now - 120000, unread: 2, pinned: true, muted: false, archived: false, online: true, typing: true },
  { id: "c2", type: "group", name: "ML Research Lab", initials: "ML", participants: [contacts[0], contacts[1], contacts[3]], lastMessage: "Prof. Lee: Meeting moved to Thursday", lastMessageTime: "15m ago", lastMessageTimestamp: now - 900000, unread: 5, pinned: true, muted: false, archived: false, description: "Weekly sync for ML reproducibility project" },
  { id: "c3", type: "direct", name: "Dr. Elena Volkov", initials: "EV", participants: [contacts[2]], lastMessage: "Thanks for the review feedback!", lastMessageTime: "1h ago", lastMessageTimestamp: now - hour, unread: 0, pinned: false, muted: false, archived: false, online: false },
  { id: "c4", type: "group", name: "CRISPR Ethics Committee", initials: "CE", participants: [contacts[4], contacts[5], contacts[6]], lastMessage: "Dr. Park: Draft submitted to committee", lastMessageTime: "3h ago", lastMessageTimestamp: now - 3 * hour, unread: 1, pinned: false, muted: false, archived: false, description: "Ethics review for CRISPR gene-editing protocols" },
  { id: "c5", type: "direct", name: "Prof. Omar Hassan", initials: "OH", participants: [contacts[4]], lastMessage: "You: I agree with your assessment", lastMessageTime: "5h ago", lastMessageTimestamp: now - 5 * hour, unread: 0, pinned: false, muted: true, archived: false, online: false },
  { id: "c6", type: "direct", name: "Dr. Yuki Tanaka", initials: "YT", participants: [contacts[3]], lastMessage: "The Rayyan comparison is ready", lastMessageTime: "8h ago", lastMessageTimestamp: now - 8 * hour, unread: 0, pinned: false, muted: false, archived: false, online: true },
  { id: "c7", type: "group", name: "Grant Writing Team", initials: "GW", participants: [contacts[0], contacts[5], contacts[7]], lastMessage: "Dr. Okafor: Budget section needs revision", lastMessageTime: "1d ago", lastMessageTimestamp: now - day, unread: 0, pinned: false, muted: false, archived: false, description: "NSF grant proposal coordination" },
  { id: "c8", type: "direct", name: "Dr. Priya Sharma", initials: "PS", participants: [contacts[6]], lastMessage: "The LNP delivery paper is published!", lastMessageTime: "2d ago", lastMessageTimestamp: now - 2 * day, unread: 0, pinned: false, muted: false, archived: true, online: true },
];

export const messagesData: Record<string, Message[]> = {
  c1: [
    { id: "m1", senderId: "u1", text: "Hey! Have you seen the latest results from our reproducibility experiment?", time: "10:30 AM", timestamp: now - 15 * 60000, status: "read", reactions: [{ emoji: "👍", users: ["me"] }] },
    { id: "m2", senderId: "me", text: "Yes! The variance is much lower now. Great work on the containerization.", time: "10:32 AM", timestamp: now - 13 * 60000, status: "read", reactions: [] },
    { id: "m3", senderId: "u1", text: "Thanks! I've also set up automatic seed logging.", time: "10:33 AM", timestamp: now - 12 * 60000, status: "read", reactions: [] },
    { id: "m4", senderId: "u1", text: "Here's the comparison chart from the last 3 runs:", time: "10:34 AM", timestamp: now - 11 * 60000, status: "read", reactions: [], attachments: [{ type: "image", name: "comparison_chart.png" }] },
    { id: "m5", senderId: "me", text: "This looks amazing! The standard deviation dropped by 78%. Should we submit this to the reproducibility workshop?", time: "10:36 AM", timestamp: now - 9 * 60000, status: "read", reactions: [{ emoji: "🔥", users: ["u1"] }, { emoji: "❤️", users: ["u1"] }] },
    { id: "m6", senderId: "u1", text: "Absolutely! I'll prepare the abstract. Can you handle the methodology section?", time: "10:37 AM", timestamp: now - 8 * 60000, status: "read", reactions: [] },
    { id: "m7", senderId: "me", text: "Sure, I'll draft it by Friday. Let me also add the DVC pipeline diagram.", time: "10:38 AM", timestamp: now - 7 * 60000, status: "delivered", reactions: [] },
    { id: "m8", senderId: "u1", text: "Perfect. I also attached the full experiment config file.", time: "10:40 AM", timestamp: now - 5 * 60000, status: "read", reactions: [], attachments: [{ type: "file", name: "experiment_config.yaml", size: "12 KB" }] },
    { id: "m9", senderId: "me", text: "Got it. I'll review it tonight.", time: "10:41 AM", timestamp: now - 4 * 60000, status: "delivered", reactions: [] },
    { id: "m10", senderId: "u1", text: "I'll send you the dataset link shortly", time: "10:45 AM", timestamp: now - 2 * 60000, status: "read", reactions: [] },
  ],
  c2: [
    { id: "gm1", senderId: "u2", text: "Team, I've rescheduled the weekly sync to Thursday 3PM.", time: "9:00 AM", timestamp: now - 4 * hour, status: "read", reactions: [{ emoji: "👍", users: ["me", "u1", "u4"] }] },
    { id: "gm2", senderId: "u1", text: "Works for me! I'll prepare the reproducibility update.", time: "9:05 AM", timestamp: now - 3.9 * hour, status: "read", reactions: [] },
    { id: "gm3", senderId: "u4", text: "Thursday works. Also, I have results from the bioinformatics pipeline to share.", time: "9:10 AM", timestamp: now - 3.8 * hour, status: "read", reactions: [{ emoji: "🎉", users: ["u2"] }] },
    { id: "gm4", senderId: "u2", text: "Great, let's allocate 15 min for each update. @Sarah can you also demo the new Docker setup?", time: "9:15 AM", timestamp: now - 3.7 * hour, status: "read", reactions: [] },
    { id: "gm5", senderId: "me", text: "I'll have the MLflow migration report ready by then.", time: "9:20 AM", timestamp: now - 3.6 * hour, status: "read", reactions: [{ emoji: "👍", users: ["u2"] }] },
    { id: "gm6", senderId: "u2", text: "Meeting moved to Thursday", time: "9:25 AM", timestamp: now - 3.5 * hour, status: "read", reactions: [], pinned: true },
  ],
};

export function getContactById(id: string): Contact | undefined {
  if (id === "me") return currentUser;
  return contacts.find(c => c.id === id);
}

export function getContactName(id: string): string {
  if (id === "me") return "You";
  return contacts.find(c => c.id === id)?.name ?? "Unknown";
}
