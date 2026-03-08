import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, X, ChevronUp, ChevronDown, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import type { Message } from "@/components/messenger/types";
import { conversations as initialConversations, messagesData, getContactName } from "@/components/messenger/mockData";
import ConversationSidebar from "@/components/messenger/ConversationSidebar";
import MessageBubble from "@/components/messenger/MessageBubble";
import ChatInput from "@/components/messenger/ChatInput";
import ChatHeader from "@/components/messenger/ChatHeader";
import ConversationInfo from "@/components/messenger/ConversationInfo";

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
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = initialConversations.find(c => c.id === activeConvId);
  const activeMessages = activeConvId ? (msgs[activeConvId] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, activeConvId]);

  useEffect(() => {
    if (isMobile) setShowInfo(false);
  }, [activeConvId, isMobile]);

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
    };

    setMsgs(prev => ({ ...prev, [activeConvId]: [...(prev[activeConvId] || []), newMsg] }));
    setReplyingTo(null);

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

  const showConvList = isMobile ? !activeConvId : true;
  const showChat = isMobile ? !!activeConvId : true;

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex h-[calc(100vh-120px)] sm:h-[calc(100vh-100px)] rounded-xl border border-border overflow-hidden bg-card shadow-sm">

          {/* Conversation Sidebar */}
          {showConvList && (
            <ConversationSidebar
              conversations={initialConversations}
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
                  />

                  <AnimatePresence>
                    {showSearch && (
                      <InChatSearch messages={activeMessages} onClose={() => setShowSearch(false)} />
                    )}
                  </AnimatePresence>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 scrollbar-thin">
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
                          onReply={() => setReplyingTo(msg)}
                          onReact={(emoji) => handleReact(msg.id, emoji)}
                          onDelete={() => handleDelete(msg.id)}
                          onEdit={() => setEditingMsg(msg)}
                          onForward={() => toast.info("Select a conversation to forward to")}
                          onPin={() => handlePin(msg.id)}
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
              />
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default Messenger;
