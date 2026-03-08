import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Phone, Video, MoreVertical, Send, Smile, Paperclip, Mic,
  Image as ImageIcon, File, MapPin, Camera, X, Check, CheckCheck,
  Reply, Forward, Trash2, Edit3, Pin, Copy, Star, ArrowLeft,
  Plus, Users, Settings, Bell, BellOff, Archive, Volume2, VolumeX,
  MessageCircle, Circle, ChevronDown, AtSign, Hash, Bookmark,
  ThumbsUp, Heart, Laugh, Flame, AlertCircle, Gift
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

/* ─── Types ─── */
interface Contact {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  status: "online" | "away" | "offline" | "busy";
  lastSeen?: string;
  role?: string;
}

interface Reaction {
  emoji: string;
  users: string[];
}

interface Message {
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
  attachments?: { type: "image" | "file" | "voice" | "location"; name: string; url?: string; duration?: string; size?: string }[];
  forwarded?: boolean;
  deleted?: boolean;
}

interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string;
  initials: string;
  avatar?: string;
  participants: Contact[];
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  online?: boolean;
  typing?: boolean;
}

/* ─── Mock Data ─── */
const currentUser: Contact = {
  id: "me", name: "You", initials: "YO", status: "online", role: "Researcher"
};

const contacts: Contact[] = [
  { id: "u1", name: "Dr. Sarah Chen", initials: "SC", status: "online", role: "ML Researcher" },
  { id: "u2", name: "Prof. Marcus Lee", initials: "ML", status: "online", role: "Computer Science" },
  { id: "u3", name: "Dr. Elena Volkov", initials: "EV", status: "away", lastSeen: "15m ago", role: "Climate Science" },
  { id: "u4", name: "Dr. Yuki Tanaka", initials: "YT", status: "online", role: "Bioinformatics" },
  { id: "u5", name: "Prof. Omar Hassan", initials: "OH", status: "offline", lastSeen: "2h ago", role: "Bioethics" },
  { id: "u6", name: "Dr. Lisa Park", initials: "LP", status: "busy", role: "Neuroscience" },
  { id: "u7", name: "Dr. Priya Sharma", initials: "PS", status: "online", role: "Gene Therapy" },
  { id: "u8", name: "Dr. James Okafor", initials: "JK", status: "offline", lastSeen: "1d ago", role: "Publishing" },
];

const conversations: Conversation[] = [
  { id: "c1", type: "direct", name: "Dr. Sarah Chen", initials: "SC", participants: [contacts[0]], lastMessage: "I'll send you the dataset link shortly", lastMessageTime: "2m ago", unread: 2, pinned: true, muted: false, archived: false, online: true, typing: true },
  { id: "c2", type: "group", name: "ML Research Lab", initials: "ML", participants: [contacts[0], contacts[1], contacts[3]], lastMessage: "Prof. Lee: Meeting moved to Thursday", lastMessageTime: "15m ago", unread: 5, pinned: true, muted: false, archived: false },
  { id: "c3", type: "direct", name: "Dr. Elena Volkov", initials: "EV", participants: [contacts[2]], lastMessage: "Thanks for the review feedback!", lastMessageTime: "1h ago", unread: 0, pinned: false, muted: false, archived: false, online: false },
  { id: "c4", type: "group", name: "CRISPR Ethics Committee", initials: "CE", participants: [contacts[4], contacts[5], contacts[6]], lastMessage: "Dr. Park: Draft submitted to committee", lastMessageTime: "3h ago", unread: 1, pinned: false, muted: false, archived: false },
  { id: "c5", type: "direct", name: "Prof. Omar Hassan", initials: "OH", participants: [contacts[4]], lastMessage: "You: I agree with your assessment", lastMessageTime: "5h ago", unread: 0, pinned: false, muted: true, archived: false, online: false },
  { id: "c6", type: "direct", name: "Dr. Yuki Tanaka", initials: "YT", participants: [contacts[3]], lastMessage: "The Rayyan comparison is ready", lastMessageTime: "8h ago", unread: 0, pinned: false, muted: false, archived: false, online: true },
  { id: "c7", type: "group", name: "Grant Writing Team", initials: "GW", participants: [contacts[0], contacts[5], contacts[7]], lastMessage: "Dr. Okafor: Budget section needs revision", lastMessageTime: "1d ago", unread: 0, pinned: false, muted: false, archived: false },
  { id: "c8", type: "direct", name: "Dr. Priya Sharma", initials: "PS", participants: [contacts[6]], lastMessage: "The LNP delivery paper is published!", lastMessageTime: "2d ago", unread: 0, pinned: false, muted: false, archived: true, online: true },
];

