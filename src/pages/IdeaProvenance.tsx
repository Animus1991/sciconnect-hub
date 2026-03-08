import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Hash, Clock, ArrowRight, ChevronRight, Shield } from "lucide-react";
import { mockProvenanceNodes, mockProvenanceEdges, PROVENANCE_NODE_META } from "@/data/blockchainMockData";

const EDGE_LABELS: Record<string, { label: string; color: string }> = {
  inspired: { label: "Inspired", color: "text-amber-500" },
  extended: { label: "Extended", color: "text-blue-500" },
  replicated: { label: "Replicated", color: "text-emerald-500" },
  cited: { label: "Cited", color: "text-purple-500" },
  challenged: { label: "Challenged", color: "text-rose-500" },
  refined: { label: "Refined", color: "text-cyan-500" },
};

const IdeaProvenance = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const selectedDetail = useMemo(() => {
    if (!selectedNode) return null;
    const node = mockProvenanceNodes.find(n => n.id === selectedNode);
    if (!node) return null;
    const inEdges = mockProvenanceEdges.filter(e => e.target === selectedNode);
    const outEdges = mockProvenanceEdges.filter(e => e.source === selectedNode);
    return { node, inEdges, outEdges };
  }, [selectedNode]);

  // Build timeline chains
  const sortedNodes = useMemo(() =>
    [...mockProvenanceNodes].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  , []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Idea Provenance</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Trace how ideas evolve — from inception through collaboration to publication
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5">
              <GitBranch className="w-3.5 h-3.5 text-accent" />
              Attribution Chain
            </Badge>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Nodes", value: mockProvenanceNodes.length.toString() },
            { label: "Connections", value: mockProvenanceEdges.length.toString() },
            { label: "Contributors", value: new Set(mockProvenanceNodes.map(n => n.author.name)).size.toString() },
            { label: "Fields", value: new Set(mockProvenanceNodes.map(n => n.field)).size.toString() },
          ].map((s, i) => (
            <div key={s.label} className={`rounded-xl border p-4 ${i === 0 ? "bg-accent/5 border-accent/20" : "bg-card border-border"}`}>
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="graph">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="graph" className="font-display text-sm">Visual Graph</TabsTrigger>
            <TabsTrigger value="timeline" className="font-display text-sm">Timeline</TabsTrigger>
            <TabsTrigger value="chains" className="font-display text-sm">Attribution Chains</TabsTrigger>
          </TabsList>

          {/* Visual Graph */}
          <TabsContent value="graph">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-base font-semibold text-foreground mb-4">Provenance Graph</h3>
              
              {/* Node-based visualization */}
              <div className="relative min-h-[400px] overflow-x-auto">
                <div className="flex gap-4 pb-4" style={{ minWidth: sortedNodes.length * 140 }}>
                  {sortedNodes.map((node, i) => {
                    const meta = PROVENANCE_NODE_META[node.type];
                    const isSelected = selectedNode === node.id;
                    const hasOutgoing = mockProvenanceEdges.some(e => e.source === node.id);
                    
                    return (
                      <div key={node.id} className="flex items-center">
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.06 }}
                          onClick={() => setSelectedNode(isSelected ? null : node.id)}
                          className={`relative flex flex-col items-center w-[120px] p-3 rounded-xl border-2 transition-all ${
                            isSelected ? "border-accent bg-accent/5 shadow-lg" : "border-border bg-card hover:border-accent/30"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full ${meta.color} flex items-center justify-center text-white text-xs font-bold mb-2`}>
                            {node.author.initials}
                          </div>
                          <Badge variant="outline" className="text-[8px] mb-1">{meta.label}</Badge>
                          <p className="text-[10px] font-display font-medium text-foreground text-center leading-tight line-clamp-2">
                            {node.title}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-mono mt-1">
                            {new Date(node.timestamp).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                          </p>
                        </motion.button>
                        
                        {hasOutgoing && i < sortedNodes.length - 1 && (
                          <div className="flex items-center px-1">
                            <ArrowRight className="w-4 h-4 text-accent/40" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Edge legend */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                  {Object.entries(EDGE_LABELS).map(([key, meta]) => (
                    <span key={key} className={`text-[10px] font-display ${meta.color}`}>
                      ● {meta.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected node detail */}
              {selectedDetail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full ${PROVENANCE_NODE_META[selectedDetail.node.type].color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {selectedDetail.node.author.initials}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-sm font-semibold text-foreground">{selectedDetail.node.title}</h4>
                      <p className="text-xs text-muted-foreground font-display mt-1">{selectedDetail.node.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-display">
                        <span>{selectedDetail.node.author.name}</span>
                        <span>•</span>
                        <span>{selectedDetail.node.field}</span>
                        <span>•</span>
                        <span className="font-mono">{selectedDetail.node.hashDigest}</span>
                      </div>

                      {/* Connections */}
                      {selectedDetail.inEdges.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[10px] font-display font-semibold text-foreground mb-1">Incoming:</p>
                          {selectedDetail.inEdges.map(e => {
                            const source = mockProvenanceNodes.find(n => n.id === e.source);
                            const edgeMeta = EDGE_LABELS[e.relationship];
                            return source ? (
                              <div key={e.source} className="flex items-center gap-2 text-[10px] font-display text-muted-foreground">
                                <span className={edgeMeta.color}>{edgeMeta.label}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span>{source.title}</span>
                                <span className="text-[9px] font-mono">({source.author.initials})</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                      {selectedDetail.outEdges.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] font-display font-semibold text-foreground mb-1">Outgoing:</p>
                          {selectedDetail.outEdges.map(e => {
                            const target = mockProvenanceNodes.find(n => n.id === e.target);
                            const edgeMeta = EDGE_LABELS[e.relationship];
                            return target ? (
                              <div key={e.target} className="flex items-center gap-2 text-[10px] font-display text-muted-foreground">
                                <span className={edgeMeta.color}>{edgeMeta.label}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span>{target.title}</span>
                                <span className="text-[9px] font-mono">({target.author.initials})</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline" className="space-y-0">
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
              {sortedNodes.map((node, i) => {
                const meta = PROVENANCE_NODE_META[node.type];
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative pb-6 last:pb-0"
                  >
                    <div className={`absolute left-[-17px] w-3.5 h-3.5 rounded-full ${meta.color} border-2 border-background`} />
                    <div className="bg-card rounded-xl border border-border p-4 ml-4 hover:border-accent/30 transition-colors">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-[9px]">{meta.label}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{node.timestamp}</span>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-foreground">{node.title}</h4>
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
                          <code className="font-mono">{node.hashDigest.slice(0, 12)}…</code>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Attribution Chains */}
          <TabsContent value="chains" className="space-y-3">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-base font-semibold text-foreground mb-4">Attribution Chains</h3>
              <p className="text-xs text-muted-foreground font-display mb-4">
                Each chain shows how a contribution links to others — forming an immutable provenance record.
              </p>
              <div className="space-y-4">
                {mockProvenanceEdges.map((edge, i) => {
                  const source = mockProvenanceNodes.find(n => n.id === edge.source);
                  const target = mockProvenanceNodes.find(n => n.id === edge.target);
                  const edgeMeta = EDGE_LABELS[edge.relationship];
                  if (!source || !target) return null;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 text-xs font-display"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-6 h-6 rounded-full ${PROVENANCE_NODE_META[source.type].color} flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0`}>
                          {source.author.initials}
                        </div>
                        <span className="text-foreground truncate">{source.title}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary flex-shrink-0 ${edgeMeta.color}`}>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-[10px]">{edgeMeta.label}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-6 h-6 rounded-full ${PROVENANCE_NODE_META[target.type].color} flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0`}>
                          {target.author.initials}
                        </div>
                        <span className="text-foreground truncate">{target.title}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-sm font-semibold text-foreground mb-2">About Idea Provenance</h3>
              <p className="text-xs text-muted-foreground font-display leading-relaxed">
                Like provenance in art, every scientific idea has a chain of ownership and evolution. 
                This graph cryptographically tracks who first proposed an idea, who extended it, who challenged it, 
                and who replicated it — creating an immutable record of intellectual contribution that goes far beyond 
                traditional citation metrics.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default IdeaProvenance;
