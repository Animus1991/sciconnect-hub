import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GraphNode {
  id: string;
  label: string;
  citations: number;
  x: number;
  y: number;
  type: "own" | "citing" | "cited";
}

interface GraphEdge {
  source: string;
  target: string;
}

const nodes: GraphNode[] = [
  { id: "p1", label: "Attention Mechanisms in Transformers", citations: 142, x: 300, y: 200, type: "own" },
  { id: "p2", label: "CRISPR-Cas13d RNA Editing", citations: 67, x: 500, y: 120, type: "own" },
  { id: "p3", label: "Ocean Microplastic Distribution", citations: 89, x: 160, y: 340, type: "own" },
  { id: "c1", label: "Vision Transformer Survey", citations: 210, x: 520, y: 300, type: "citing" },
  { id: "c2", label: "Efficient Self-Attention", citations: 95, x: 140, y: 130, type: "citing" },
  { id: "c3", label: "RNA Therapeutics Review", citations: 180, x: 650, y: 200, type: "citing" },
  { id: "c4", label: "Marine Pollution Meta-Analysis", citations: 120, x: 80, y: 250, type: "citing" },
  { id: "d1", label: "Original Transformer Paper", citations: 12000, x: 300, y: 50, type: "cited" },
  { id: "d2", label: "CRISPR-Cas9 Discovery", citations: 8500, x: 600, y: 40, type: "cited" },
  { id: "d3", label: "Microplastic Sampling Methods", citations: 340, x: 40, y: 400, type: "cited" },
];

const edges: GraphEdge[] = [
  { source: "d1", target: "p1" }, { source: "d1", target: "c2" },
  { source: "p1", target: "c1" }, { source: "p1", target: "c2" },
  { source: "d2", target: "p2" }, { source: "p2", target: "c3" },
  { source: "d3", target: "p3" }, { source: "p3", target: "c4" },
  { source: "p1", target: "c3" }, { source: "p3", target: "c1" },
];

const typeColors: Record<string, { fill: string; stroke: string; label: string }> = {
  own: { fill: "hsl(var(--accent))", stroke: "hsl(var(--accent))", label: "Your Papers" },
  citing: { fill: "hsl(var(--emerald))", stroke: "hsl(var(--emerald))", label: "Citing Papers" },
  cited: { fill: "hsl(var(--scholarly))", stroke: "hsl(var(--scholarly))", label: "Cited Papers" },
};

const CitationGraph: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const activeEdges = useMemo(() => {
    if (!hoveredNode && !selectedNode) return edges;
    const active = hoveredNode || selectedNode;
    return edges.filter(e => e.source === active || e.target === active);
  }, [hoveredNode, selectedNode]);

  const nodeRadius = (citations: number) => Math.max(12, Math.min(28, Math.sqrt(citations) * 1.2));

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">Citation Network</h3>
        <div className="flex items-center gap-4">
          {Object.entries(typeColors).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: val.fill }} />
              <span className="text-[11px] text-muted-foreground font-display">{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 720 440" className="w-full h-auto">
        {/* Edges */}
        {edges.map((edge, i) => {
          const src = nodes.find(n => n.id === edge.source)!;
          const tgt = nodes.find(n => n.id === edge.target)!;
          const isActive = activeEdges.includes(edge);
          return (
            <line key={i} x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
              stroke="hsl(var(--border))" strokeWidth={isActive ? 2 : 1}
              opacity={(!hoveredNode && !selectedNode) ? 0.4 : isActive ? 0.8 : 0.1}
              className="transition-all duration-300" />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const r = nodeRadius(node.citations);
          const colors = typeColors[node.type];
          const isActive = hoveredNode === node.id || selectedNode === node.id;
          const isConnected = activeEdges.some(e => e.source === node.id || e.target === node.id);
          const dimmed = (hoveredNode || selectedNode) && !isActive && !isConnected;

          return (
            <g key={node.id} className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(prev => prev === node.id ? null : node.id)}>
              <circle cx={node.x} cy={node.y} r={r + 4}
                fill="transparent" stroke={colors.stroke}
                strokeWidth={isActive ? 3 : 0} opacity={isActive ? 0.5 : 0}
                className="transition-all duration-300" />
              <circle cx={node.x} cy={node.y} r={r}
                fill={colors.fill} opacity={dimmed ? 0.2 : node.type === 'own' ? 1 : 0.7}
                className="transition-all duration-300" />
              <text x={node.x} y={node.y + r + 14}
                textAnchor="middle" className="fill-foreground transition-opacity duration-300"
                fontSize={10} fontFamily="Space Grotesk" opacity={dimmed ? 0.2 : 1}>
                {node.label.length > 22 ? node.label.slice(0, 22) + '…' : node.label}
              </text>
              <text x={node.x} y={node.y + 4}
                textAnchor="middle" className="fill-background transition-opacity duration-300"
                fontSize={9} fontWeight="bold" fontFamily="Space Grotesk" opacity={dimmed ? 0.2 : 1}>
                {node.citations >= 1000 ? (node.citations / 1000).toFixed(1) + 'K' : node.citations}
              </text>
            </g>
          );
        })}
      </svg>

      {selectedNode && (() => {
        const node = nodes.find(n => n.id === selectedNode);
        if (!node) return null;
        const incoming = edges.filter(e => e.target === node.id).length;
        const outgoing = edges.filter(e => e.source === node.id).length;
        return (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm font-display font-medium text-foreground">{node.label}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground font-display">
              <span><strong className="text-foreground">{node.citations}</strong> citations</span>
              <span><strong className="text-foreground">{incoming}</strong> references</span>
              <span><strong className="text-foreground">{outgoing}</strong> cited by</span>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
};

export default CitationGraph;
