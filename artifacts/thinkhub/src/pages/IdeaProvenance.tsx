import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitBranch, Hash, ArrowRight, ChevronRight, ChevronDown, Search, Filter,
  Clock, Shield, Copy, ExternalLink, Download, Share2, Eye, EyeOff,
  Lightbulb, FlaskConical, FileText, Database, MessageSquare, RotateCcw,
  Zap, Users, Calendar, Link2, Info, X, Layers
} from "lucide-react";
import { mockProvenanceNodes, mockProvenanceEdges, PROVENANCE_NODE_META, type ProvenanceNode, type ProvenanceEdge } from "@/data/blockchainMockData";
import ForceDirectedGraph from "@/components/provenance/ForceDirectedGraph";
import { toast } from "sonner";

// ─── Edge metadata ───
const EDGE_META: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  inspired: { label: "Inspired", color: "text-warning", icon: Lightbulb, description: "Led to a new idea or direction" },
  extended: { label: "Extended", color: "text-info", icon: Zap, description: "Built upon or expanded the work" },
  replicated: { label: "Replicated", color: "text-success", icon: RotateCcw, description: "Independently reproduced" },
  cited: { label: "Cited", color: "text-highlight", icon: FileText, description: "Referenced in a publication" },
  challenged: { label: "Challenged", color: "text-destructive", icon: MessageSquare, description: "Questioned or critiqued" },
  refined: { label: "Refined", color: "text-accent", icon: Filter, description: "Improved or polished" },
};

// ─── Node type icons ───
const NODE_ICONS: Record<string, React.ElementType> = {
  idea: Lightbulb,
  hypothesis: Zap,
  experiment: FlaskConical,
  paper: FileText,
  dataset: Database,
  review: MessageSquare,
  replication: RotateCcw,
};

type ViewTab = "graph" | "timeline" | "chains";
type NodeFilter = "all" | ProvenanceNode["type"];