const messagesData: Record<string, Message[]> = {
  c1: [
    { id: "m1", senderId: "u1", text: "Hey! Have you seen the latest results from our reproducibility experiment?", time: "10:30 AM", timestamp: 1, status: "read", reactions: [{ emoji: "👍", users: ["me"] }], attachments: [] },
    { id: "m2", senderId: "me", text: "Yes! The variance is much lower now. Great work on the containerization.", time: "10:32 AM", timestamp: 2, status: "read", reactions: [], attachments: [] },
    { id: "m3", senderId: "u1", text: "Thanks! I've also set up automatic seed logging.", time: "10:33 AM", timestamp: 3, status: "read", reactions: [], attachments: [] },
    { id: "m4", senderId: "u1", text: "Here's the comparison chart from the last 3 runs:", time: "10:34 AM", timestamp: 4, status: "read", reactions: [], attachments: [{ type: "image", name: "comparison_chart.png" }] },
    { id: "m5", senderId: "me", text: "This looks amazing! The standard deviation dropped by 78%. Should we submit this to the reproducibility workshop?", time: "10:36 AM", timestamp: 5, status: "read", reactions: [{ emoji: "🔥", users: ["u1"] }, { emoji: "❤️", users: ["u1"] }], attachments: [] },
    { id: "m6", senderId: "u1", text: "Absolutely! I'll prepare the abstract. Can you handle the methodology section?", time: "10:37 AM", timestamp: 6, status: "read", reactions: [], attachments: [] },
    { id: "m7", senderId: "me", text: "Sure, I'll draft it by Friday. Let me also add the DVC pipeline diagram.", time: "10:38 AM", timestamp: 7, status: "delivered", reactions: [], attachments: [] },
    { id: "m8", senderId: "u1", text: "Perfect. I also attached the full experiment config file.", time: "10:40 AM", timestamp: 8, status: "read", reactions: [], attachments: [{ type: "file", name: "experiment_config.yaml", size: "12 KB" }] },
    { id: "m9", senderId: "me", text: "Got it. I'll review it tonight.", time: "10:41 AM", timestamp: 9, status: "delivered", reactions: [], attachments: [] },
    { id: "m10", senderId: "u1", text: "I'll send you the dataset link shortly", time: "10:45 AM", timestamp: 10, status: "read", reactions: [], attachments: [] },
  ],
  c2: [
    { id: "gm1", senderId: "u2", text: "Team, I've rescheduled the weekly sync to Thursday 3PM.", time: "9:00 AM", timestamp: 1, status: "read", reactions: [{ emoji: "👍", users: ["me", "u1", "u4"] }], attachments: [] },
    { id: "gm2", senderId: "u1", text: "Works for me! I'll prepare the reproducibility update.", time: "9:05 AM", timestamp: 2, status: "read", reactions: [], attachments: [] },
    { id: "gm3", senderId: "u4", text: "Thursday works. Also, I have results from the bioinformatics pipeline to share.", time: "9:10 AM", timestamp: 3, status: "read", reactions: [{ emoji: "🎉", users: ["u2"] }], attachments: [] },
    { id: "gm4", senderId: "u2", text: "Great, let's allocate 15 min for each update. @Sarah can you also demo the new Docker setup?", time: "9:15 AM", timestamp: 4, status: "read", reactions: [], attachments: [] },
    { id: "gm5", senderId: "me", text: "I'll have the MLflow migration report ready by then.", time: "9:20 AM", timestamp: 5, status: "read", reactions: [{ emoji: "👍", users: ["u2"] }], attachments: [] },
    { id: "gm6", senderId: "u2", text: "Meeting moved to Thursday", time: "9:25 AM", timestamp: 6, status: "read", reactions: [], attachments: [], pinned: true },
  ],
};

