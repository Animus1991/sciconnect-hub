import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Smile, Paperclip, Search, ArrowLeft,
  Check, CheckCheck, Pin, Bookmark, Shield, ShieldCheck, ShieldAlert,
  Link2, FileText, Download, Hash, MoreVertical, Phone, Video,
  ChevronDown, Circle, Mic, Image as ImageIcon, File, Users,
  Lock, Unlock, Eye, EyeOff, Zap, Copy, ExternalLink
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/* ─── Types ─── */
type BlockchainLevel = "off" | "unilateral" | "mutual";
type EvidenceTag = "key-idea" | "hypothesis" | "result" | "method" | "data";
type ChatView = "list" | "chat" | "online";

interface FloatingContact {
  id: string;
  name: string;
  initials: string;
  status: "online" | "away" | "offline" | "busy";
  role?: string;
  lastSeen?: string;
}

interface FloatingMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
  reactions: { emoji: string; count: number }[];
  evidenceTag?: EvidenceTag;
  blockchainHash?: string;
  pinned?: boolean;
  replyTo?: { author: string; text: string };
}

interface FloatingConversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online: boolean;
  typing: boolean;
  pinned: boolean;
  blockchainLevel: BlockchainLevel;
  linkedProject?: string;
}

/* ─── Mock Data ─── */
const onlineUsers: FloatingContact[] = [
  { id: "u1", name: "Dr. Sarah Chen", initials: "SC", status: "online", role: "ML Researcher" },
  { id: "u2", name: "Prof. Marcus Lee", initials: "ML", status: "online", role: "Computer Science" },
  { id: "u4", name: "Dr. Yuki Tanaka", initials: "YT", status: "online", role: "Bioinformatics" },
  { id: "u7", name: "Dr. Priya Sharma", initials: "PS", status: "online", role: "Gene Therapy" },
  { id: "u3", name: "Dr. Elena Volkov", initials: "EV", status: "away", role: "Climate Science", lastSeen: "15m ago" },
  { id: "u6", name: "Dr. Lisa Park", initials: "LP", status: "busy", role: "Neuroscience" },
];

const mockConversations: FloatingConversation[] = [
  { id: "c1", name: "Dr. Sarah Chen", initials: "SC", lastMessage: "I'll send you the dataset link shortly", lastMessageTime: "2m", unread: 2, online: true, typing: true, pinned: true, blockchainLevel: "mutual", linkedProject: "ML Reproducibility" },
  { id: "c2", name: "ML Research Lab", initials: "ML", lastMessage: "Meeting moved to Thursday", lastMessageTime: "15m", unread: 5, online: false, typing: false, pinned: true, blockchainLevel: "off" },
  { id: "c3", name: "Dr. Elena Volkov", initials: "EV", lastMessage: "Thanks for the review feedback!", lastMessageTime: "1h", unread: 0, online: false, typing: false, pinned: false, blockchainLevel: "unilateral" },
  { id: "c4", name: "CRISPR Ethics Committee", initials: "CE", lastMessage: "Draft submitted to committee", lastMessageTime: "3h", unread: 1, online: false, typing: false, pinned: false, blockchainLevel: "off" },
  { id: "c5", name: "Dr. Yuki Tanaka", initials: "YT", lastMessage: "The comparison is ready", lastMessageTime: "8h", unread: 0, online: true, typing: false, pinned: false, blockchainLevel: "off" },
];

const mockMessages: Record<string, FloatingMessage[]> = {
  c1: [
    { id: "m1", senderId: "u1", text: "Have you seen the latest results from our reproducibility experiment?", time: "10:30", status: "read", reactions: [{ emoji: "👍", count: 1 }] },
    { id: "m2", senderId: "me", text: "Yes! The variance is much lower now. Great work on the containerization.", time: "10:32", status: "read", reactions: [] },
    { id: "m3", senderId: "u1", text: "I think we should document the new seeding approach as our primary method going forward.", time: "10:33", status: "read", reactions: [], evidenceTag: "key-idea", blockchainHash: "0x7f3a...b2c1" },
    { id: "m4", senderId: "me", text: "Agreed. Let me write up the protocol changes and link them to the project.", time: "10:35", status: "read", reactions: [], evidenceTag: "method", blockchainHash: "0x8d2e...c4f5" },
    { id: "m5", senderId: "u1", text: "I'll send you the dataset link shortly", time: "10:40", status: "read", reactions: [], blockchainHash: "0x9a1b...d6e7" },
  ],
  c2: [
    { id: "m1", senderId: "u2", text: "Team meeting moved to Thursday 3pm", time: "09:15", status: "read", reactions: [] },
    { id: "m2", senderId: "u4", text: "Works for me!", time: "09:20", status: "read", reactions: [{ emoji: "👍", count: 2 }] },
  ],
  c3: [
    { id: "m1", senderId: "me", text: "I've reviewed section 3 — the methodology is solid.", time: "14:00", status: "read", reactions: [] },
    { id: "m2", senderId: "u3", text: "Thanks for the review feedback!", time: "14:15", status: "read", reactions: [{ emoji: "🙏", count: 1 }] },
  ],
};

