import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, X, FileText, GitBranch, Layers, HelpCircle, MessageSquare,
  ChevronRight, Check, Trash2, Plus, Loader2, AlertCircle, Copy,
  StickyNote, Lightbulb, FlaskConical, BookOpen, ListChecks,
  RefreshCw, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type CanvasNodeData, type AINodeSuggestion, type AIConnectionSuggestion,
  type NodeType, type ConnType, NODE_COLORS, NODE_TYPE_META, CONN_TYPE_META,
  genId, createNode,
} from "@/data/canvasData";
import {
  extractNodesFromText, suggestConnections, synthesizeCluster,
  generateResearchQuestions, chatWithBoard, type ChatMessage,
} from "@/services/canvasAI";
import { toast } from "sonner";

type Tab = "extract" | "connect" | "synthesize" | "questions" | "chat";

const TABS: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "extract",    label: "Extract",    icon: <FileText className="w-3.5 h-3.5" />,     description: "Extract nodes from text" },
  { id: "connect",    label: "Connect",    icon: <GitBranch className="w-3.5 h-3.5" />,    description: "Suggest connections" },
  { id: "synthesize", label: "Synthesize", icon: <Layers className="w-3.5 h-3.5" />,       description: "Synthesize cluster" },
  { id: "questions",  label: "Questions",  icon: <HelpCircle className="w-3.5 h-3.5" />,   description: "Generate questions" },
  { id: "chat",       label: "Chat",       icon: <MessageSquare className="w-3.5 h-3.5" />, description: "Ask about your board" },
];

function nodeTypeIcon(type: NodeType, cls = "w-3.5 h-3.5") {
  switch (type) {
    case "note":       return <StickyNote className={cls} />;
    case "insight":    return <Lightbulb className={cls} />;
    case "question":   return <HelpCircle className={cls} />;
    case "hypothesis": return <FlaskConical className={cls} />;
    case "citation":   return <BookOpen className={cls} />;
    case "evidence":   return <GitBranch className={cls} />;
    case "task":       return <ListChecks className={cls} />;
    default:           return <StickyNote className={cls} />;
  }
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-muted-foreground";
  return <span className={cn("text-[10px] font-medium", color)}>{pct}%</span>;
}

interface AIAssistPanelProps {
  nodes: CanvasNodeData[];
  selectedNodeIds: string[];
  onClose: () => void;
  onAcceptNodes: (nodes: CanvasNodeData[]) => void;
  onAcceptConnections: (connections: Array<{ fromId: string; toId: string; connType: ConnType; label: string; aiRationale?: string }>) => void;
  onAddSynthesisNode: (node: CanvasNodeData) => void;
}

