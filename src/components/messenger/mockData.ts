import type { Contact, Conversation, Message } from "./types";

export const currentUser: Contact = {
  id: "me", name: "You", initials: "YO", status: "online", role: "Researcher", institution: "MIT"
};

export const contacts: Contact[] = [
  { id: "u1", name: "Dr. Sarah Chen", initials: "SC", status: "online", role: "ML Researcher", institution: "Stanford" },
  { id: "u2", name: "Prof. Marcus Lee", initials: "ML", status: "online", role: "Computer Science", institution: "MIT" },
  { id: "u3", name: "Dr. Elena Volkov", initials: "EV", status: "away", lastSeen: "15m ago", role: "Climate Science", institution: "ETH Zürich" },
  { id: "u4", name: "Dr. Yuki Tanaka", initials: "YT", status: "online", role: "Bioinformatics", institution: "University of Tokyo" },
  { id: "u5", name: "Prof. Omar Hassan", initials: "OH", status: "offline", lastSeen: "2h ago", role: "Bioethics", institution: "Oxford" },
  { id: "u6", name: "Dr. Lisa Park", initials: "LP", status: "busy", role: "Neuroscience", institution: "Johns Hopkins" },
  { id: "u7", name: "Dr. Priya Sharma", initials: "PS", status: "online", role: "Gene Therapy", institution: "Harvard" },
  { id: "u8", name: "Dr. James Okafor", initials: "JK", status: "offline", lastSeen: "1d ago", role: "Publishing", institution: "Nature" },
];

const now = Date.now();
const hour = 3600000;
const day = 86400000;

export const conversations: Conversation[] = [
  {
    id: "c1", type: "direct", name: "Dr. Sarah Chen", initials: "SC",
    participants: [contacts[0]],
    lastMessage: "I'll send you the dataset link shortly",
    lastMessageTime: "2m", lastMessageTimestamp: now - 120000,
    unread: 2, pinned: true, muted: false, archived: false,
    online: true, typing: true,
    linkedProject: "ML Reproducibility",
    blockchainLevel: "mutual", ndaStatus: "off",
  },
  {
    id: "c2", type: "group", name: "ML Research Lab", initials: "ML",
    participants: [contacts[0], contacts[1], contacts[3]],
    lastMessage: "Meeting moved to Thursday",
    lastMessageTime: "15m", lastMessageTimestamp: now - 900000,
    unread: 5, pinned: true, muted: false, archived: false,
    description: "Weekly sync for ML reproducibility project",
    linkedProject: "ML Reproducibility",
    blockchainLevel: "off", ndaStatus: "off",
  },
  {
    id: "c3", type: "direct", name: "Dr. Elena Volkov", initials: "EV",
    participants: [contacts[2]],
    lastMessage: "Thanks for the review feedback!",
    lastMessageTime: "1h", lastMessageTimestamp: now - hour,
    unread: 0, pinned: false, muted: false, archived: false,
    online: false,
    blockchainLevel: "unilateral", ndaStatus: "off",
  },
  {
    id: "c4", type: "group", name: "CRISPR Ethics Committee", initials: "CE",
    participants: [contacts[4], contacts[5], contacts[6]],
    lastMessage: "Draft submitted to committee",
    lastMessageTime: "3h", lastMessageTimestamp: now - 3 * hour,
    unread: 1, pinned: false, muted: false, archived: false,
    description: "Ethics review for CRISPR gene-editing protocols",
    blockchainLevel: "mutual", ndaStatus: "accepted", ndaAcceptedBy: ["me", "u5", "u6", "u7"],
  },
  {
    id: "c5", type: "direct", name: "Prof. Omar Hassan", initials: "OH",
    participants: [contacts[4]],
    lastMessage: "I agree with your assessment",
    lastMessageTime: "5h", lastMessageTimestamp: now - 5 * hour,
    unread: 0, pinned: false, muted: true, archived: false,
    online: false,
    blockchainLevel: "off", ndaStatus: "off",
  },
  {
    id: "c6", type: "direct", name: "Dr. Yuki Tanaka", initials: "YT",
    participants: [contacts[3]],
    lastMessage: "The Rayyan comparison is ready",
    lastMessageTime: "8h", lastMessageTimestamp: now - 8 * hour,
    unread: 0, pinned: false, muted: false, archived: false,
    online: true,
    blockchainLevel: "off", ndaStatus: "off",
  },
  {
    id: "c7", type: "group", name: "Grant Writing Team", initials: "GW",
    participants: [contacts[0], contacts[5], contacts[7]],
    lastMessage: "Budget section needs revision",
    lastMessageTime: "1d", lastMessageTimestamp: now - day,
    unread: 0, pinned: false, muted: false, archived: false,
    description: "NSF grant proposal coordination",
    blockchainLevel: "off", ndaStatus: "off",
  },
  {
    id: "c8", type: "direct", name: "Dr. Priya Sharma", initials: "PS",
    participants: [contacts[6]],
    lastMessage: "The LNP delivery paper is published!",
    lastMessageTime: "2d", lastMessageTimestamp: now - 2 * day,
    unread: 0, pinned: false, muted: false, archived: true,
    online: true,
    blockchainLevel: "off", ndaStatus: "off",
  },
];