const evidenceTagConfig: Record<EvidenceTag, { label: string; color: string; icon: typeof Zap }> = {
  "key-idea": { label: "Key Idea", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", icon: Zap },
  "hypothesis": { label: "Hypothesis", color: "text-blue-500 bg-blue-500/10 border-blue-500/30", icon: Eye },
  "result": { label: "Result", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", icon: Check },
  "method": { label: "Method", color: "text-purple-500 bg-purple-500/10 border-purple-500/30", icon: FileText },
  "data": { label: "Data", color: "text-rose-500 bg-rose-500/10 border-rose-500/30", icon: Hash },
};

const blockchainConfig: Record<BlockchainLevel, { label: string; description: string; icon: typeof Shield; color: string }> = {
  off: { label: "Standard", description: "No blockchain verification", icon: Shield, color: "text-muted-foreground" },
  unilateral: { label: "My Messages Verified", description: "Only your messages are hashed & timestamped", icon: ShieldCheck, color: "text-amber-500" },
  mutual: { label: "P2P Verified", description: "All messages verified — both parties consented", icon: ShieldAlert, color: "text-emerald-500" },
};

/* ─── Component ─── */
const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatView>("list");
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBlockchainMenu, setShowBlockchainMenu] = useState(false);
  const [showEvidenceMenu, setShowEvidenceMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const blockchainRef = useRef<HTMLDivElement>(null);
  const evidenceRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const activeConversation = conversations.find(c => c.id === activeConvo);
  const activeMessages = activeConvo ? (messages[activeConvo] || []) : [];
  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (blockchainRef.current && !blockchainRef.current.contains(e.target as Node)) setShowBlockchainMenu(false);
      if (evidenceRef.current && !evidenceRef.current.contains(e.target as Node)) setShowEvidenceMenu(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openChat = (convoId: string) => {
    setActiveConvo(convoId);
    setView("chat");
    setConversations(prev => prev.map(c => c.id === convoId ? { ...c, unread: 0 } : c));
  };

  const sendMessage = useCallback(() => {
    if (!message.trim() || !activeConvo) return;
    const convo = conversations.find(c => c.id === activeConvo);
    const isBlockchain = convo?.blockchainLevel !== "off";
    const newMsg: FloatingMessage = {
      id: `m${Date.now()}`,
      senderId: "me",
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
      reactions: [],
      ...(isBlockchain && convo?.blockchainLevel === "mutual" ? {
        blockchainHash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`
      } : {}),
      ...(isBlockchain && convo?.blockchainLevel === "unilateral" ? {
        blockchainHash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`
      } : {}),
    };
    setMessages(prev => ({
      ...prev,
      [activeConvo]: [...(prev[activeConvo] || []), newMsg],
    }));
    setMessage("");
    if (isBlockchain) {
      toast.success("Message hashed & anchored", { description: `SHA-256: ${newMsg.blockchainHash}` });
    }
  }, [message, activeConvo, conversations]);

  const setBlockchainLevel = (level: BlockchainLevel) => {
    if (!activeConvo) return;
    const convo = conversations.find(c => c.id === activeConvo);
    if (level === "mutual" && convo?.blockchainLevel !== "mutual") {
      toast.info("P2P Verification Request Sent", { description: "Both parties must accept to enable mutual verification." });
    }
    setConversations(prev => prev.map(c =>
      c.id === activeConvo ? { ...c, blockchainLevel: level } : c
    ));
    setShowBlockchainMenu(false);
    if (level !== "off") {
      toast.success(`Blockchain: ${blockchainConfig[level].label}`, { description: blockchainConfig[level].description });
    }
  };

  const tagMessageAsEvidence = (msgId: string, tag: EvidenceTag) => {
    if (!activeConvo) return;
    setMessages(prev => ({
      ...prev,
      [activeConvo]: prev[activeConvo].map(m =>
        m.id === msgId ? { ...m, evidenceTag: tag } : m
      ),
    }));
    setShowEvidenceMenu(false);
    toast.success(`Tagged as ${evidenceTagConfig[tag].label}`, { description: "Attribution recorded" });
  };

  const exportChat = () => {
    toast.success("Chat Exported", { description: "Downloading as verified PDF with timestamps..." });
    setShowMoreMenu(false);
  };

  const linkToProject = () => {
    toast.success("Linked to Project", { description: `Conversation linked to "${activeConversation?.linkedProject || "Select Project"}"` });
    setShowMoreMenu(false);
  };

  const statusColor = (s: string) =>
    s === "online" ? "bg-emerald-500" : s === "away" ? "bg-amber-500" : s === "busy" ? "bg-rose-500" : "bg-muted-foreground/30";

  /* ─── Render ─── */
  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-[100] flex items-end gap-3">
        {/* Online Users Mini-Bar */}
        <AnimatePresence>
          {isOpen && view === "list" && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="hidden lg:flex flex-col items-center gap-2 pb-2"
            >
              <div className="bg-card border border-border rounded-2xl shadow-lg p-2 space-y-1.5">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-display font-semibold text-center px-1">Online</p>
                {onlineUsers.filter(u => u.status === "online").slice(0, 5).map(user => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          const convo = conversations.find(c => c.name.includes(user.name.split(" ").pop()!));
                          if (convo) openChat(convo.id);
                        }}
                        className="relative group"
                      >
                        <Avatar className="w-9 h-9 border-2 border-background group-hover:border-primary/30 transition-colors">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-display font-semibold">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${statusColor(user.status)}`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-muted-foreground">{user.role}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setView("online")}
                      className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">All online users</TooltipContent>
                </Tooltip>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Popup */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-16 right-0 w-[380px] h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* ─── LIST VIEW ─── */}
              {view === "list" && (
                <>
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-foreground text-sm">Messages</h3>
                      <p className="text-[10px] text-muted-foreground">{onlineUsers.filter(u => u.status === "online").length} collaborators online</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setView("online")}
                        className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        onClick={() => { setIsOpen(false); navigate("/messages"); }}
                        className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-foreground" />
                      </button>
                    </div>
                  </div>

                  <div className="px-3 py-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full h-8 pl-8 pr-3 rounded-lg bg-secondary text-xs font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {filteredConversations.map(convo => (
                      <button
                        key={convo.id}
                        onClick={() => openChat(convo.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-display font-semibold">
                              {convo.initials}
                            </AvatarFallback>
                          </Avatar>
                          {convo.online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-display font-medium text-foreground truncate">{convo.name}</span>
                              {convo.pinned && <Pin className="w-2.5 h-2.5 text-muted-foreground" />}
                              {convo.blockchainLevel !== "off" && (
                                <ShieldCheck className={`w-3 h-3 ${convo.blockchainLevel === "mutual" ? "text-emerald-500" : "text-amber-500"}`} />
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">{convo.lastMessageTime}</span>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            {convo.typing ? (
                              <span className="text-xs text-primary italic flex items-center gap-1">
                                typing
                                <span className="flex gap-0.5">
                                  {[0, 1, 2].map(i => (
                                    <motion.span
                                      key={i}
                                      animate={{ opacity: [0.3, 1, 0.3] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                      className="w-1 h-1 rounded-full bg-primary inline-block"
                                    />
                                  ))}
                                </span>
                              </span>
                            ) : (
                              <p className="text-xs text-muted-foreground truncate pr-2">{convo.lastMessage}</p>
                            )}
                            {convo.unread > 0 && (
                              <Badge className="h-4 min-w-4 px-1 text-[9px] bg-primary text-primary-foreground rounded-full flex-shrink-0">
                                {convo.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ─── ONLINE VIEW ─── */}
              {view === "online" && (
                <>
                  <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                    <button onClick={() => setView("list")} className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
                      <ArrowLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <h3 className="font-display font-bold text-foreground text-sm">Online Collaborators</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {(["online", "away", "busy", "offline"] as const).map(status => {
                      const users = onlineUsers.filter(u => u.status === status);
                      if (users.length === 0) return null;
                      return (
                        <div key={status}>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-display font-semibold px-4 pt-3 pb-1">
                            {status === "online" ? "🟢 Online" : status === "away" ? "🟡 Away" : status === "busy" ? "🔴 Busy" : "⚫ Offline"} — {users.length}
                          </p>
                          {users.map(user => (
                            <button
                              key={user.id}
                              onClick={() => {
                                const convo = conversations.find(c => c.name.includes(user.name.split(" ").pop()!));
                                if (convo) openChat(convo.id);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors"
                            >
                              <div className="relative">
                                <Avatar className="w-9 h-9">
                                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-display font-semibold">
                                    {user.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${statusColor(user.status)}`} />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-display font-medium text-foreground">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground">{user.role}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ─── CHAT VIEW ─── */}
              {view === "chat" && activeConversation && (
                <>
                  {/* Chat Header */}
                  <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
                    <button onClick={() => { setView("list"); setActiveConvo(null); }} className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors flex-shrink-0">
                      <ArrowLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-display font-semibold">
                        {activeConversation.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-medium text-foreground truncate">{activeConversation.name}</p>
                      <div className="flex items-center gap-1.5">
                        {activeConversation.online && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        <span className="text-[10px] text-muted-foreground">
                          {activeConversation.online ? "Online" : "Offline"}
                        </span>
                        {activeConversation.blockchainLevel !== "off" && (
                          <>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className={`text-[10px] flex items-center gap-0.5 ${blockchainConfig[activeConversation.blockchainLevel].color}`}>
                              <ShieldCheck className="w-2.5 h-2.5" />
                              {blockchainConfig[activeConversation.blockchainLevel].label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Blockchain Toggle */}
                    <div ref={blockchainRef} className="relative">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setShowBlockchainMenu(p => !p)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              activeConversation.blockchainLevel !== "off"
                                ? "bg-emerald-500/10 hover:bg-emerald-500/20"
                                : "hover:bg-secondary"
                            }`}
                          >
                            {activeConversation.blockchainLevel === "off"
                              ? <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                              : <ShieldCheck className={`w-3.5 h-3.5 ${blockchainConfig[activeConversation.blockchainLevel].color}`} />
                            }
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Blockchain Verification</TooltipContent>
                      </Tooltip>
                      {showBlockchainMenu && (
                        <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                          <p className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-display font-semibold">
                            Verification Level
                          </p>
                          {(Object.entries(blockchainConfig) as [BlockchainLevel, typeof blockchainConfig["off"]][]).map(([level, cfg]) => (
                            <button
                              key={level}
                              onClick={() => setBlockchainLevel(level)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-secondary/50 transition-colors ${
                                activeConversation.blockchainLevel === level ? "bg-secondary/30" : ""
                              }`}
                            >
                              <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                              <div>
                                <p className="text-xs font-display font-medium text-foreground">{cfg.label}</p>
                                <p className="text-[10px] text-muted-foreground">{cfg.description}</p>
                              </div>
                              {activeConversation.blockchainLevel === level && (
                                <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* More Menu */}
                    <div ref={moreRef} className="relative">
                      <button
                        onClick={() => setShowMoreMenu(p => !p)}
                        className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      {showMoreMenu && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                          <button onClick={linkToProject} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-secondary/50 transition-colors">
                            <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-display text-foreground">Link to Project</span>
                          </button>
                          <button onClick={exportChat} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-secondary/50 transition-colors">
                            <Download className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-display text-foreground">Export as Lab Record</span>
                          </button>
                          <button onClick={() => { navigate("/messages"); setIsOpen(false); setShowMoreMenu(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-secondary/50 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-display text-foreground">Open Full Messenger</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Linked Project Banner */}
                  {activeConversation.linkedProject && (
                    <div className="px-3 py-1.5 bg-primary/5 border-b border-border flex items-center gap-2">
                      <Link2 className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-display text-primary">Linked to: <strong>{activeConversation.linkedProject}</strong></span>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin">
                    {activeMessages.map(msg => {
                      const isMine = msg.senderId === "me";
                      return (
                        <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] group relative`}>
                            {/* Evidence Tag */}
                            {msg.evidenceTag && (
                              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-t-lg border text-[9px] font-display font-semibold mb-0 ${evidenceTagConfig[msg.evidenceTag].color}`}>
                                {(() => { const Icon = evidenceTagConfig[msg.evidenceTag!].icon; return <Icon className="w-2.5 h-2.5" />; })()}
                                {evidenceTagConfig[msg.evidenceTag].label}
                              </div>
                            )}

                            <div className={`px-3 py-2 rounded-2xl ${
                              msg.evidenceTag ? "rounded-tl-sm" : ""
                            } ${
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-secondary text-foreground rounded-bl-sm"
                            }`}>
                              <p className="text-xs leading-relaxed">{msg.text}</p>
                              <div className={`flex items-center gap-1.5 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                                <span className={`text-[9px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                  {msg.time}
                                </span>
                                {isMine && (
                                  msg.status === "read"
                                    ? <CheckCheck className="w-3 h-3 text-primary-foreground/60" />
                                    : <Check className="w-3 h-3 text-primary-foreground/40" />
                                )}
                                {msg.blockchainHash && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <ShieldCheck className={`w-3 h-3 ${isMine ? "text-primary-foreground/60" : "text-emerald-500"}`} />
                                    </TooltipTrigger>
                                    <TooltipContent className="text-[10px]">
                                      <p className="font-semibold">Blockchain Verified</p>
                                      <p className="font-mono text-muted-foreground">{msg.blockchainHash}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>

                            {/* Reactions */}
                            {msg.reactions.length > 0 && (
                              <div className={`flex gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                                {msg.reactions.map((r, i) => (
                                  <span key={i} className="text-[10px] bg-secondary rounded-full px-1.5 py-0.5 border border-border">
                                    {r.emoji} {r.count}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Evidence tag button on hover */}
                            {activeConversation.blockchainLevel !== "off" && (
                              <div ref={msg.id === activeMessages[activeMessages.length - 1]?.id ? evidenceRef : undefined} className={`absolute top-0 ${isMine ? "-left-7" : "-right-7"} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => setShowEvidenceMenu(showEvidenceMenu === true ? false : true)}
                                      className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
                                    >
                                      <Bookmark className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Tag as Evidence</TooltipContent>
                                </Tooltip>
                                {showEvidenceMenu && (
                                  <div className="absolute top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg py-1 z-50" style={{ [isMine ? "right" : "left"]: 0 }}>
                                    {(Object.entries(evidenceTagConfig) as [EvidenceTag, typeof evidenceTagConfig["key-idea"]][]).map(([tag, cfg]) => (
                                      <button
                                        key={tag}
                                        onClick={() => tagMessageAsEvidence(msg.id, tag)}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-secondary/50 transition-colors"
                                      >
                                        <cfg.icon className={`w-3 h-3 ${cfg.color.split(" ")[0]}`} />
                                        <span className="text-[10px] font-display text-foreground">{cfg.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {activeConversation.typing && (
                      <div className="flex justify-start">
                        <div className="px-3 py-2 rounded-2xl bg-secondary rounded-bl-sm">
                          <div className="flex gap-1 items-center h-4">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="px-3 py-2 border-t border-border">
                    {activeConversation.blockchainLevel !== "off" && (
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <ShieldCheck className={`w-3 h-3 ${blockchainConfig[activeConversation.blockchainLevel].color}`} />
                        <span className={`text-[9px] font-display ${blockchainConfig[activeConversation.blockchainLevel].color}`}>
                          {blockchainConfig[activeConversation.blockchainLevel].label} — messages are hashed & timestamped
                        </span>
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <div className="flex-1 bg-secondary rounded-xl px-3 py-2">
                        <textarea
                          ref={inputRef}
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                          placeholder="Type a message..."
                          rows={1}
                          className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none font-display max-h-20"
                        />
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bubble */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsOpen(p => !p); if (!isOpen) setView("list"); }}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center relative hover:shadow-xl transition-shadow"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MessageCircle className="w-6 h-6" />
              )}
              {!isOpen && totalUnread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
                >
                  {totalUnread}
                </motion.span>
              )}
              {/* Online indicator ring */}
              {!isOpen && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left">{isOpen ? "Close chat" : "Messages"}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default FloatingChatWidget;
