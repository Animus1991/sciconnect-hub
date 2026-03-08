import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, X, ChevronUp, ChevronDown, Lock, Shield, CheckSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import type { Message, BlockchainLevel, EvidenceTag } from "@/components/messenger/types";
import { conversations as initialConversations, messagesData, getContactName } from "@/components/messenger/mockData";
import ConversationSidebar from "@/components/messenger/ConversationSidebar";
import MessageBubble from "@/components/messenger/MessageBubble";
import ChatInput from "@/components/messenger/ChatInput";
import ChatHeader from "@/components/messenger/ChatHeader";
import ConversationInfo from "@/components/messenger/ConversationInfo";
import ThreadPanel from "@/components/messenger/ThreadPanel";
import type { Conversation } from "@/components/messenger/types";
import { exportChatAsLabRecord } from "@/lib/chat-pdf-export";

/* ─── NDA Acceptance Dialog ─── */
const NDAAcceptanceDialog = ({ convName, onAccept, onDecline }: { convName: string; onAccept: () => void; onDecline: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="w-[380px] bg-card border border-border rounded-2xl shadow-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground text-sm">NDA Mode Activation</h3>
          <p className="text-[11px] text-muted-foreground font-display">{convName}</p>
        </div>
      </div>
      <div className="bg-secondary/30 rounded-xl p-3.5 mb-4 border border-border/50">
        <p className="text-xs font-display text-foreground leading-relaxed mb-2">
          By enabling NDA Mode, all participants agree to:
        </p>
        <ul className="space-y-1.5">
          {[
            "All messages are treated as confidential",
            "Messages are watermarked with participant identities",
            "No forwarding or external sharing permitted",
            "Full audit trail is maintained with blockchain verification",
            "Violation may result in legal consequences",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] font-display text-muted-foreground">
              <CheckSquare className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 text-xs h-9" onClick={onDecline}>
          Decline
        </Button>
        <Button className="flex-1 text-xs h-9 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onAccept}>
          Accept NDA Terms
        </Button>
      </div>
    </motion.div>
  </motion.div>
);

/* ─── Typing Indicator ─── */
const ChatTypingIndicator = ({ name }: { name: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    className="flex items-center gap-2 px-4 py-1"
  >
    <Avatar className="w-6 h-6 ring-1 ring-border">
      <AvatarFallback className="bg-primary/10 text-primary text-[7px] font-display font-semibold">
        {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
      </AvatarFallback>
    </Avatar>
    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-3 py-2 flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
          animate={{ y: [0, -3, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
        />
      ))}
    </div>
  </motion.div>
);

/* ─── Date Separator ─── */
const DateSeparator = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center my-4">
    <div className="h-px flex-1 bg-border/40" />
    <span className="px-3 py-0.5 rounded-full bg-secondary/40 text-[10px] font-display font-medium text-muted-foreground/70 mx-2">
      {label}
    </span>
    <div className="h-px flex-1 bg-border/40" />
  </div>
);

/* ─── Unread Separator ─── */
const UnreadSeparator = ({ count }: { count: number }) => (
  <div className="flex items-center justify-center my-3">
    <div className="h-px flex-1 bg-accent/20" />
    <span className="px-3 py-0.5 rounded-full bg-accent/8 text-[10px] font-display font-semibold text-accent mx-2">
      {count} new message{count > 1 ? "s" : ""}
    </span>
    <div className="h-px flex-1 bg-accent/20" />
  </div>
);

/* ─── NDA Banner ─── */
const NDABanner = ({ acceptedCount }: { acceptedCount: number }) => (
  <div className="px-4 py-2 bg-destructive/5 border-b border-destructive/10 flex items-center gap-2">
    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse flex-shrink-0" />
    <Lock className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
    <p className="text-[11px] font-display font-medium text-destructive/80 flex-1">
      NDA Protected Channel · {acceptedCount} accepted
    </p>
    <Shield className="w-3 h-3 text-destructive/40" />
  </div>
);

/* ─── In-Chat Search ─── */
const InChatSearch = ({ messages, onClose }: { messages: Message[]; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return messages.filter(m => !m.deleted && m.text.toLowerCase().includes(q));
  }, [messages, query]);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-b border-border"
    >
      <div className="px-3 py-2 flex items-center gap-2 bg-secondary/15">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={e => { setQuery(e.target.value); setCurrentIndex(0); }}
          placeholder="Search in conversation…"
          className="flex-1 bg-transparent text-sm font-display placeholder:text-muted-foreground focus:outline-none"
        />
        {results.length > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{currentIndex + 1}/{results.length}</span>
            <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} className="p-0.5 hover:bg-secondary rounded">
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => setCurrentIndex(i => Math.min(results.length - 1, i + 1))} className="p-0.5 hover:bg-secondary rounded">
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
        {query && results.length === 0 && (
          <span className="text-[10px] text-muted-foreground/50 font-display flex-shrink-0">No results</span>
        )}
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Main Messenger ─── */
const Messenger = () => {
  const isMobile = useIsMobile();
  const [activeConvId, setActiveConvId] = useState<string | null>(isMobile ? null : "c1");
  const [msgs, setMsgs] = useState<Record<string, Message[]>>(messagesData);
  const [convs, setConvs] = useState<Conversation[]>(initialConversations);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNDADialog, setShowNDADialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = convs.find(c => c.id === activeConvId);
  const activeMessages = activeConvId ? (msgs[activeConvId] || []) : [];
  const isNDA = activeConv?.ndaStatus === "accepted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, activeConvId]);

  useEffect(() => {
    if (isMobile) setShowInfo(false);
  }, [activeConvId, isMobile]);

  /* ─── Message actions ─── */
  const sendMessage = useCallback((text: string) => {
    if (!activeConvId || !activeConv) return;

    if (editingMsg) {
      setMsgs(prev => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map(m =>
          m.id === editingMsg.id ? { ...m, text, edited: true } : m
        )
      }));
      setEditingMsg(null);
      return;
    }

    const bcLevel = activeConv.blockchainLevel;
    const shouldHash = bcLevel === "mutual" || (bcLevel === "unilateral");

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      senderId: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      status: "sent",
      reactions: [],
      replyTo: replyingTo
        ? { id: replyingTo.id, author: replyingTo.senderId === "me" ? "You" : getContactName(replyingTo.senderId), text: replyingTo.text }
        : undefined,
      ...(shouldHash ? { blockchainHash: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}` } : {}),
    };

    setMsgs(prev => ({ ...prev, [activeConvId]: [...(prev[activeConvId] || []), newMsg] }));
    setReplyingTo(null);

    if (shouldHash) {
      toast.success("Message hashed & anchored", { description: `SHA-256: ${newMsg.blockchainHash}` });
    }

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
  }, [activeConvId, activeConv, replyingTo, editingMsg]);

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
            return { ...m, reactions: updated.length > 0 ? m.reactions.map(r => r.emoji === emoji ? { ...r, users: updated } : r) : m.reactions.filter(r => r.emoji !== emoji) };
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
    toast.success("Pin toggled");
  }, [activeConvId]);

  const handleBookmark = useCallback((msgId: string) => {
    if (!activeConvId) return;
    setMsgs(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).map(m => m.id === msgId ? { ...m, bookmarked: !m.bookmarked } : m)
    }));
    toast.success("Bookmark toggled");
  }, [activeConvId]);

  const handleTagEvidence = useCallback((msgId: string, tag: EvidenceTag) => {
    if (!activeConvId) return;
    setMsgs(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).map(m => m.id === msgId ? { ...m, evidenceTag: tag } : m)
    }));
    toast.success(`Tagged as ${tag.label}`, { description: "Attribution recorded" });
  }, [activeConvId]);

  /* ─── Conversation-level actions ─── */
  const setBlockchainLevel = useCallback((level: BlockchainLevel) => {
    if (!activeConvId) return;
    if (level === "mutual") {
      toast.info("P2P Verification Request Sent", { description: "Both parties must accept to enable mutual verification." });
    }
    setConvs(prev => prev.map(c => c.id === activeConvId ? { ...c, blockchainLevel: level } : c));
    if (level !== "off") {
      toast.success(`Blockchain: ${level === "mutual" ? "P2P Verified" : "My Messages Verified"}`);
    }
  }, [activeConvId]);

  const toggleNDA = useCallback(() => {
    if (!activeConvId || !activeConv) return;
    if (activeConv.ndaStatus === "accepted") {
      setConvs(prev => prev.map(c => c.id === activeConvId ? { ...c, ndaStatus: "off", ndaAcceptedBy: [] } : c));
      toast.success("NDA Mode disabled");
    } else {
      setShowNDADialog(true);
    }
  }, [activeConvId, activeConv]);

  const acceptNDA = useCallback(() => {
    if (!activeConvId) return;
    setConvs(prev => prev.map(c => c.id === activeConvId ? { ...c, ndaStatus: "accepted", ndaAcceptedBy: ["me"] } : c));
    setShowNDADialog(false);
    toast.success("NDA Mode activated", { description: "All messages are now confidential" });
  }, [activeConvId]);

  const showConvList = isMobile ? !activeConvId : true;
  const showChat = isMobile ? !!activeConvId : true;

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex h-[calc(100vh-120px)] sm:h-[calc(100vh-100px)] rounded-xl border border-border overflow-hidden bg-card shadow-sm relative">

          {/* NDA Acceptance Dialog */}
          <AnimatePresence>
            {showNDADialog && activeConv && (
              <NDAAcceptanceDialog
                convName={activeConv.name}
                onAccept={acceptNDA}
                onDecline={() => setShowNDADialog(false)}
              />
            )}
          </AnimatePresence>

          {/* Conversation Sidebar */}
          {showConvList && (
            <ConversationSidebar
              conversations={convs}
              activeConvId={activeConvId}
              onSelectConversation={setActiveConvId}
              className={isMobile ? "w-full" : "w-[320px]"}
            />
          )}

          {/* Chat Area */}
          {showChat && (
            <div className="flex-1 flex flex-col min-w-0">
              {activeConv ? (
                <>
                  <ChatHeader
                    conversation={activeConv}
                    isMobile={isMobile}
                    showInfo={showInfo}
                    onBack={() => setActiveConvId(null)}
                    onToggleInfo={() => setShowInfo(!showInfo)}
                    onToggleSearch={() => setShowSearch(!showSearch)}
                    onSetBlockchainLevel={setBlockchainLevel}
                    onToggleNDA={toggleNDA}
                  />

                  {/* NDA Banner */}
                  {isNDA && (
                    <NDABanner acceptedCount={activeConv.ndaAcceptedBy?.length ?? 0} />
                  )}

                  <AnimatePresence>
                    {showSearch && (
                      <InChatSearch messages={activeMessages} onClose={() => setShowSearch(false)} />
                    )}
                  </AnimatePresence>

                  {/* Messages */}
                  <div className={`flex-1 overflow-y-auto px-3 sm:px-5 py-3 scrollbar-thin relative ${isNDA ? "nda-watermark" : ""}`}>
                    {/* NDA diagonal watermark */}
                    {isNDA && (
                      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden opacity-[0.02]">
                        <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                          <p className="text-foreground font-display font-bold text-4xl tracking-[0.2em] uppercase whitespace-nowrap">
                            CONFIDENTIAL · NDA PROTECTED
                          </p>
                        </div>
                      </div>
                    )}

                    <DateSeparator label="Today" />

                    {activeConv.unread > 0 && activeMessages.length > activeConv.unread && (
                      <div key="unread-sep" style={{ order: activeMessages.length - activeConv.unread }}>
                        <UnreadSeparator count={activeConv.unread} />
                      </div>
                    )}

                    {activeMessages.map((msg, idx) => {
                      const prevMsg = idx > 0 ? activeMessages[idx - 1] : null;
                      const showSender = !prevMsg || prevMsg.senderId !== msg.senderId || prevMsg.deleted;

                      return (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          isMine={msg.senderId === "me"}
                          isGroup={activeConv.type === "group"}
                          showSender={showSender}
                          isNDA={isNDA}
                          onReply={() => setReplyingTo(msg)}
                          onReact={(emoji) => handleReact(msg.id, emoji)}
                          onDelete={() => handleDelete(msg.id)}
                          onEdit={() => setEditingMsg(msg)}
                          onForward={() => toast.info("Select a conversation to forward to")}
                          onPin={() => handlePin(msg.id)}
                          onBookmark={() => handleBookmark(msg.id)}
                          onTagEvidence={(tag) => handleTagEvidence(msg.id, tag)}
                        />
                      );
                    })}

                    <AnimatePresence>
                      {activeConv.typing && (
                        <ChatTypingIndicator name={activeConv.name} />
                      )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                  </div>

                  <ChatInput
                    activeConv={activeConv}
                    replyingTo={replyingTo}
                    editingMsg={editingMsg}
                    onSend={sendMessage}
                    onCancelReply={() => setReplyingTo(null)}
                    onCancelEdit={() => setEditingMsg(null)}
                  />
                </>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/30 flex items-center justify-center mb-5">
                    <MessageCircle className="w-10 h-10 text-muted-foreground/20" />
                  </div>
                  <h2 className="font-serif font-bold text-lg text-foreground mb-1.5">Research Messenger</h2>
                  <p className="text-sm text-muted-foreground font-display max-w-[320px] leading-relaxed">
                    Select a conversation to continue collaborating, or start a new thread with a colleague.
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-[11px] text-muted-foreground/60 font-display">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Blockchain IP Escrow</span>
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> NDA Mode</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Panel */}
          <AnimatePresence>
            {showInfo && activeConv && !isMobile && (
              <ConversationInfo
                conversation={activeConv}
                messages={activeMessages}
                onClose={() => setShowInfo(false)}
                onSetBlockchainLevel={setBlockchainLevel}
                onToggleNDA={toggleNDA}
              />
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default Messenger;
