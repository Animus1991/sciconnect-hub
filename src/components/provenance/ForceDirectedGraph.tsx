import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";
import { mockProvenanceNodes, mockProvenanceEdges, PROVENANCE_NODE_META, type ProvenanceNode, type ProvenanceEdge } from "@/data/blockchainMockData";

interface Position { x: number; y: number }
interface SimNode extends ProvenanceNode { x: number; y: number; vx: number; vy: number; fx?: number; fy?: number }

const EDGE_COLORS: Record<string, string> = {
  inspired: "#f59e0b",
  extended: "#3b82f6",
  replicated: "#10b981",
  cited: "#a855f7",
  challenged: "#f43f5e",
  refined: "#06b6d4",
};

const EDGE_LABELS: Record<string, string> = {
  inspired: "Inspired",
  extended: "Extended",
  replicated: "Replicated",
  cited: "Cited",
  challenged: "Challenged",
  refined: "Refined",
};

// Simple force simulation
function runSimulation(nodes: SimNode[], edges: ProvenanceEdge[], iterations = 120) {
  const width = 700, height = 450;
  // Initialize positions in a circle
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    n.x = width / 2 + Math.cos(angle) * 160 + (Math.random() - 0.5) * 20;
    n.y = height / 2 + Math.sin(angle) * 140 + (Math.random() - 0.5) * 20;
    n.vx = 0;
    n.vy = 0;
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;
    const strength = alpha * 0.4;

    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (800 / (dist * dist)) * strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // Attraction along edges
    edges.forEach(e => {
      const s = nodeMap.get(e.source);
      const t = nodeMap.get(e.target);
      if (!s || !t) return;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist - 120) * 0.01 * strength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      s.vx += fx;
      s.vy += fy;
      t.vx -= fx;
      t.vy -= fy;
    });

    // Center gravity
    nodes.forEach(n => {
      n.vx += (width / 2 - n.x) * 0.005 * strength;
      n.vy += (height / 2 - n.y) * 0.005 * strength;
    });

    // Apply velocity with damping
    nodes.forEach(n => {
      n.vx *= 0.85;
      n.vy *= 0.85;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(40, Math.min(width - 40, n.x));
      n.y = Math.max(40, Math.min(height - 40, n.y));
    });
  }

  return nodes;
}

interface ForceDirectedGraphProps {
  onNodeSelect: (id: string | null) => void;
  selectedNode: string | null;
}

