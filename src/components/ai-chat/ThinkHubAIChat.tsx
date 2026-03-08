import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, X, Send, Minimize2, Maximize2, Sparkles, Loader2,
  Copy, ChevronDown, Settings2, Trash2, MessageSquarePlus, ArrowUp, ArrowDown
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

/* ─── Types ─── */
interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  model?: string;
}

interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: number;
}

/* ─── Slash Commands ─── */
const SLASH_COMMANDS = [
  { command: "/summarize", description: "Summarize current project context", icon: "📊" },
  { command: "/translate", description: "Translate scientific text", icon: "🌐" },
  { command: "/cite", description: "Find relevant citations", icon: "📚" },
  { command: "/analyze", description: "Analyze research data", icon: "🔬" },
];

/* ─── Mock AI responses ─── */
const mockResponses: Record<string, string> = {
  "default": "I can help you with research analysis, writing, citations, data interpretation, and more. What would you like to explore?",
  "summarize": "**Summary of your current research context:**\n\nBased on the conversation and project data available, your current focus is on ML reproducibility with emphasis on containerization and seed logging. Key findings include a 78% reduction in standard deviation across experiment runs.\n\n**Recommendations:**\n1. Document the containerization approach as a formal protocol\n2. Submit findings to the Reproducibility Workshop\n3. Integrate DVC pipeline for dataset versioning",
  "cite": "Here are relevant citations for your research:\n\n1. **Pineau et al. (2021)** — \"Improving Reproducibility in Machine Learning Research\" — *JMLR*, 22(164), 1-20\n2. **Bouthillier et al. (2019)** — \"Unreproducible Research is Reproducible\" — *ICML 2019*\n3. **Gundersen & Kjensmo (2018)** — \"State of the Art: Reproducibility in Artificial Intelligence\" — *AAAI 2018*",
  "help": "**Available commands:**\n\n- `/summarize` — Summarize current project context\n- `/cite [topic]` — Find relevant citations\n- `/draft [section]` — Draft a section for your paper\n- `/analyze [data]` — Analyze research data\n- `/translate [text]` — Translate scientific text\n- `/review` — Review and suggest improvements\n\nYou can also just ask me anything in natural language!",
};

function generateResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("/summarize") || lower.includes("summarize")) return mockResponses.summarize;
  if (lower.includes("/cite") || lower.includes("citation") || lower.includes("reference")) return mockResponses.cite;
  if (lower.includes("/help") || lower.includes("help")) return mockResponses.help;
  if (lower.includes("hello") || lower.includes("hi")) return "Hello! I'm your Think!Hub AI assistant. I can help with research analysis, writing, citations, and more. Type `/help` for available commands.";
  if (lower.includes("reproducib")) return "Reproducibility is crucial in scientific research. Based on your project context, I'd recommend:\n\n1. **Version control** all experiment configs with DVC\n2. **Containerize** environments using Docker\n3. **Log seeds** and hyperparameters automatically\n4. **Hash results** using blockchain verification for tamper-proof records\n\nWould you like me to draft a reproducibility protocol?";
  return `I understand you're asking about: "${input.slice(0, 60)}..."\n\nBased on your research context, here are my thoughts:\n\n1. This relates to your ongoing work in ML reproducibility\n2. I'd recommend reviewing recent literature on this topic\n3. Consider documenting this as a finding in your lab notebook\n\nWould you like me to elaborate on any of these points?`;
}