const IdeaProvenance = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>("graph");
  const [nodeFilter, setNodeFilter] = useState<NodeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTimeline, setExpandedTimeline] = useState<Set<string>>(new Set());
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  // Computed
  const uniqueAuthors = useMemo(() => new Set(mockProvenanceNodes.map(n => n.author.name)), []);
  const uniqueFields = useMemo(() => new Set(mockProvenanceNodes.map(n => n.field)), []);
  const nodeTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockProvenanceNodes.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1; });
    return counts;
  }, []);
  const edgeTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockProvenanceEdges.forEach(e => { counts[e.relationship] = (counts[e.relationship] || 0) + 1; });
    return counts;
  }, []);

  const filteredNodes = useMemo(() => {
    let nodes = [...mockProvenanceNodes];
    if (nodeFilter !== "all") nodes = nodes.filter(n => n.type === nodeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.author.name.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.field.toLowerCase().includes(q)
      );
    }
    return nodes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [nodeFilter, searchQuery]);

  const selectedDetail = useMemo(() => {
    if (!selectedNode) return null;
    const node = mockProvenanceNodes.find(n => n.id === selectedNode);
    if (!node) return null;
    const inEdges = mockProvenanceEdges.filter(e => e.target === selectedNode);
    const outEdges = mockProvenanceEdges.filter(e => e.source === selectedNode);
    return { node, inEdges, outEdges };
  }, [selectedNode]);

  const toggleTimelineItem = useCallback((id: string) => {
    setExpandedTimeline(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleCopyHash = useCallback((hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash copied to clipboard");
  }, []);

  const handleExport = useCallback(() => {
    const lines = [
      "Idea Provenance Report",
      `Generated: ${new Date().toISOString()}`,
      "",
      `Nodes: ${mockProvenanceNodes.length}`,
      `Edges: ${mockProvenanceEdges.length}`,
      `Contributors: ${uniqueAuthors.size}`,
      "",
      "─── Nodes ───",
      ...mockProvenanceNodes.map(n => `[${n.type}] ${n.title} — ${n.author.name} (${n.timestamp}) hash:${n.hashDigest}`),
      "",
      "─── Edges ───",
      ...mockProvenanceEdges.map(e => {
        const s = mockProvenanceNodes.find(n => n.id === e.source);
        const t = mockProvenanceNodes.find(n => n.id === e.target);
        return `${s?.title} → [${e.relationship}] → ${t?.title}`;
      }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "provenance-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  }, [uniqueAuthors]);

  const tabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
    { id: "graph", label: "Force Graph", icon: GitBranch },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "chains", label: "Attribution Chains", icon: Link2 },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Idea Provenance</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Trace how ideas evolve — from inception through collaboration to publication
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs font-display gap-1.5" onClick={handleExport}>
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
              <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5">
                <GitBranch className="w-3.5 h-3.5 text-accent" />
                Attribution Chain
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* ─── Main Column ─── */}
          <div className="space-y-5 min-w-0">
            {/* KPI Row */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {[
                { label: "Nodes", value: mockProvenanceNodes.length, icon: Layers, accent: true },
                { label: "Connections", value: mockProvenanceEdges.length, icon: Link2 },
                { label: "Contributors", value: uniqueAuthors.size, icon: Users },
                { label: "Timespan", value: (() => {
                  const dates = mockProvenanceNodes.map(n => new Date(n.timestamp).getTime());
                  const months = Math.round((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24 * 30));
                  return `${months}mo`;
                })(), icon: Calendar },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.accent ? "bg-accent/5 border-accent/20" : "bg-card border-border"}`}>
                  <s.icon className={`w-4 h-4 mb-2 ${s.accent ? "text-accent" : "text-muted-foreground"}`} />
                  <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Tab Navigation */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <div className="flex items-center gap-1 bg-secondary rounded-xl border border-border p-1 mb-4">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
                <div className="flex-1" />
                {activeTab === "timeline" && (
                  <div className="relative mr-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search nodes…"
                      className="h-8 pl-8 pr-3 text-xs font-display bg-card border border-border rounded-lg w-44 focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted-foreground"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Filter strip for timeline/chains */}
              {(activeTab === "timeline" || activeTab === "chains") && (
                <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
                  {[{ id: "all" as const, label: "All" }, ...Object.entries(PROVENANCE_NODE_META).map(([id, meta]) => ({
                    id: id as NodeFilter, label: meta.label,
                  }))].map(f => (
                    <button key={f.id} onClick={() => setNodeFilter(f.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-display whitespace-nowrap border transition-colors ${
                        nodeFilter === f.id ? "bg-accent/10 border-accent/30 text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f.id !== "all" && (() => {
                        const Icon = NODE_ICONS[f.id] || Layers;
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {f.label}
                      {f.id !== "all" && nodeTypeCounts[f.id] && (
                        <span className="text-[9px] ml-0.5 opacity-60">{nodeTypeCounts[f.id]}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Graph Tab ── */}
              {activeTab === "graph" && (
                <div className="space-y-4">
                  <ForceDirectedGraph onNodeSelect={setSelectedNode} selectedNode={selectedNode} />

                  {/* Selected node detail panel */}
                  <AnimatePresence>
                    {selectedDetail && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-card rounded-xl border border-accent/20 p-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full ${PROVENANCE_NODE_META[selectedDetail.node.type].color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                              {selectedDetail.node.author.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant="outline" className="text-[9px]">{PROVENANCE_NODE_META[selectedDetail.node.type].label}</Badge>
                                <span className="text-[10px] text-muted-foreground font-display">{selectedDetail.node.field}</span>
                              </div>
                              <h4 className="text-sm font-semibold text-foreground">{selectedDetail.node.title}</h4>
                              <p className="text-xs text-muted-foreground font-display mt-1 leading-relaxed">{selectedDetail.node.description}</p>

                              <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground font-display flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {selectedDetail.node.author.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(selectedDetail.node.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                <button onClick={() => handleCopyHash(selectedDetail.node.hashDigest)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                  <Hash className="w-3 h-3" />
                                  <code className="font-mono">{selectedDetail.node.hashDigest}</code>
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              {/* Connections */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                {selectedDetail.inEdges.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-display font-semibold text-foreground mb-1.5 flex items-center gap-1">
                                      <ArrowRight className="w-3 h-3 rotate-180 text-accent" /> Incoming ({selectedDetail.inEdges.length})
                                    </p>
                                    <div className="space-y-1">
                                      {selectedDetail.inEdges.map(e => {
                                        const source = mockProvenanceNodes.find(n => n.id === e.source);
                                        const meta = EDGE_META[e.relationship];
                                        if (!source) return null;
                                        return (
                                          <button key={e.source} onClick={() => setSelectedNode(e.source)}
                                            className="flex items-center gap-1.5 w-full text-left p-1.5 rounded-md hover:bg-secondary/80 transition-colors text-[10px] font-display"
                                          >
                                            <span className={`${meta.color} font-medium`}>{meta.label}</span>
                                            <span className="text-muted-foreground truncate">{source.title}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                {selectedDetail.outEdges.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-display font-semibold text-foreground mb-1.5 flex items-center gap-1">
                                      <ArrowRight className="w-3 h-3 text-accent" /> Outgoing ({selectedDetail.outEdges.length})
                                    </p>
                                    <div className="space-y-1">
                                      {selectedDetail.outEdges.map(e => {
                                        const target = mockProvenanceNodes.find(n => n.id === e.target);
                                        const meta = EDGE_META[e.relationship];
                                        if (!target) return null;
                                        return (
                                          <button key={e.target} onClick={() => setSelectedNode(e.target)}
                                            className="flex items-center gap-1.5 w-full text-left p-1.5 rounded-md hover:bg-secondary/80 transition-colors text-[10px] font-display"
                                          >
                                            <span className={`${meta.color} font-medium`}>{meta.label}</span>
                                            <span className="text-muted-foreground truncate">{target.title}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="p-1 rounded-md hover:bg-secondary transition-colors flex-shrink-0">
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Timeline Tab ── */}
              {activeTab === "timeline" && (
                <div className="relative pl-6">
                  <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
                  {filteredNodes.length === 0 ? (
                    <div className="text-center py-12 text-sm text-muted-foreground font-display">
                      No nodes match the current filter
                    </div>
                  ) : (
                    filteredNodes.map((node, i) => {
                      const meta = PROVENANCE_NODE_META[node.type];
                      const Icon = NODE_ICONS[node.type] || Layers;
                      const isExpanded = expandedTimeline.has(node.id);
                      const inEdges = mockProvenanceEdges.filter(e => e.target === node.id);
                      const outEdges = mockProvenanceEdges.filter(e => e.source === node.id);
                      return (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="relative pb-5 last:pb-0"
                        >
                          <div className={`absolute left-[-17px] w-3.5 h-3.5 rounded-full ${meta.color} border-2 border-background`} />
                          <div
                            className={`bg-card rounded-xl border p-4 ml-4 cursor-pointer transition-colors ${
                              isExpanded ? "border-accent/30" : "border-border hover:border-accent/20"
                            }`}
                            onClick={() => toggleTimelineItem(node.id)}
                          >
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <Icon className={`w-3.5 h-3.5 ${meta.color.replace("bg-", "text-")}`} />
                              <Badge variant="outline" className="text-[9px]">{meta.label}</Badge>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {new Date(node.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                              <div className="flex-1" />
                              {(inEdges.length + outEdges.length) > 0 && (
                                <span className="text-[9px] text-muted-foreground font-display">
                                  {inEdges.length + outEdges.length} connections
                                </span>
                              )}
                              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                            <h4 className="text-sm font-semibold text-foreground">{node.title}</h4>
                            <p className="text-[11px] text-muted-foreground font-display mt-1">{node.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-display">
                              <span className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center text-[7px] font-bold text-accent">
                                  {node.author.initials}
                                </div>
                                {node.author.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                <code className="font-mono">{node.hashDigest}</code>
                              </span>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                                    <div className="grid grid-cols-2 gap-3 text-[10px] font-display">
                                      <div>
                                        <span className="text-muted-foreground">Field:</span>{" "}
                                        <span className="text-foreground font-medium">{node.field}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Type:</span>{" "}
                                        <span className="text-foreground font-medium">{meta.label}</span>
                                      </div>
                                    </div>
                                    {inEdges.length > 0 && (
                                      <div>
                                        <p className="text-[10px] font-display font-semibold text-foreground mb-1">Incoming:</p>
                                        {inEdges.map(e => {
                                          const source = mockProvenanceNodes.find(n => n.id === e.source);
                                          const edgeMeta = EDGE_META[e.relationship];
                                          return source ? (
                                            <div key={e.source} className="flex items-center gap-1.5 text-[10px] font-display text-muted-foreground py-0.5">
                                              <span className={edgeMeta.color}>{edgeMeta.label}</span>
                                              <ChevronRight className="w-3 h-3" />
                                              <span className="truncate">{source.title}</span>
                                            </div>
                                          ) : null;
                                        })}
                                      </div>
                                    )}
                                    {outEdges.length > 0 && (
                                      <div>
                                        <p className="text-[10px] font-display font-semibold text-foreground mb-1">Outgoing:</p>
                                        {outEdges.map(e => {
                                          const target = mockProvenanceNodes.find(n => n.id === e.target);
                                          const edgeMeta = EDGE_META[e.relationship];
                                          return target ? (
                                            <div key={e.target} className="flex items-center gap-1.5 text-[10px] font-display text-muted-foreground py-0.5">
                                              <span className={edgeMeta.color}>{edgeMeta.label}</span>
                                              <ChevronRight className="w-3 h-3" />
                                              <span className="truncate">{target.title}</span>
                                            </div>
                                          ) : null;
                                        })}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-1">
                                      <button onClick={(e) => { e.stopPropagation(); handleCopyHash(node.hashDigest); }}
                                        className="flex items-center gap-1 text-[10px] font-display text-accent hover:underline"
                                      >
                                        <Copy className="w-3 h-3" /> Copy hash
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); setActiveTab("graph"); }}
                                        className="flex items-center gap-1 text-[10px] font-display text-accent hover:underline"
                                      >
                                        <Eye className="w-3 h-3" /> View in graph
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {/* ── Attribution Chains Tab ── */}
              {activeTab === "chains" && (
                <div className="space-y-4">
                  <div className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-foreground">Attribution Chains</h3>
                      <span className="text-[10px] text-muted-foreground font-display">{mockProvenanceEdges.length} connections</span>
                    </div>
                    <div className="space-y-3">
                      {mockProvenanceEdges.map((edge, i) => {
                        const source = mockProvenanceNodes.find(n => n.id === edge.source);
                        const target = mockProvenanceNodes.find(n => n.id === edge.target);
                        const edgeMeta = EDGE_META[edge.relationship];
                        if (!source || !target) return null;
                        // Apply filter
                        if (nodeFilter !== "all" && source.type !== nodeFilter && target.type !== nodeFilter) return null;
                        const EdgeIcon = edgeMeta.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-xs font-display"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`w-7 h-7 rounded-full ${PROVENANCE_NODE_META[source.type].color} flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0`}>
                                {source.author.initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-foreground truncate text-[11px] font-medium">{source.title}</p>
                                <p className="text-[9px] text-muted-foreground">{PROVENANCE_NODE_META[source.type].label} · {source.author.name}</p>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary border border-border flex-shrink-0 ${edgeMeta.color}`}>
                              <EdgeIcon className="w-3 h-3" />
                              <span className="text-[10px] font-medium">{edgeMeta.label}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`w-7 h-7 rounded-full ${PROVENANCE_NODE_META[target.type].color} flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0`}>
                                {target.author.initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-foreground truncate text-[11px] font-medium">{target.title}</p>
                                <p className="text-[9px] text-muted-foreground">{PROVENANCE_NODE_META[target.type].label} · {target.author.name}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-4">
            {/* Node Types Breakdown */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h4 className="text-sm font-semibold text-foreground mb-3">By Node Type</h4>
              <div className="space-y-2">
                {Object.entries(PROVENANCE_NODE_META).map(([type, meta]) => {
                  const count = nodeTypeCounts[type] || 0;
                  const Icon = NODE_ICONS[type] || Layers;
                  const pct = Math.round((count / mockProvenanceNodes.length) * 100);
                  return (
                    <button key={type} onClick={() => { setNodeFilter(nodeFilter === type ? "all" : type as NodeFilter); setActiveTab("timeline"); }}
                      className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                        nodeFilter === type ? "bg-accent/10 border border-accent/20" : "hover:bg-secondary/50"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${meta.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-display font-medium text-foreground">{meta.label}</p>
                        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mt-1">
                          <div className={`h-full rounded-full ${meta.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-display font-bold text-foreground">{count}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Edge Types */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h4 className="text-sm font-semibold text-foreground mb-3">Relationship Types</h4>
              <div className="space-y-1.5">
                {Object.entries(EDGE_META).map(([key, meta]) => {
                  const count = edgeTypeCounts[key] || 0;
                  const EdgeIcon = meta.icon;
                  return (
                    <div key={key} className="flex items-center gap-2 p-1.5 rounded-md">
                      <EdgeIcon className={`w-3.5 h-3.5 ${meta.color}`} />
                      <span className="text-xs font-display text-foreground flex-1">{meta.label}</span>
                      <span className="text-xs font-display font-bold text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Contributors */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h4 className="text-sm font-semibold text-foreground mb-3">Contributors</h4>
              <div className="space-y-2">
                {Array.from(uniqueAuthors).map(name => {
                  const nodes = mockProvenanceNodes.filter(n => n.author.name === name);
                  const initials = nodes[0].author.initials;
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-[9px] font-display font-bold text-accent flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-medium text-foreground truncate">{name}</p>
                        <p className="text-[9px] text-muted-foreground font-display">{nodes.length} node{nodes.length > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Graph Legend */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h4 className="text-sm font-semibold text-foreground mb-3">Graph Legend</h4>
              <div className="space-y-1.5">
                {Object.entries(PROVENANCE_NODE_META).map(([type, meta]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${meta.color}`} />
                    <span className="text-[11px] font-display text-muted-foreground">{meta.label}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 space-y-1">
                {Object.entries(EDGE_META).slice(0, 4).map(([key, meta]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-4 h-0.5 rounded ${meta.color.replace("text-", "bg-")}`} />
                    <span className="text-[10px] font-display text-muted-foreground">{meta.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">About Provenance</h4>
                  <p className="text-[10px] text-muted-foreground font-display leading-relaxed">
                    Every scientific idea has a chain of evolution. This graph cryptographically tracks
                    who proposed, extended, challenged, and replicated ideas — creating an immutable
                    record of intellectual contribution beyond citations.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default IdeaProvenance;
