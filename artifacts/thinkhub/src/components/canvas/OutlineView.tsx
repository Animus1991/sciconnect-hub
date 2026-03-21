import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, StickyNote, Lightbulb, HelpCircle, FlaskConical,
  BookOpen, GitBranch, ListChecks, FileText, ImageIcon, FileType, AlignLeft,
  Tag, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type CanvasNodeData, type Connection, type NodeType, NODE_TYPE_META, NODE_COLORS, CONN_TYPE_META } from "@/data/canvasData";

function nodeTypeIcon(type: NodeType, className = "w-3.5 h-3.5") {
  const cls = className;
  switch (type) {
    case "note":       return <StickyNote className={cls} />;
    case "insight":    return <Lightbulb className={cls} />;
    case "question":   return <HelpCircle className={cls} />;
    case "hypothesis": return <FlaskConical className={cls} />;
    case "citation":   return <BookOpen className={cls} />;
    case "evidence":   return <GitBranch className={cls} />;
    case "task":       return <ListChecks className={cls} />;
    case "document":   return <FileText className={cls} />;
    case "image":      return <ImageIcon className={cls} />;
    case "pdf":        return <FileType className={cls} />;
    case "section":    return <AlignLeft className={cls} />;
  }
}

const TYPE_ORDER: NodeType[] = [
  "hypothesis", "question", "insight", "evidence", "citation",
  "note", "task", "document", "section", "image", "pdf",
];

interface OutlineViewProps {
  nodes: CanvasNodeData[];
  connections: Connection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export default function OutlineView({ nodes, connections, selectedId, onSelect, onOpen }: OutlineViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const map: Record<string, CanvasNodeData[]> = {};
    TYPE_ORDER.forEach(t => { map[t] = []; });
    nodes.forEach(n => {
      if (!map[n.type]) map[n.type] = [];
      map[n.type].push(n);
    });
    return TYPE_ORDER.map(t => ({ type: t, nodes: map[t] })).filter(g => g.nodes.length > 0);
  }, [nodes]);

  const connMap = useMemo(() => {
    const m: Record<string, Connection[]> = {};
    connections.forEach(c => {
      if (!m[c.fromId]) m[c.fromId] = [];
      m[c.fromId].push(c);
    });
    return m;
  }, [connections]);

  const nodeMap = useMemo(() => {
    const m: Record<string, CanvasNodeData> = {};
    nodes.forEach(n => { m[n.id] = n; });
    return m;
  }, [nodes]);

  const toggleGroup = (type: string) => {
    setCollapsed(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <AlignLeft className="w-12 h-12 opacity-20" />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">No nodes to outline</p>
          <p className="text-xs text-muted-foreground mt-1">Add nodes in Canvas mode to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Outline View</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">{nodes.length} nodes · {connections.length} connections · grouped by type</p>
      </div>

      {grouped.map(({ type, nodes: groupNodes }) => {
        const meta = NODE_TYPE_META[type];
        const col = NODE_COLORS[meta.defaultColor] ?? NODE_COLORS.slate;
        const isCollapsed = collapsed[type];

        return (
          <div key={type} className="rounded-xl border border-border/50 overflow-hidden">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(type)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-card hover:bg-secondary/50 transition-colors"
            >
              <span className={col.icon}>{nodeTypeIcon(type)}</span>
              <span className="text-[12px] font-semibold text-foreground flex-1 text-left">
                {meta.label}s
              </span>
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                {groupNodes.length}
              </span>
              {isCollapsed
                ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>

            {/* Group items */}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-border/30">
                    {groupNodes.map(node => {
                      const nodeConns = connMap[node.id] ?? [];
                      const isSelected = node.id === selectedId;

                      return (
                        <div
                          key={node.id}
                          className={cn(
                            "group px-3 py-2.5 cursor-pointer transition-colors",
                            isSelected
                              ? "bg-primary/8 border-l-2 border-primary"
                              : "bg-card/50 hover:bg-secondary/30 border-l-2 border-transparent"
                          )}
                          onClick={() => onSelect(node.id)}
                          onDoubleClick={() => onOpen(node.id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <p className={cn(
                                  "text-[12px] font-medium leading-snug",
                                  isSelected ? "text-foreground" : "text-foreground/90"
                                )}>
                                  {node.title || "Untitled"}
                                </p>
                                {node.isAiGenerated && (
                                  <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0" title="AI generated" />
                                )}
                              </div>

                              {/* Content preview */}
                              {node.content && node.type !== "image" && node.type !== "pdf" && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1">
                                  {node.content.replace(/<[^>]+>/g, "").slice(0, 100)}
                                </p>
                              )}

                              {/* Citation metadata */}
                              {node.type === "citation" && (node.author || node.year) && (
                                <p className="text-[10px] text-muted-foreground italic mb-1">
                                  {node.author}{node.year ? ` (${node.year})` : ""}
                                  {node.journal ? ` · ${node.journal}` : ""}
                                </p>
                              )}

                              {/* Tags */}
                              {node.tags && node.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {node.tags.slice(0, 3).map(t => (
                                    <span key={t} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-secondary/80 text-[9px] text-muted-foreground">
                                      <Tag className="w-2 h-2" />{t}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Outgoing connections */}
                              {nodeConns.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {nodeConns.slice(0, 3).map(c => {
                                    const target = nodeMap[c.toId];
                                    const connMeta = CONN_TYPE_META[c.connType];
                                    return target ? (
                                      <span
                                        key={c.id}
                                        className="text-[9px] px-1.5 py-0.5 rounded-full border"
                                        style={{ color: connMeta.stroke, borderColor: connMeta.stroke + "50" }}
                                      >
                                        {connMeta.label} "{target.title.slice(0, 20)}{target.title.length > 20 ? "…" : ""}"
                                      </span>
                                    ) : null;
                                  })}
                                  {nodeConns.length > 3 && (
                                    <span className="text-[9px] text-muted-foreground">+{nodeConns.length - 3} more</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Status / type badge */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {node.status && node.status !== "open" && (
                                <span className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                                  node.status === "done" ? "bg-emerald-400/15 text-emerald-400" :
                                  node.status === "resolved" ? "bg-blue-400/15 text-blue-400" :
                                  "bg-amber-400/15 text-amber-400"
                                )}>
                                  {node.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Connections summary */}
      {connections.length > 0 && (
        <div className="rounded-xl border border-border/50 overflow-hidden mt-3">
          <button
            onClick={() => toggleGroup("__connections")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-card hover:bg-secondary/50 transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[12px] font-semibold text-foreground flex-1 text-left">Connections</span>
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{connections.length}</span>
            {collapsed["__connections"] ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          <AnimatePresence initial={false}>
            {!collapsed["__connections"] && (
              <motion.div
                initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                transition={{ duration: 0.18 }} className="overflow-hidden"
              >
                <div className="divide-y divide-border/30">
                  {connections.map(c => {
                    const from = nodeMap[c.fromId];
                    const to = nodeMap[c.toId];
                    const meta = CONN_TYPE_META[c.connType];
                    if (!from || !to) return null;
                    return (
                      <div key={c.id} className="px-3 py-2 bg-card/50 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.stroke }} />
                        <p className="text-[11px] text-foreground flex-1 min-w-0">
                          <span className="font-medium truncate">{from.title.slice(0, 24)}</span>
                          <span className="text-muted-foreground mx-1.5">{meta.label}</span>
                          <span className="font-medium truncate">{to.title.slice(0, 24)}</span>
                        </p>
                        {c.isAiGenerated && <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0" title="AI suggested" />}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
