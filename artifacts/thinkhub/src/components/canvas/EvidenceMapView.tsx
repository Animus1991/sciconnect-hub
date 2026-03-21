import { useMemo } from "react";
import {
  FlaskConical, HelpCircle, Lightbulb, GitBranch, BookOpen,
  StickyNote, ArrowRight, Sparkles, CircleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type CanvasNodeData, type Connection, type NodeType,
  NODE_TYPE_META, NODE_COLORS, CONN_TYPE_META,
} from "@/data/canvasData";

function nodeTypeIcon(type: NodeType, className = "w-3.5 h-3.5") {
  switch (type) {
    case "hypothesis": return <FlaskConical className={className} />;
    case "question":   return <HelpCircle className={className} />;
    case "insight":    return <Lightbulb className={className} />;
    case "evidence":   return <GitBranch className={className} />;
    case "citation":   return <BookOpen className={className} />;
    default:           return <StickyNote className={className} />;
  }
}

interface EvidenceMapViewProps {
  nodes: CanvasNodeData[];
  connections: Connection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

type EvidenceStatus = "supports" | "contradicts" | "unlinked";

interface EvidenceEntry {
  node: CanvasNodeData;
  status: EvidenceStatus;
  connLabel: string;
  claimId: string;
}

interface ClaimEntry {
  node: CanvasNodeData;
  supporting: EvidenceEntry[];
  contradicting: EvidenceEntry[];
  questions: EvidenceEntry[];
  unlinkedEvidence: CanvasNodeData[];
}

const CLAIM_TYPES: NodeType[] = ["hypothesis", "insight", "question"];
const EVIDENCE_TYPES: NodeType[] = ["evidence", "citation", "note"];

export default function EvidenceMapView({ nodes, connections, selectedId, onSelect, onOpen }: EvidenceMapViewProps) {
  const nodeMap = useMemo(() => {
    const m: Record<string, CanvasNodeData> = {};
    nodes.forEach(n => { m[n.id] = n; });
    return m;
  }, [nodes]);

  const data = useMemo((): ClaimEntry[] => {
    const claimNodes = nodes.filter(n => CLAIM_TYPES.includes(n.type));
    const evidenceNodes = nodes.filter(n => EVIDENCE_TYPES.includes(n.type));
    const linkedEvidenceIds = new Set<string>();

    const entries: ClaimEntry[] = claimNodes.map(claimNode => {
      const supporting: EvidenceEntry[] = [];
      const contradicting: EvidenceEntry[] = [];
      const questions: EvidenceEntry[] = [];

      connections.forEach(c => {
        let evNode: CanvasNodeData | undefined;
        let status: EvidenceStatus | "questions" | null = null;

        if (c.toId === claimNode.id) {
          evNode = nodeMap[c.fromId];
          if (c.connType === "supports")    { status = "supports"; }
          if (c.connType === "contradicts") { status = "contradicts"; }
          if (c.connType === "questions")   { status = "questions"; }
        }
        if (c.fromId === claimNode.id) {
          evNode = nodeMap[c.toId];
          if (c.connType === "questions")   { status = "questions"; }
          if (c.connType === "supports")    { status = "supports"; }
          if (c.connType === "contradicts") { status = "contradicts"; }
        }

        if (!evNode || !status) return;
        linkedEvidenceIds.add(evNode.id);
        const entry: EvidenceEntry = {
          node: evNode,
          status: status === "questions" ? "unlinked" : status,
          connLabel: CONN_TYPE_META[c.connType].label,
          claimId: claimNode.id,
        };
        if (status === "supports")    supporting.push(entry);
        if (status === "contradicts") contradicting.push(entry);
        if (status === "questions")   questions.push(entry);
      });

      return { node: claimNode, supporting, contradicting, questions, unlinkedEvidence: [] };
    });

    // Unlinked evidence nodes
    const unlinked = evidenceNodes.filter(n => !linkedEvidenceIds.has(n.id));

    return [...entries, ...(unlinked.length > 0 ? [{
      node: { id: "__unlinked", type: "section" as NodeType, title: "Unlinked Evidence", content: "", x: 0, y: 0, colorKey: "slate", tags: [], createdAt: "", updatedAt: "" },
      supporting: [],
      contradicting: [],
      questions: [],
      unlinkedEvidence: unlinked,
    }] : [])];
  }, [nodes, connections, nodeMap]);

  if (nodes.filter(n => CLAIM_TYPES.includes(n.type)).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <GitBranch className="w-12 h-12 opacity-20" />
        <div className="text-center max-w-xs">
          <p className="text-sm font-medium text-foreground">No claims or hypotheses found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add Hypothesis, Insight, or Question nodes, then connect Evidence or Citation nodes to them using "supports" or "contradicts" connections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      <div className="mb-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Evidence Map</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Claims vs. supporting and contradicting evidence</p>
      </div>

      {data.map(entry => {
        const col = NODE_COLORS[entry.node.colorKey ?? "slate"] ?? NODE_COLORS.slate;
        const isUnlinkedSection = entry.node.id === "__unlinked";

        if (isUnlinkedSection) {
          return (
            <div key="__unlinked" className="rounded-xl border border-border/50 overflow-hidden">
              <div className="px-4 py-3 bg-secondary/30 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <CircleAlert className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[12px] font-semibold text-muted-foreground">Unlinked Evidence / Citations</span>
                  <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">{entry.unlinkedEvidence.length}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">These nodes are not connected to any hypothesis or claim. Connect them to add them to the map.</p>
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                {entry.unlinkedEvidence.map(n => {
                  const ec = NODE_COLORS[n.colorKey] ?? NODE_COLORS.slate;
                  return (
                    <button
                      key={n.id}
                      onClick={() => onSelect(n.id)}
                      onDoubleClick={() => onOpen(n.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-left transition-colors",
                        selectedId === n.id ? "border-primary bg-primary/8" : "border-border bg-card hover:bg-secondary/50",
                        ec.tag
                      )}
                    >
                      {nodeTypeIcon(n.type, "w-3 h-3")}
                      <span className="text-[11px] font-medium text-foreground max-w-[140px] truncate">{n.title}</span>
                      {n.isAiGenerated && <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        const totalEvidence = entry.supporting.length + entry.contradicting.length;
        const hasEvidence = totalEvidence > 0;

        return (
          <div
            key={entry.node.id}
            className={cn(
              "rounded-xl border overflow-hidden",
              selectedId === entry.node.id ? "border-primary/60 shadow-md" : "border-border/50"
            )}
          >
            {/* Claim header */}
            <button
              onClick={() => onSelect(entry.node.id)}
              onDoubleClick={() => onOpen(entry.node.id)}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-3 border-b border-border/50 text-left transition-colors",
                selectedId === entry.node.id ? "bg-primary/8" : "bg-card hover:bg-secondary/30"
              )}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", col.headerBg ?? "bg-secondary", col.icon)}>
                {nodeTypeIcon(entry.node.type, "w-4 h-4")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wide", col.tag)}>
                    {NODE_TYPE_META[entry.node.type].label}
                  </span>
                  {entry.node.isAiGenerated && (
                    <span className="flex items-center gap-0.5 text-[9px] text-purple-400">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-semibold text-foreground mt-0.5 leading-snug">{entry.node.title}</p>
                {entry.node.content && (
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {entry.node.content.replace(/<[^>]+>/g, "").slice(0, 120)}
                  </p>
                )}
              </div>

              {/* Evidence summary badge */}
              {hasEvidence && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {entry.supporting.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 font-medium">
                      +{entry.supporting.length}
                    </span>
                  )}
                  {entry.contradicting.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-400/15 text-red-400 font-medium">
                      −{entry.contradicting.length}
                    </span>
                  )}
                </div>
              )}
            </button>

            {/* Evidence body */}
            {(hasEvidence || entry.questions.length > 0) ? (
              <div className="grid grid-cols-2 gap-0 bg-background/40">
                {/* Supporting column */}
                <div className="border-r border-border/50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400/70" />
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                      Supporting ({entry.supporting.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {entry.supporting.length === 0 && (
                      <p className="text-[10px] text-muted-foreground/60 italic">No supporting evidence linked</p>
                    )}
                    {entry.supporting.map(ev => (
                      <EvidenceCard key={ev.node.id + ev.claimId} ev={ev} selectedId={selectedId} onSelect={onSelect} onOpen={onOpen} />
                    ))}
                  </div>
                </div>

                {/* Contradicting column */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-400/70" />
                    <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">
                      Contradicting ({entry.contradicting.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {entry.contradicting.length === 0 && (
                      <p className="text-[10px] text-muted-foreground/60 italic">No counter-evidence linked</p>
                    )}
                    {entry.contradicting.map(ev => (
                      <EvidenceCard key={ev.node.id + ev.claimId} ev={ev} selectedId={selectedId} onSelect={onSelect} onOpen={onOpen} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-background/40">
                <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3" />
                  No evidence or citations connected yet. Connect Evidence or Citation nodes using "supports" or "contradicts" to populate this map.
                </p>
              </div>
            )}

            {/* Open questions */}
            {entry.questions.length > 0 && (
              <div className="border-t border-border/50 px-4 py-3 bg-purple-400/5">
                <div className="flex items-center gap-1.5 mb-2">
                  <HelpCircle className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">Open Questions ({entry.questions.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entry.questions.map(q => (
                    <button
                      key={q.node.id}
                      onClick={() => onSelect(q.node.id)}
                      className="text-[11px] px-2 py-1 rounded-lg bg-purple-400/10 text-purple-300 hover:bg-purple-400/20 transition-colors max-w-[200px] truncate text-left"
                    >
                      {q.node.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EvidenceCard({ ev, selectedId, onSelect, onOpen }: {
  ev: EvidenceEntry;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const col = NODE_COLORS[ev.node.colorKey] ?? NODE_COLORS.slate;
  const isSelected = ev.node.id === selectedId;

  return (
    <button
      onClick={() => onSelect(ev.node.id)}
      onDoubleClick={() => onOpen(ev.node.id)}
      className={cn(
        "w-full text-left p-2 rounded-lg border transition-colors",
        isSelected
          ? "border-primary/50 bg-primary/8"
          : ev.status === "supports"
          ? "border-emerald-400/25 bg-emerald-400/5 hover:bg-emerald-400/10"
          : "border-red-400/25 bg-red-400/5 hover:bg-red-400/10"
      )}
    >
      <div className="flex items-start gap-1.5">
        <span className={cn("mt-0.5 shrink-0", col.icon)}>{nodeTypeIcon(ev.node.type, "w-3 h-3")}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-foreground leading-snug line-clamp-2">{ev.node.title}</p>
          {ev.node.content && (
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
              {ev.node.content.replace(/<[^>]+>/g, "").slice(0, 80)}
            </p>
          )}
          {ev.node.type === "citation" && ev.node.author && (
            <p className="text-[10px] text-muted-foreground italic">{ev.node.author}{ev.node.year ? ` (${ev.node.year})` : ""}</p>
          )}
        </div>
        {ev.node.isAiGenerated && <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0 mt-0.5" />}
      </div>
    </button>
  );
}