/* ─── Emoji Reactions Palette ─── */
const quickReactions = ["👍", "❤️", "😂", "🔥", "😮", "😢", "🎉", "💡"];

/* ─── Status colors ─── */
const statusColor: Record<string, string> = {
  online: "bg-emerald-brand",
  away: "bg-gold",
  busy: "bg-destructive",
  offline: "bg-muted-foreground/40",
};

/* ─── Conversation List Item ─── */
const ConversationItem = ({ conv, isActive, onClick }: {
  conv: Conversation; isActive: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
      isActive ? "bg-accent/10 border border-accent/20" : "hover:bg-secondary/50 border border-transparent"
    }`}
  >
    <div className="relative flex-shrink-0">
      <Avatar className="w-11 h-11">
        <AvatarFallback className={`font-display font-semibold text-xs ${
          conv.type === "group" ? "bg-info-muted text-info" : "bg-scholarly text-primary-foreground"
        }`}>
          {conv.initials}
        </AvatarFallback>
      </Avatar>
      {conv.type === "direct" && conv.online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-brand rounded-full ring-2 ring-card" />
      )}
      {conv.type === "group" && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-card rounded-full flex items-center justify-center ring-1 ring-border">
          <Users className="w-2.5 h-2.5 text-muted-foreground" />
        </span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {conv.pinned && <Pin className="w-2.5 h-2.5 text-gold flex-shrink-0" />}
          <span className={`text-sm font-display truncate ${conv.unread > 0 ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
            {conv.name}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-display flex-shrink-0 ml-2">{conv.lastMessageTime}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {conv.typing ? (
            <span className="text-xs text-accent font-display italic flex items-center gap-1">
              <span className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-1 h-1 rounded-full bg-accent" animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} />
                ))}
              </span>
              typing...
            </span>
          ) : (
            <p className={`text-xs truncate ${conv.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {conv.lastMessage}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {conv.muted && <VolumeX className="w-3 h-3 text-muted-foreground/50" />}
          {conv.unread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-mono font-bold flex items-center justify-center">
              {conv.unread > 99 ? "99+" : conv.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  </button>
);

/* ─── Message Bubble ─── */
const MessageBubble = ({ msg, isMine, onReply, onReact, onDelete, onEdit, onForward, onPin }: {
  msg: Message; isMine: boolean;
  onReply: () => void; onReact: (emoji: string) => void;
  onDelete: () => void; onEdit: () => void;
  onForward: () => void; onPin: () => void;
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  if (msg.deleted) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}>
        <div className="px-3 py-2 rounded-xl bg-secondary/30 border border-border/30 max-w-[75%]">
          <p className="text-xs text-muted-foreground/60 font-display italic flex items-center gap-1.5">
            <Trash2 className="w-3 h-3" /> This message was deleted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1 group/msg relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false); }}
    >
      <div className={`max-w-[75%] sm:max-w-[65%] ${isMine ? "order-2" : ""}`}>
        {/* Reply preview */}
        {msg.replyTo && (
          <div className={`mb-1 ${isMine ? "ml-auto" : ""}`}>
            <div className="bg-secondary/40 border-l-2 border-accent/40 rounded-md px-2.5 py-1.5 max-w-full">
              <p className="text-[10px] font-display font-semibold text-accent/80">{msg.replyTo.author}</p>
              <p className="text-[11px] font-display text-muted-foreground line-clamp-1">{msg.replyTo.text}</p>
            </div>
          </div>
        )}

        {/* Forwarded label */}
        {msg.forwarded && (
          <div className={`flex items-center gap-1 text-[10px] text-muted-foreground font-display mb-0.5 ${isMine ? "justify-end" : ""}`}>
            <Forward className="w-2.5 h-2.5" /> Forwarded
          </div>
        )}

        {/* Bubble */}
        <div className={`rounded-2xl px-3.5 py-2 relative ${
          isMine
            ? "bg-accent text-accent-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md"
        }`}>
          {/* Pin indicator */}
          {msg.pinned && (
            <div className="absolute -top-2 -right-1">
              <Pin className="w-3 h-3 text-gold fill-gold" />
            </div>
          )}

          {/* Attachments */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {msg.attachments.map((att, i) => (
                <div key={i}>
                  {att.type === "image" && (
                    <div className="rounded-lg overflow-hidden bg-secondary/20 w-full max-w-[280px]">
                      <div className="aspect-video bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                        <ImageIcon className={`w-8 h-8 ${isMine ? "text-accent-foreground/30" : "text-muted-foreground/30"}`} />
                      </div>
                      <p className={`text-[10px] px-2 py-1 truncate ${isMine ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{att.name}</p>
                    </div>
                  )}
                  {att.type === "file" && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isMine ? "bg-accent-foreground/10" : "bg-secondary/50"
                    }`}>
                      <File className={`w-5 h-5 flex-shrink-0 ${isMine ? "text-accent-foreground/70" : "text-accent"}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-display font-medium truncate ${isMine ? "text-accent-foreground" : "text-foreground"}`}>{att.name}</p>
                        {att.size && <p className={`text-[10px] ${isMine ? "text-accent-foreground/60" : "text-muted-foreground"}`}>{att.size}</p>}
                      </div>
                    </div>
                  )}
                  {att.type === "voice" && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isMine ? "bg-accent-foreground/10" : "bg-secondary/50"
                    }`}>
                      <Mic className={`w-4 h-4 flex-shrink-0 ${isMine ? "text-accent-foreground/70" : "text-accent"}`} />
                      <div className="flex-1 h-1 bg-secondary/50 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-accent/40 rounded-full" />
                      </div>
                      <span className={`text-[10px] font-mono ${isMine ? "text-accent-foreground/60" : "text-muted-foreground"}`}>{att.duration}</span>
                    </div>
                  )}
                  {att.type === "location" && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isMine ? "bg-accent-foreground/10" : "bg-secondary/50"
                    }`}>
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${isMine ? "text-accent-foreground/70" : "text-accent"}`} />
                      <span className={`text-xs font-display ${isMine ? "text-accent-foreground" : "text-foreground"}`}>{att.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text */}
          <p className={`text-[13px] font-display leading-relaxed whitespace-pre-wrap ${isMine ? "text-accent-foreground" : "text-foreground"}`}>
            {msg.text}
          </p>

          {/* Time + Status */}
          <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
            {msg.edited && <span className={`text-[9px] ${isMine ? "text-accent-foreground/40" : "text-muted-foreground/60"}`}>edited</span>}
            <span className={`text-[10px] ${isMine ? "text-accent-foreground/50" : "text-muted-foreground"}`}>{msg.time}</span>
            {isMine && (
              <span className="flex items-center">
                {msg.status === "sending" && <Circle className="w-2.5 h-2.5 text-accent-foreground/30" />}
                {msg.status === "sent" && <Check className="w-3 h-3 text-accent-foreground/50" />}
                {msg.status === "delivered" && <CheckCheck className="w-3 h-3 text-accent-foreground/50" />}
                {msg.status === "read" && <CheckCheck className="w-3 h-3 text-accent-foreground/80" />}
              </span>
            )}
          </div>
        </div>

        {/* Reactions */}
        {msg.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
            {msg.reactions.map((r, i) => (
              <button
                key={i}
                onClick={() => onReact(r.emoji)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] transition-colors border ${
                  r.users.includes("me")
                    ? "bg-accent/10 border-accent/20 text-foreground"
                    : "bg-secondary/50 border-border hover:bg-secondary text-foreground/80"
                }`}
              >
                <span>{r.emoji}</span>
                <span className="font-mono text-[9px]">{r.users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick actions (hover) */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute top-0 ${isMine ? "left-0 -translate-x-full" : "right-0 translate-x-full"} flex items-center gap-0.5 px-1 z-10`}
            >
              <button onClick={() => setShowReactions(!showReactions)} className="p-1 rounded-md bg-card border border-border shadow-sm hover:bg-secondary transition-colors">
                <Smile className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={onReply} className="p-1 rounded-md bg-card border border-border shadow-sm hover:bg-secondary transition-colors">
                <Reply className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={onForward} className="p-1 rounded-md bg-card border border-border shadow-sm hover:bg-secondary transition-colors">
                <Forward className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {isMine && (
                <button onClick={onEdit} className="p-1 rounded-md bg-card border border-border shadow-sm hover:bg-secondary transition-colors">
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
              <button onClick={onPin} className="p-1 rounded-md bg-card border border-border shadow-sm hover:bg-secondary transition-colors">
                <Pin className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {isMine && (
                <button onClick={onDelete} className="p-1 rounded-md bg-card border border-border shadow-sm hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className={`absolute ${isMine ? "right-0" : "left-0"} -top-10 z-20 flex gap-0.5 px-2 py-1.5 rounded-full bg-card border border-border shadow-scholarly`}
            >
              {quickReactions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { onReact(emoji); setShowReactions(false); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary transition-colors text-base hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── Typing Indicator ─── */
const ChatTypingIndicator = ({ name }: { name: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    className="flex items-center gap-2 px-4 py-1"
  >
    <Avatar className="w-5 h-5">
      <AvatarFallback className="bg-scholarly text-primary-foreground text-[7px] font-display font-semibold">
        {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
      </AvatarFallback>
    </Avatar>
    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-3 py-2 flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
        />
      ))}
    </div>
  </motion.div>
);

/* ─── Attachment menu ─── */
const AttachmentMenu = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 8, scale: 0.95 }}
    className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-xl shadow-scholarly p-2 grid grid-cols-3 gap-1 min-w-[200px]"
  >
    {[
      { icon: ImageIcon, label: "Photo", color: "text-accent" },
      { icon: Camera, label: "Camera", color: "text-accent" },
      { icon: File, label: "Document", color: "text-info" },
      { icon: MapPin, label: "Location", color: "text-destructive" },
      { icon: Users, label: "Contact", color: "text-gold" },
      { icon: Gift, label: "GIF", color: "text-emerald-brand" },
    ].map(item => (
      <button
        key={item.label}
        onClick={() => { toast.info(`${item.label} picker would open here`); onClose(); }}
        className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
      >
        <div className={`w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center ${item.color}`}>
          <item.icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-display text-muted-foreground">{item.label}</span>
      </button>
    ))}
  </motion.div>
);

/* ─── Main Messenger Component ─── */
const Messenger = () => {
  const isMobile = useIsMobile();
  const [activeConvId, setActiveConvId] = useState<string | null>(isMobile ? null : "c1");
  const [msgs, setMsgs] = useState<Record<string, Message[]>>(messagesData);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [convFilter, setConvFilter] = useState<"all" | "unread" | "groups">("all");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 200);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeMessages = activeConvId ? (msgs[activeConvId] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, activeConvId]);

  const filteredConversations = useMemo(() => {
    let result = conversations.filter(c => !c.archived);
    if (convFilter === "unread") result = result.filter(c => c.unread > 0);
    if (convFilter === "groups") result = result.filter(c => c.type === "group");
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
    }
    result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return result;
  }, [debouncedSearch, convFilter]);

  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !activeConvId) return;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      senderId: "me",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      status: "sent",
      reactions: [],
      replyTo: replyingTo ? { id: replyingTo.id, author: replyingTo.senderId === "me" ? "You" : (activeConv?.name || ""), text: replyingTo.text } : undefined,
      edited: !!editingMsg,
    };

    if (editingMsg) {
      setMsgs(prev => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map(m => m.id === editingMsg.id ? { ...m, text: inputText.trim(), edited: true } : m)
      }));
      setEditingMsg(null);
    } else {
      setMsgs(prev => ({ ...prev, [activeConvId]: [...(prev[activeConvId] || []), newMsg] }));
    }

    setInputText("");
    setReplyingTo(null);
    setShowAttachments(false);

    // Simulate delivery
    setTimeout(() => {
      setMsgs(prev => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map(m => m.id === newMsg.id ? { ...m, status: "delivered" } : m)
      }));
    }, 1000);
    setTimeout(() => {
      setMsgs(prev => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map(m => m.id === newMsg.id ? { ...m, status: "read" } : m)
      }));
    }, 3000);
  }, [inputText, activeConvId, replyingTo, editingMsg, activeConv]);

  const handleReact = useCallback((msgId: string, emoji: string) => {
    if (!activeConvId) return;
    setMsgs(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).map(m => {
        if (m.id !== msgId) return m;
        const existing = m.reactions.find(r => r.emoji === emoji);
        if (existing) {
          if (existing.users.includes("me")) {
            const updated = existing.users.filter(u => u !== "me");
            return { ...m, reactions: updated.length ? m.reactions.map(r => r.emoji === emoji ? { ...r, users: updated } : r) : m.reactions.filter(r => r.emoji !== emoji) };
          }
          return { ...m, reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, users: [...r.users, "me"] } : r) };
        }
        return { ...m, reactions: [...m.reactions, { emoji, users: ["me"] }] };
      })
    }));
  }, [activeConvId]);

  const handleDelete = useCallback((msgId: string) => {
    if (!activeConvId) return;
    setMsgs(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).map(m => m.id === msgId ? { ...m, deleted: true } : m)
    }));
    toast.success("Message deleted");
  }, [activeConvId]);

  const handlePin = useCallback((msgId: string) => {
    if (!activeConvId) return;
    setMsgs(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).map(m => m.id === msgId ? { ...m, pinned: !m.pinned } : m)
    }));
    toast.success("Message pinned");
  }, [activeConvId]);

  const showConvList = isMobile ? !activeConvId : true;
  const showChat = isMobile ? !!activeConvId : true;

  // Emoji grid (basic)
  const emojiCategories = [
    { label: "Smileys", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮"] },
    { label: "Gestures", emojis: ["👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✌️", "🤟", "🤘", "👌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪", "🦾", "🖕"] },
    { label: "Objects", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🔥", "⭐", "🌟", "✨", "💫", "🎉", "🎊", "🏆", "💡", "📚", "🔬", "🧬", "⚗️", "🧪"] },
  ];

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex h-[calc(100vh-120px)] sm:h-[calc(100vh-100px)] rounded-xl border border-border overflow-hidden bg-card">

          {/* ─── Conversation Sidebar ─── */}
          {showConvList && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${isMobile ? "w-full" : "w-[340px]"} flex-shrink-0 border-r border-border flex flex-col bg-card`}
            >
              {/* Header */}
              <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="font-serif text-lg font-bold text-foreground">Messages</h1>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => toast.info("New conversation")} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">New message</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary/50 border border-border text-xs font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1">
                  {(["all", "unread", "groups"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setConvFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-display font-medium transition-all capitalize ${
                        convFilter === f ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground font-display text-xs">No conversations found</div>
                ) : (
                  filteredConversations.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConvId}
                      onClick={() => setActiveConvId(conv.id)}
                    />
                  ))
                )}
              </div>

              {/* Online contacts strip */}
              <div className="p-3 border-t border-border">
                <p className="text-[10px] font-display text-muted-foreground uppercase tracking-wider mb-2">Active Now</p>
                <div className="flex gap-2 overflow-x-auto">
                  {contacts.filter(c => c.status === "online").map(c => (
                    <Tooltip key={c.id}>
                      <TooltipTrigger>
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-scholarly text-primary-foreground text-[9px] font-display font-semibold">{c.initials}</AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-brand rounded-full ring-2 ring-card" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">{c.name}</p></TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Chat Area ─── */}
          {showChat && (
            <div className="flex-1 flex flex-col min-w-0">
              {activeConv ? (
                <>
                  {/* Chat header */}
                  <div className="h-14 px-3 sm:px-4 flex items-center justify-between border-b border-border bg-card flex-shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isMobile && (
                        <button onClick={() => setActiveConvId(null)} className="p-1 rounded-md hover:bg-secondary transition-colors mr-1">
                          <ArrowLeft className="w-5 h-5 text-foreground" />
                        </button>
                      )}
                      <div className="relative">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className={`font-display font-semibold text-xs ${
                            activeConv.type === "group" ? "bg-info-muted text-info" : "bg-scholarly text-primary-foreground"
                          }`}>
                            {activeConv.initials}
                          </AvatarFallback>
                        </Avatar>
                        {activeConv.type === "direct" && activeConv.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-brand rounded-full ring-2 ring-card" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-display font-semibold text-foreground truncate">{activeConv.name}</h2>
                        <p className="text-[10px] text-muted-foreground font-display">
                          {activeConv.type === "group"
                            ? `${activeConv.participants.length + 1} members`
                            : activeConv.online ? "Online" : activeConv.participants[0]?.lastSeen ? `Last seen ${activeConv.participants[0].lastSeen}` : "Offline"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                            <Phone className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">Voice call</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                            <Video className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">Video call</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                            <Search className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">Search in chat</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">More options</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-0.5">
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-3">
                      <span className="px-3 py-1 rounded-full bg-secondary/50 text-[10px] font-display text-muted-foreground">Today</span>
                    </div>

                    {activeMessages.map(msg => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isMine={msg.senderId === "me"}
                        onReply={() => { setReplyingTo(msg); inputRef.current?.focus(); }}
                        onReact={(emoji) => handleReact(msg.id, emoji)}
                        onDelete={() => handleDelete(msg.id)}
                        onEdit={() => { setEditingMsg(msg); setInputText(msg.text); inputRef.current?.focus(); }}
                        onForward={() => toast.info("Select a conversation to forward to")}
                        onPin={() => handlePin(msg.id)}
                      />
                    ))}

                    {/* Typing indicator */}
                    <AnimatePresence>
                      {activeConv.typing && (
                        <ChatTypingIndicator name={activeConv.name} />
                      )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply/Edit bar */}
                  <AnimatePresence>
                    {(replyingTo || editingMsg) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="px-4 py-2 flex items-center gap-2 bg-secondary/20">
                          <div className="w-1 h-8 rounded-full bg-accent flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-display font-semibold text-accent">
                              {editingMsg ? "Editing message" : `Replying to ${replyingTo?.senderId === "me" ? "yourself" : activeConv.name}`}
                            </p>
                            <p className="text-xs font-display text-muted-foreground truncate">{editingMsg?.text || replyingTo?.text}</p>
                          </div>
                          <button onClick={() => { setReplyingTo(null); setEditingMsg(null); setInputText(""); }} className="p-1 hover:bg-secondary rounded-md transition-colors">
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input area */}
                  <div className="px-3 sm:px-4 py-2.5 border-t border-border bg-card flex-shrink-0">
                    <div className="flex items-end gap-2">
                      {/* Attachment button */}
                      <div className="relative flex-shrink-0">
                        <AnimatePresence>
                          {showAttachments && <AttachmentMenu onClose={() => setShowAttachments(false)} />}
                        </AnimatePresence>
                        <button
                          onClick={() => { setShowAttachments(!showAttachments); setShowEmojiPicker(false); }}
                          className={`p-2 rounded-lg transition-colors ${showAttachments ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Input field */}
                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          value={inputText}
                          onChange={e => setInputText(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                          placeholder="Type a message..."
                          className="w-full h-10 px-4 rounded-xl bg-secondary/50 border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      {/* Emoji button */}
                      <div className="relative flex-shrink-0">
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.95 }}
                              className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-xl shadow-scholarly p-3 w-[280px] max-h-[320px] overflow-y-auto"
                            >
                              {emojiCategories.map(cat => (
                                <div key={cat.label} className="mb-3">
                                  <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{cat.label}</p>
                                  <div className="flex flex-wrap gap-0.5">
                                    {cat.emojis.map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => { setInputText(prev => prev + emoji); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors text-lg"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <button
                          onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachments(false); }}
                          className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Send / Voice button */}
                      {inputText.trim() ? (
                        <button
                          onClick={sendMessage}
                          className="p-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity flex-shrink-0"
                        >
                          <Send className="w-4.5 h-4.5" />
                        </button>
                      ) : (
                        <button
                          onMouseDown={() => { setIsRecording(true); toast.info("🎙 Recording..."); }}
                          onMouseUp={() => { setIsRecording(false); toast.info("Voice message recorded"); }}
                          onMouseLeave={() => isRecording && setIsRecording(false)}
                          className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                            isRecording ? "bg-destructive text-destructive-foreground scale-110" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                          }`}
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                  <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h2 className="font-display font-semibold text-foreground mb-1">Your Messages</h2>
                  <p className="text-sm text-muted-foreground font-display max-w-[300px]">
                    Select a conversation to start chatting, or create a new message.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default Messenger;