export const messagesData: Record<string, Message[]> = {
  c1: [
    { id: "m1", senderId: "u1", text: "Hey! Have you seen the latest results from our reproducibility experiment?", time: "10:30 AM", timestamp: now - 15 * 60000, status: "read", reactions: [{ emoji: "👍", users: ["me"] }] },
    { id: "m2", senderId: "me", text: "Yes! The variance is much lower now. Great work on the containerization.", time: "10:32 AM", timestamp: now - 13 * 60000, status: "read", reactions: [], blockchainHash: "0x7f3a…b2c1" },
    { id: "m3", senderId: "u1", text: "Thanks! I've also set up automatic seed logging so every run is fully traceable.", time: "10:33 AM", timestamp: now - 12 * 60000, status: "read", reactions: [], evidenceTag: { type: "method", label: "Method", timestamp: now - 12 * 60000, hash: "sha256:a1b2c3" } },
    { id: "m4", senderId: "u1", text: "Here's the comparison chart from the last 3 runs:", time: "10:34 AM", timestamp: now - 11 * 60000, status: "read", reactions: [], attachments: [{ type: "image", name: "comparison_chart.png" }] },
    { id: "m5", senderId: "me", text: "This looks amazing! The standard deviation dropped by 78%. Should we submit this to the reproducibility workshop?", time: "10:36 AM", timestamp: now - 9 * 60000, status: "read", reactions: [{ emoji: "🔥", users: ["u1"] }], evidenceTag: { type: "result", label: "Result", timestamp: now - 9 * 60000, hash: "sha256:d4e5f6" }, blockchainHash: "0x8d2e…c4f5" },
    { id: "m6", senderId: "u1", text: "Absolutely! I'll prepare the abstract. Can you handle the methodology section?", time: "10:37 AM", timestamp: now - 8 * 60000, status: "read", reactions: [] },
    { id: "m7", senderId: "me", text: "Sure, I'll draft it by Friday. Let me also add the DVC pipeline diagram.", time: "10:38 AM", timestamp: now - 7 * 60000, status: "delivered", reactions: [], blockchainHash: "0x9a1b…d6e7" },
    { id: "m8", senderId: "u1", text: "Perfect. Here's the full experiment config file for reference.", time: "10:40 AM", timestamp: now - 5 * 60000, status: "read", reactions: [], attachments: [{ type: "file", name: "experiment_config.yaml", size: "12 KB" }], pinned: true },
    { id: "m9", senderId: "me", text: "Got it. I'll review it tonight and cross-check with the original parameters.", time: "10:41 AM", timestamp: now - 4 * 60000, status: "delivered", reactions: [], blockchainHash: "0xb3c4…e8f9" },
    { id: "m10", senderId: "u1", text: "I'll send you the dataset link shortly", time: "10:45 AM", timestamp: now - 2 * 60000, status: "read", reactions: [] },
  ],
  c2: [
    { id: "gm1", senderId: "u2", text: "Team, I've rescheduled the weekly sync to Thursday 3PM.", time: "9:00 AM", timestamp: now - 4 * hour, status: "read", reactions: [{ emoji: "👍", users: ["me", "u1", "u4"] }], pinned: true },
    { id: "gm2", senderId: "u1", text: "Works for me! I'll prepare the reproducibility update.", time: "9:05 AM", timestamp: now - 3.9 * hour, status: "read", reactions: [] },
    { id: "gm3", senderId: "u4", text: "Thursday works. I also have new results from the bioinformatics pipeline to share.", time: "9:10 AM", timestamp: now - 3.8 * hour, status: "read", reactions: [{ emoji: "🎉", users: ["u2"] }], evidenceTag: { type: "result", label: "Result", timestamp: now - 3.8 * hour } },
    { id: "gm4", senderId: "u2", text: "Great, let's allocate 15 min for each update. @Sarah can you also demo the new Docker setup?", time: "9:15 AM", timestamp: now - 3.7 * hour, status: "read", reactions: [] },
    { id: "gm5", senderId: "me", text: "I'll have the MLflow migration report ready by then.", time: "9:20 AM", timestamp: now - 3.6 * hour, status: "read", reactions: [{ emoji: "👍", users: ["u2"] }] },
    { id: "gm6", senderId: "u2", text: "Meeting moved to Thursday", time: "9:25 AM", timestamp: now - 3.5 * hour, status: "read", reactions: [] },
  ],
  c4: [
    { id: "cm1", senderId: "u5", text: "I've drafted the initial ethical framework for the Cas13 off-target study.", time: "2:00 PM", timestamp: now - 5 * hour, status: "read", reactions: [], evidenceTag: { type: "idea", label: "Key Idea", timestamp: now - 5 * hour, hash: "sha256:f1a2b3" }, blockchainHash: "0xc5d6…a1b2" },
    { id: "cm2", senderId: "u6", text: "The informed consent section needs more detail on long-term monitoring.", time: "2:15 PM", timestamp: now - 4.75 * hour, status: "read", reactions: [{ emoji: "👍", users: ["me"] }] },
    { id: "cm3", senderId: "me", text: "I agree. Let me add the 5-year follow-up protocol we discussed.", time: "2:30 PM", timestamp: now - 4.5 * hour, status: "read", reactions: [], blockchainHash: "0xd7e8…c3d4" },
    { id: "cm4", senderId: "u7", text: "Draft submitted to committee", time: "3:00 PM", timestamp: now - 4 * hour, status: "read", reactions: [{ emoji: "🎉", users: ["u5", "u6", "me"] }] },
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