export default function AIAssistPanel({
  nodes,
  selectedNodeIds,
  onClose,
  onAcceptNodes,
  onAcceptConnections,
  onAddSynthesisNode,
}: AIAssistPanelProps) {
  const [tab, setTab] = useState<Tab>("extract");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Extract tab state ─ */
  const [extractText, setExtractText] = useState("");
  const [extractedSuggestions, setExtractedSuggestions] = useState<AINodeSuggestion[]>([]);

  /* ── Connect tab state ─ */
  const [connSuggestions, setConnSuggestions] = useState<AIConnectionSuggestion[]>([]);

  /* ── Synthesize tab state ─ */
  const [synthResult, setSynthResult] = useState<{ title: string; content: string; rationale: string } | null>(null);

  /* ── Questions tab state ─ */
  const [questionSuggestions, setQuestionSuggestions] = useState<Array<{ id: string; title: string; rationale: string; confidence: number }>>([]);
  const [questionFocus, setQuestionFocus] = useState("");

  /* ── Chat tab state ─ */
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));

  const run = useCallback(async (fn: () => Promise<void>) => {
    setError(null);
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Extract actions ─ */
  const handleExtract = () => run(async () => {
    if (extractText.trim().length < 20) throw new Error("Please paste at least 20 characters of text.");
    const result = await extractNodesFromText(extractText, nodes);
    setExtractedSuggestions(result.nodes.map(n => ({ ...n, accepted: undefined })));
    if (result.nodes.length === 0) throw new Error("No nodes extracted. Try different or longer text.");
    toast.success(`Extracted ${result.nodes.length} node suggestions`);
  });

  const toggleExtracted = (id: string) => {
    setExtractedSuggestions(prev => prev.map(n =>
      n.id === id ? { ...n, accepted: n.accepted === true ? false : n.accepted === false ? undefined : true } : n
    ));
  };

  const acceptAllExtracted = () => {
    setExtractedSuggestions(prev => prev.map(n => ({ ...n, accepted: true })));
  };

  const commitExtracted = () => {
    const accepted = extractedSuggestions.filter(s => s.accepted !== false);
    if (accepted.length === 0) { toast.error("No nodes selected to add."); return; }

    const rect = { width: 900, height: 600 };
    const newNodes = accepted.map((s, i) => createNode(s.type as NodeType, 100 + (i % 4) * 220, 100 + Math.floor(i / 4) * 160, {
      title: s.title,
      content: s.content,
      colorKey: s.colorKey,
      isAiGenerated: true,
      aiRationale: s.rationale,
      aiConfidence: s.confidence,
    }));

    onAcceptNodes(newNodes);
    setExtractedSuggestions([]);
    setExtractText("");
    toast.success(`Added ${newNodes.length} nodes to canvas`);
  };

  /* ── Connect actions ─ */
  const handleSuggestConnections = () => run(async () => {
    if (selectedNodes.length < 2) throw new Error("Select at least 2 nodes on the canvas first.");
    const result = await suggestConnections(selectedNodes);
    setConnSuggestions(result.connections.map(c => ({ ...c, accepted: undefined })));
    if (result.connections.length === 0) throw new Error("No connection suggestions found. Try selecting different nodes.");
    toast.success(`Found ${result.connections.length} connection suggestions`);
  });

  const toggleConn = (id: string) => {
    setConnSuggestions(prev => prev.map(c =>
      c.id === id ? { ...c, accepted: c.accepted === true ? false : c.accepted === false ? undefined : true } : c
    ));
  };

  const commitConnections = () => {
    const accepted = connSuggestions.filter(c => c.accepted !== false);
    if (accepted.length === 0) { toast.error("No connections selected."); return; }
    onAcceptConnections(accepted.map(c => ({
      fromId: c.fromId,
      toId: c.toId,
      connType: c.connType as ConnType,
      label: c.label,
      aiRationale: c.rationale,
    })));
    setConnSuggestions([]);
    toast.success(`Added ${accepted.length} connections`);
  };

  /* ── Synthesize actions ─ */
  const handleSynthesize = () => run(async () => {
    if (selectedNodes.length < 2) throw new Error("Select at least 2 nodes on the canvas to synthesize.");
    const result = await synthesizeCluster(selectedNodes);
    setSynthResult(result.synthesis);
  });

  const commitSynthesis = () => {
    if (!synthResult) return;
    const node = createNode("insight", 200, 200, {
      title: synthResult.title,
      content: synthResult.content,
      colorKey: "green",
      isAiGenerated: true,
      aiRationale: synthResult.rationale,
      aiSourceNodeIds: selectedNodeIds,
    });
    onAddSynthesisNode(node);
    setSynthResult(null);
    toast.success("Synthesis insight added to canvas");
  };

  /* ── Questions actions ─ */
  const handleGenerateQuestions = () => run(async () => {
    if (nodes.length === 0) throw new Error("Your board has no nodes yet.");
    const result = await generateResearchQuestions(nodes, questionFocus || undefined);
    setQuestionSuggestions(result.questions.map(q => ({ ...q })));
    if (result.questions.length === 0) throw new Error("No questions generated. Try adding more nodes first.");
    toast.success(`Generated ${result.questions.length} research questions`);
  });

  const addQuestionToCanvas = (q: { id: string; title: string; rationale: string; confidence: number }) => {
    const node = createNode("question", 100, 100, {
      title: q.title,
      colorKey: "purple",
      isAiGenerated: true,
      aiRationale: q.rationale,
      aiConfidence: q.confidence,
    });
    onAcceptNodes([node]);
    setQuestionSuggestions(prev => prev.filter(x => x.id !== q.id));
    toast.success("Question added to canvas");
  };

  const addAllQuestions = () => {
    if (questionSuggestions.length === 0) return;
    const newNodes = questionSuggestions.map((q, i) =>
      createNode("question", 100 + (i % 3) * 220, 100 + Math.floor(i / 3) * 140, {
        title: q.title,
        colorKey: "purple",
        isAiGenerated: true,
        aiRationale: q.rationale,
        aiConfidence: q.confidence,
      })
    );
    onAcceptNodes(newNodes);
    setQuestionSuggestions([]);
    toast.success(`Added ${newNodes.length} questions to canvas`);
  };

  /* ── Chat actions ─ */
  const handleChat = async () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatInput("");
    const userMsg: ChatMessage = { role: "user", content: msg };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    try {
      const result = await chatWithBoard(msg, nodes, [...chatHistory, userMsg]);
      const assistMsg: ChatMessage = { role: "assistant", content: result.reply };
      setChatHistory(prev => [...prev, assistMsg]);
      setTimeout(() => {
        chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Chat failed";
      setError(errMsg);
      setChatHistory(prev => prev.filter(m => m !== userMsg));
      setChatInput(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Node label helpers ─ */
  const nodeLabel = (id: string) => nodes.find(n => n.id === id)?.title.slice(0, 30) ?? id;

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="w-80 flex-none flex flex-col border-l border-border bg-card h-full overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border flex-none">
        <div className="w-6 h-6 rounded-lg bg-purple-400/15 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-foreground">AI Research Assistant</p>
          <p className="text-[10px] text-muted-foreground">Powered by OpenAI GPT-5</p>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex-none border-b border-border bg-secondary/30">
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(null); }}
              title={t.description}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors border-b-2",
                tab === t.id
                  ? "border-purple-400 text-purple-400 bg-purple-400/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {t.icon}
              <span className="leading-none">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex-none flex items-start gap-2 px-3 py-2 bg-destructive/10 border-b border-destructive/20 text-[11px] text-destructive overflow-hidden"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="shrink-0"><X className="w-3 h-3" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">

          {/* ── Extract Tab ── */}
          {tab === "extract" && (
            <div className="space-y-3">
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="text-[11px] font-semibold text-foreground mb-1">Extract from Text</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Paste research text, abstracts, paper excerpts, or notes. AI will extract structured concept, hypothesis, evidence, question, and citation nodes.
                </p>
              </div>

              <textarea
                value={extractText}
                onChange={e => setExtractText(e.target.value)}
                placeholder="Paste research text, abstract, paper excerpt, or notes here…"
                className="w-full bg-secondary/50 rounded-xl px-3 py-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border focus:border-purple-400/50 transition-colors resize-none leading-relaxed"
                rows={6}
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{extractText.length} chars</span>
                <button
                  onClick={handleExtract}
                  disabled={loading || extractText.trim().length < 20}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-purple-400/15 text-purple-400 hover:bg-purple-400/25 text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Extract Nodes
                </button>
              </div>

              {extractedSuggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-foreground">{extractedSuggestions.length} suggestions</p>
                    <div className="flex items-center gap-1">
                      <button onClick={acceptAllExtracted} className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors">Select all</button>
                      <span className="text-muted-foreground">·</span>
                      <button onClick={() => setExtractedSuggestions([])} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Clear</button>
                    </div>
                  </div>

                  {extractedSuggestions.map(s => {
                    const col = NODE_COLORS[s.colorKey] ?? NODE_COLORS.slate;
                    const isRejected = s.accepted === false;
                    const isAccepted = s.accepted === true;
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleExtracted(s.id)}
                        className={cn(
                          "rounded-xl border p-2.5 cursor-pointer transition-all",
                          isRejected ? "opacity-40 border-border bg-card" :
                          isAccepted ? "border-purple-400/50 bg-purple-400/5" :
                          "border-border bg-card hover:border-purple-400/30"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5", col.headerBg ?? "bg-secondary", col.icon)}>
                            {nodeTypeIcon(s.type as NodeType, "w-3 h-3")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[11px] font-semibold text-foreground leading-snug">{s.title}</p>
                              <div className="flex items-center gap-1 shrink-0">
                                <ConfidenceBadge confidence={s.confidence} />
                                <div className={cn(
                                  "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                                  isAccepted ? "bg-purple-400 border-purple-400" : "border-border"
                                )}>
                                  {isAccepted && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                              </div>
                            </div>
                            <span className={cn("text-[9px] font-bold uppercase tracking-wide", col.tag)}>
                              {NODE_TYPE_META[s.type as NodeType]?.label ?? s.type}
                            </span>
                            {s.content && (
                              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{s.content}</p>
                            )}
                            {s.rationale && (
                              <p className="text-[9px] text-purple-400/70 mt-1 italic leading-relaxed">
                                <Info className="w-2.5 h-2.5 inline mr-0.5" />{s.rationale}
                              </p>
                            )}
                            {s.sourceText && (
                              <p className="text-[9px] text-muted-foreground/60 mt-1 italic border-l-2 border-border/60 pl-1.5 line-clamp-1">
                                "{s.sourceText}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={commitExtracted}
                    className="w-full h-8 rounded-xl bg-purple-400/15 text-purple-400 hover:bg-purple-400/25 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add {extractedSuggestions.filter(s => s.accepted !== false).length} nodes to canvas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Connect Tab ── */}
          {tab === "connect" && (
            <div className="space-y-3">
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="text-[11px] font-semibold text-foreground mb-1">Suggest Connections</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Select 2–15 nodes on the canvas, then click Analyze. AI will suggest meaningful semantic relationships between them.
                </p>
              </div>

              {/* Selected nodes preview */}
              <div className="rounded-xl border border-border p-2.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Selected nodes</p>
                {selectedNodes.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">Click nodes on the canvas to select them (hold to multi-select)</p>
                ) : (
                  <div className="space-y-1">
                    {selectedNodes.slice(0, 8).map(n => {
                      const col = NODE_COLORS[n.colorKey] ?? NODE_COLORS.slate;
                      return (
                        <div key={n.id} className="flex items-center gap-1.5">
                          <span className={col.icon}>{nodeTypeIcon(n.type, "w-3 h-3")}</span>
                          <span className="text-[11px] text-foreground truncate">{n.title}</span>
                        </div>
                      );
                    })}
                    {selectedNodes.length > 8 && (
                      <p className="text-[10px] text-muted-foreground">+{selectedNodes.length - 8} more selected</p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleSuggestConnections}
                disabled={loading || selectedNodes.length < 2}
                className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl bg-purple-400/15 text-purple-400 hover:bg-purple-400/25 text-[12px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
                Analyze {selectedNodes.length > 0 ? `${selectedNodes.length} nodes` : "selected nodes"}
              </button>

              {connSuggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-foreground">{connSuggestions.length} suggested connections</p>
                    <button onClick={() => setConnSuggestions([])} className="text-[10px] text-muted-foreground hover:text-foreground">Clear</button>
                  </div>

                  {connSuggestions.map(c => {
                    const meta = CONN_TYPE_META[c.connType as ConnType] ?? CONN_TYPE_META.related;
                    const isRejected = c.accepted === false;
                    const isAccepted = c.accepted === true;
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleConn(c.id)}
                        className={cn(
                          "rounded-xl border p-2.5 cursor-pointer transition-all",
                          isRejected ? "opacity-40 border-border bg-card" :
                          isAccepted ? "border-emerald-400/40 bg-emerald-400/5" :
                          "border-border bg-card hover:border-emerald-400/30"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: meta.stroke }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.stroke }}>{meta.label}</p>
                              <div className="flex items-center gap-1 shrink-0">
                                <ConfidenceBadge confidence={c.confidence} />
                                <div className={cn(
                                  "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                                  isAccepted ? "bg-emerald-400 border-emerald-400" : "border-border"
                                )}>
                                  {isAccepted && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-foreground mt-0.5 leading-snug">
                              <span className="font-medium">{nodeLabel(c.fromId)}</span>
                              <span className="text-muted-foreground mx-1">→</span>
                              <span className="font-medium">{nodeLabel(c.toId)}</span>
                            </p>
                            {c.rationale && (
                              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{c.rationale}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={commitConnections}
                    className="w-full h-8 rounded-xl bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Add {connSuggestions.filter(c => c.accepted !== false).length} connections
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Synthesize Tab ── */}
          {tab === "synthesize" && (
            <div className="space-y-3">
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="text-[11px] font-semibold text-foreground mb-1">Synthesize Cluster</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Select 2+ nodes on the canvas. AI will synthesize them into a single coherent Insight node that captures the core intellectual relationship.
                </p>
              </div>

              <div className="rounded-xl border border-border p-2.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Nodes to synthesize</p>
                {selectedNodes.length < 2 ? (
                  <p className="text-[11px] text-muted-foreground italic">Select at least 2 nodes on the canvas</p>
                ) : (
                  <div className="space-y-1">
                    {selectedNodes.slice(0, 6).map(n => (
                      <div key={n.id} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                        <span className="text-[11px] text-foreground truncate">{n.title}</span>
                      </div>
                    ))}
                    {selectedNodes.length > 6 && <p className="text-[10px] text-muted-foreground">+{selectedNodes.length - 6} more</p>}
                  </div>
                )}
              </div>

              <button
                onClick={handleSynthesize}
                disabled={loading || selectedNodes.length < 2}
                className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl bg-purple-400/15 text-purple-400 hover:bg-purple-400/25 text-[12px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                Synthesize {selectedNodes.length > 0 ? `${selectedNodes.length} nodes` : ""}
              </button>

              {synthResult && (
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/5 p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                    <p className="text-[11px] font-semibold text-emerald-400">Synthesis Result</p>
                  </div>
                  <input
                    value={synthResult.title}
                    onChange={e => setSynthResult(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full bg-secondary/50 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-foreground outline-none border border-border focus:border-emerald-400/50 transition-colors"
                  />
                  <textarea
                    value={synthResult.content}
                    onChange={e => setSynthResult(prev => prev ? { ...prev, content: e.target.value } : null)}
                    className="w-full bg-secondary/50 rounded-lg px-2.5 py-2 text-[11px] text-foreground outline-none border border-border focus:border-emerald-400/50 transition-colors resize-none leading-relaxed"
                    rows={4}
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    <Info className="w-2.5 h-2.5 inline mr-0.5" />{synthResult.rationale}
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={commitSynthesis} className="flex-1 h-7 rounded-lg bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1">
                      <Plus className="w-3 h-3" /> Add to canvas
                    </button>
                    <button onClick={() => setSynthResult(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Questions Tab ── */}
          {tab === "questions" && (
            <div className="space-y-3">
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="text-[11px] font-semibold text-foreground mb-1">Generate Research Questions</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  AI will analyze your board content and generate incisive research questions that reveal gaps, tensions, or productive next directions.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Research Focus (optional)</label>
                <input
                  value={questionFocus}
                  onChange={e => setQuestionFocus(e.target.value)}
                  placeholder="e.g. methodology gaps, theoretical tensions…"
                  className="mt-1 w-full bg-secondary/50 rounded-lg px-2.5 py-1.5 text-[11px] text-foreground outline-none border border-border focus:border-purple-400/50 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground">{nodes.length} board nodes analyzed</span>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={loading || nodes.length === 0}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-purple-400/15 text-purple-400 hover:bg-purple-400/25 text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Generate
                </button>
              </div>

              {questionSuggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-foreground">{questionSuggestions.length} questions</p>
                    <button onClick={addAllQuestions} className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors">Add all</button>
                  </div>
                  {questionSuggestions.map(q => (
                    <div key={q.id} className="rounded-xl border border-border bg-card p-2.5 space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-foreground leading-snug flex-1">{q.title}</p>
                        <ConfidenceBadge confidence={q.confidence} />
                      </div>
                      {q.rationale && (
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{q.rationale}</p>
                      )}
                      <button
                        onClick={() => addQuestionToCanvas(q)}
                        className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add to canvas
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Chat Tab ── */}
          {tab === "chat" && (
            <div className="space-y-3">
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="text-[11px] font-semibold text-foreground mb-1">Chat with Your Board</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Ask questions about your research content. AI has full context of all {nodes.length} board nodes.
                </p>
              </div>

              {/* Chat history */}
              <div ref={chatScrollRef} className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {chatHistory.length === 0 && (
                  <div className="space-y-1.5">
                    {[
                      "What are the main themes in my research?",
                      "What tensions or contradictions do you see?",
                      "What gaps does my literature review have?",
                      "Suggest a methodology for my hypothesis",
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => { setChatInput(q); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn("rounded-xl p-2.5", msg.role === "user" ? "bg-secondary ml-4" : "bg-purple-400/8 border border-purple-400/20")}>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wide">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        className="mt-1.5 flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="w-2.5 h-2.5" /> Copy
                      </button>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-400/8 border border-purple-400/20">
                    <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                    <span className="text-[11px] text-purple-400">Thinking…</span>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div className="flex gap-1.5">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                  placeholder="Ask about your research…"
                  disabled={loading}
                  className="flex-1 bg-secondary/50 rounded-lg px-2.5 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border focus:border-purple-400/50 transition-colors disabled:opacity-50"
                />
                <button
                  onClick={handleChat}
                  disabled={loading || !chatInput.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-400/15 text-purple-400 hover:bg-purple-400/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {chatHistory.length > 0 && (
                <button
                  onClick={() => setChatHistory([])}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear conversation
                </button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