export default function ForceDirectedGraph({ onNodeSelect, selectedNode }: ForceDirectedGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const simNodes = useMemo(() => {
    const nodes: SimNode[] = mockProvenanceNodes.map(n => ({
      ...n, x: 0, y: 0, vx: 0, vy: 0,
    }));
    return runSimulation(nodes, mockProvenanceEdges);
  }, []);

  const nodeMap = useMemo(() => new Map(simNodes.map(n => [n.id, n])), [simNodes]);

  const connectedToSelected = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const ids = new Set<string>();
    mockProvenanceEdges.forEach(e => {
      if (e.source === selectedNode) ids.add(e.target);
      if (e.target === selectedNode) ids.add(e.source);
    });
    ids.add(selectedNode);
    return ids;
  }, [selectedNode]);

  const handleZoom = useCallback((delta: number) => {
    setZoom(z => Math.max(0.4, Math.min(3, z + delta)));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).tagName === "rect") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
  }, [handleZoom]);

  // Arrow marker for edges
  const getEdgePath = (s: SimNode, t: SimNode) => {
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = 22;
    const sx = s.x + (dx / dist) * offset;
    const sy = s.y + (dy / dist) * offset;
    const tx = t.x - (dx / dist) * offset;
    const ty = t.y - (dy / dist) * offset;
    // Curved path
    const mx = (sx + tx) / 2 + (dy / dist) * 20;
    const my = (sy + ty) / 2 - (dx / dist) * 20;
    return `M${sx},${sy} Q${mx},${my} ${tx},${ty}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h3 className="font-serif text-base font-semibold text-foreground">Interactive Provenance Graph</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => handleZoom(0.2)} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Zoom in">
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => handleZoom(-0.2)} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Zoom out">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={resetView} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Reset view">
            <Maximize2 className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-[10px] font-mono text-muted-foreground ml-2">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative cursor-grab active:cursor-grabbing"
        style={{ height: 480 }}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 700 450"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="select-none"
        >
          <defs>
            {Object.entries(EDGE_COLORS).map(([key, color]) => (
              <marker key={key} id={`arrow-${key}`} viewBox="0 0 10 6" refX="8" refY="3"
                markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 3 L 0 6 z" fill={color} opacity={0.7} />
              </marker>
            ))}
          </defs>

          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Background for panning */}
            <rect x="0" y="0" width="700" height="450" fill="transparent" />

            {/* Edges */}
            {mockProvenanceEdges.map((edge, i) => {
              const s = nodeMap.get(edge.source);
              const t = nodeMap.get(edge.target);
              if (!s || !t) return null;
              const isHighlighted = selectedNode && (edge.source === selectedNode || edge.target === selectedNode);
              const isDimmed = selectedNode && !isHighlighted;
              return (
                <g key={i}>
                  <path
                    d={getEdgePath(s, t)}
                    stroke={EDGE_COLORS[edge.relationship] || "#888"}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    fill="none"
                    opacity={isDimmed ? 0.15 : isHighlighted ? 1 : 0.5}
                    markerEnd={`url(#arrow-${edge.relationship})`}
                    className="transition-opacity duration-200"
                  />
                  {/* Edge label on hover */}
                  {isHighlighted && (
                    <text
                      x={(s.x + t.x) / 2 + ((t.y - s.y) / Math.max(Math.sqrt((t.x-s.x)**2+(t.y-s.y)**2),1)) * 12}
                      y={(s.y + t.y) / 2 - ((t.x - s.x) / Math.max(Math.sqrt((t.x-s.x)**2+(t.y-s.y)**2),1)) * 12}
                      textAnchor="middle"
                      className="fill-muted-foreground"
                      fontSize={8}
                      fontFamily="system-ui"
                    >
                      {EDGE_LABELS[edge.relationship]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {simNodes.map(node => {
              const meta = PROVENANCE_NODE_META[node.type];
              const isSelected = selectedNode === node.id;
              const isConnected = connectedToSelected.has(node.id);
              const isDimmed = selectedNode && !isConnected;
              const isHovered = hoveredNode === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onClick={(e) => { e.stopPropagation(); onNodeSelect(isSelected ? null : node.id); }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                  opacity={isDimmed ? 0.25 : 1}
                  style={{ transition: "opacity 0.2s" }}
                >
                  {/* Glow ring for selected */}
                  {isSelected && (
                    <circle r="26" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.5">
                      <animate attributeName="r" values="24;28;24" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Node circle */}
                  <circle
                    r={isSelected ? 22 : isHovered ? 20 : 18}
                    className={meta.color}
                    fill="currentColor"
                    stroke={isSelected ? "hsl(var(--accent))" : isHovered ? "hsl(var(--foreground))" : "hsl(var(--border))"}
                    strokeWidth={isSelected ? 3 : 1.5}
                    style={{ transition: "r 0.15s, stroke-width 0.15s" }}
                  />

                  {/* Author initials */}
                  <text textAnchor="middle" dy="1" className="fill-white" fontSize={10} fontWeight="bold" fontFamily="system-ui" style={{ pointerEvents: "none" }}>
                    {node.author.initials}
                  </text>

                  {/* Label below */}
                  <text textAnchor="middle" dy="32" className="fill-foreground" fontSize={8} fontWeight="600" fontFamily="system-ui" style={{ pointerEvents: "none" }}>
                    {node.title.length > 22 ? node.title.slice(0, 22) + "…" : node.title}
                  </text>
                  <text textAnchor="middle" dy="42" fontSize={7} fontFamily="system-ui" style={{ pointerEvents: "none" }} className="fill-muted-foreground">
                    {meta.label} · {new Date(node.timestamp).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                  </text>

                  {/* Tooltip on hover */}
                  {isHovered && !isSelected && (
                    <g transform="translate(25, -30)">
                      <rect rx="6" ry="6" x="0" y="0" width="180" height="48" className="fill-card stroke-border" strokeWidth="1" />
                      <text x="8" y="16" fontSize={8} fontWeight="600" className="fill-foreground" fontFamily="system-ui">
                        {node.title.length > 30 ? node.title.slice(0, 30) + "…" : node.title}
                      </text>
                      <text x="8" y="28" fontSize={7} className="fill-muted-foreground" fontFamily="system-ui">
                        {node.author.name} · {node.field}
                      </text>
                      <text x="8" y="40" fontSize={6} className="fill-muted-foreground" fontFamily="monospace">
                        {node.hashDigest}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Pan hint */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] text-muted-foreground font-display opacity-50">
          <Move className="w-3 h-3" /> Drag to pan · Scroll to zoom · Click nodes to explore
        </div>
      </div>

      {/* Edge legend */}
      <div className="flex flex-wrap gap-3 px-4 py-2.5 border-t border-border">
        {Object.entries(EDGE_LABELS).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5 text-[10px] font-display text-muted-foreground">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: EDGE_COLORS[key] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