/* ─── Main Component ─── */
const ThinkHubAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<AIConversation[]>([{
    id: "default",
    title: "New Chat",
    messages: [{
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your **Think!Hub AI** assistant. I can help with:\n\n- 📊 Research analysis & data interpretation\n- ✍️ Academic writing & drafting\n- 📚 Finding citations & references\n- 🔬 Experiment design suggestions\n- 💡 Brainstorming research ideas\n\nType `/help` for commands or just ask me anything!",
      timestamp: Date.now(),
      model: "gemini-3-flash",
    }],
    createdAt: Date.now(),
  }]);
  const [activeConvId, setActiveConvId] = useState("default");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashCommandIndex, setSlashCommandIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const messages = activeConv?.messages ?? [];
  
  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    input.startsWith("/") && cmd.command.toLowerCase().includes(input.toLowerCase().slice(1))
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);
  
  useEffect(() => {
    setShowSlashCommands(input.startsWith("/") && input.length > 1 && filteredCommands.length > 0);
    setSlashCommandIndex(0);
  }, [input, filteredCommands.length]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || isTyping) return;
    const userMsg: AIMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, messages: [...c.messages, userMsg] } : c
    ));
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    const delay = 800 + Math.random() * 1500;
    setTimeout(() => {
      const response = generateResponse(userMsg.content);
      const assistantMsg: AIMessage = {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        model: "gemini-3-flash",
      };
      setConversations(prev => prev.map(c =>
        c.id === activeConvId ? {
          ...c,
          messages: [...c.messages, assistantMsg],
          title: c.title === "New Chat" ? userMsg.content.slice(0, 30) : c.title,
        } : c
      ));
      setIsTyping(false);
    }, delay);
  }, [input, isTyping, activeConvId]);

  const newConversation = () => {
    const id = `conv_${Date.now()}`;
    setConversations(prev => [...prev, {
      id,
      title: "New Chat",
      messages: [{
        id: `w_${Date.now()}`,
        role: "assistant",
        content: "New conversation started. How can I help you?",
        timestamp: Date.now(),
        model: "gemini-3-flash",
      }],
      createdAt: Date.now(),
    }]);
    setActiveConvId(id);
    setShowHistory(false);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConvId(remaining[0]?.id ?? "");
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-3">
        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && !isMinimized && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-[380px] sm:w-[420px] h-[560px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-bold text-foreground">Think!Hub AI</h3>
                    <p className="text-[10px] text-muted-foreground font-display flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      gemini-3-flash · Ready
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={newConversation}>
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">New chat</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(!showHistory)}>
                        <Settings2 className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">History</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
                        <Minimize2 className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Minimize</p></TooltipContent>
                  </Tooltip>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* History sidebar overlay */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    className="absolute inset-0 z-10 bg-card flex flex-col"
                  >
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <h4 className="text-sm font-display font-semibold text-foreground">Chat History</h4>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(false)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {conversations.map(c => (
                        <div
                          key={c.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            c.id === activeConvId ? "bg-accent/8 border border-accent/15" : "hover:bg-secondary/50"
                          }`}
                          onClick={() => { setActiveConvId(c.id); setShowHistory(false); }}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-display font-medium text-foreground truncate">{c.title}</p>
                            <p className="text-[9px] text-muted-foreground">{c.messages.length} messages</p>
                          </div>
                          {conversations.length > 1 && (
                            <button
                              onClick={e => { e.stopPropagation(); deleteConversation(c.id); }}
                              className="p-1 hover:bg-destructive/10 rounded"
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-border">
                      <Button variant="outline" className="w-full text-xs h-8" onClick={newConversation}>
                        <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" /> New Conversation
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${msg.role === "user" ? "" : "flex gap-2"}`}>
                      {msg.role === "assistant" && (
                        <Avatar className="w-6 h-6 ring-1 ring-accent/20 flex-shrink-0 mt-1">
                          <AvatarFallback className="bg-accent/10 text-accent text-[8px] font-bold">AI</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className={`rounded-2xl px-3.5 py-2 ${
                          msg.role === "user"
                            ? "bg-accent text-accent-foreground rounded-br-md"
                            : "bg-secondary/40 border border-border/50 rounded-bl-md"
                        }`}>
                          <div className="text-[13px] font-display leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 ${msg.role === "user" ? "justify-end" : ""}`}>
                          <span className="text-[9px] text-muted-foreground/50 tabular-nums">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {msg.model && (
                            <span className="text-[8px] text-muted-foreground/40 font-mono">{msg.model}</span>
                          )}
                          {msg.role === "assistant" && (
                            <button
                              onClick={() => copyMessage(msg.content)}
                              className="p-0.5 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Copy className="w-2.5 h-2.5 text-muted-foreground/40" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2">
                    <Avatar className="w-6 h-6 ring-1 ring-accent/20 flex-shrink-0">
                      <AvatarFallback className="bg-accent/10 text-accent text-[8px] font-bold">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-secondary/40 border border-border/50 rounded-2xl rounded-bl-md px-4 py-2.5">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-accent/40"
                            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-thin border-t border-border/30">
                  {[
                    { label: "/summarize", desc: "Summarize context" },
                    { label: "/cite", desc: "Find citations" },
                    { label: "/help", desc: "Show commands" },
                  ].map(q => (
                    <button
                      key={q.label}
                      onClick={() => { setInput(q.label); setTimeout(() => inputRef.current?.focus(), 50); }}
                      className="flex-shrink-0 px-2.5 py-1.5 rounded-full bg-secondary/40 border border-border/50 text-[10px] font-display font-medium text-foreground hover:bg-secondary/60 transition-colors"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 py-2.5 border-t border-border flex-shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask Think!Hub AI anything…"
                    rows={1}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-secondary/30 border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none min-h-[40px] max-h-[100px] leading-relaxed"
                    style={{ height: "auto", overflow: "hidden" }}
                    onInput={e => {
                      const el = e.target as HTMLTextAreaElement;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 100) + "px";
                    }}
                  />
                  {input.trim() ? (
                    <motion.button
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      onClick={sendMessage}
                      disabled={isTyping}
                      className="p-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-all flex-shrink-0 self-end shadow-sm disabled:opacity-50"
                    >
                      {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </motion.button>
                  ) : (
                    <div className="p-2.5 flex-shrink-0 self-end">
                      <Sparkles className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimized pill */}
        <AnimatePresence>
          {isOpen && isMinimized && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Bot className="w-4 h-4 text-accent" />
              <span className="text-xs font-display font-semibold text-foreground">Think!Hub AI</span>
              {isTyping && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
              <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={e => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}>
                <X className="w-3 h-3" />
              </Button>
            </motion.button>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isMinimized) { setIsMinimized(false); }
                else { setIsOpen(!isOpen); }
              }}
              className={`w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all ${
                isOpen
                  ? "bg-accent/10 border border-accent/20 text-accent"
                  : "bg-accent text-accent-foreground hover:shadow-xl"
              }`}
            >
              {isOpen ? <ChevronDown className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right"><p className="text-xs">Think!Hub AI Assistant</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ThinkHubAIChat;
