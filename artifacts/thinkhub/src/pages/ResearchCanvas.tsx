import { useState, useRef, useEffect, useCallback, type DragEvent, type WheelEvent } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Upload, ZoomIn, ZoomOut, Maximize2, Trash2, FileText, ImageIcon,
  FileType, StickyNote, Type, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Link2, RotateCcw, RotateCw, Download, X, Plus, Move, Search,
  ChevronDown, BookOpen, Brain, Layers, MoreHorizontal, PanelLeftClose,
  Pin, Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────── */
type NodeType = "document" | "image" | "pdf" | "text" | "note";

interface NodeColor {
  bg: string;
  border: string;
  icon: string;
  label: string;
}

const NODE_COLORS: Record<string, NodeColor> = {
  blue:   { bg: "bg-card", border: "border-blue-400/70",   icon: "text-blue-500",   label: "Blue" },
  purple: { bg: "bg-card", border: "border-purple-400/70", icon: "text-purple-500", label: "Purple" },
  green:  { bg: "bg-card", border: "border-emerald-400/70",icon: "text-emerald-500",label: "Green" },
  amber:  { bg: "bg-card", border: "border-amber-400/70",  icon: "text-amber-500",  label: "Amber" },
  rose:   { bg: "bg-card", border: "border-rose-400/70",   icon: "text-rose-500",   label: "Rose" },
  slate:  { bg: "bg-card", border: "border-slate-400/70",  icon: "text-slate-400",  label: "Slate" },
};

interface CanvasNodeData {
  id: string;
  type: NodeType;
  title: string;
  content: string;
  url?: string;
  mimeType?: string;
  fileSize?: number;
  x: number;
  y: number;
  colorKey: string;
  pinned?: boolean;
  tags?: string[];
}

interface DragState {
  active: boolean;
  nodeId?: string;
  startMouseX: number;
  startMouseY: number;
  startNodeX: number;
  startNodeY: number;
  startPanX: number;
  startPanY: number;
  mode: "pan" | "node";
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.12;

/* ─── Helpers ────────────────────────────────────────────────── */
function detectType(mimeType: string, name: string): NodeType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("text/") || name.endsWith(".md") || name.endsWith(".txt")) return "document";
  return "document";
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function nodeIcon(type: NodeType, colorKey: string, size = "w-5 h-5") {
  const col = NODE_COLORS[colorKey]?.icon ?? "text-primary";
  switch (type) {
    case "image":    return <ImageIcon className={cn(size, col)} />;
    case "pdf":      return <FileType className={cn(size, col)} />;
    case "note":     return <StickyNote className={cn(size, col)} />;
    case "text":     return <Type className={cn(size, col)} />;
    default:         return <FileText className={cn(size, col)} />;
  }
}

function genId() { return `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

/* ─── RichTextEditor ─────────────────────────────────────────── */
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
}

function RichTextEditor({ value, onChange, readOnly = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, []);

  const exec = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const ToolBtn = ({ cmd, val, title, children }: { cmd: string; val?: string; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }}
      className="w-7 h-7 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {!readOnly && (
        <div className="flex flex-wrap gap-0.5 p-2 border-b border-border bg-card sticky top-0 z-10">
          <ToolBtn cmd="undo" title="Undo"><RotateCcw className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="redo" title="Redo"><RotateCw className="w-3.5 h-3.5" /></ToolBtn>
          <div className="w-px h-5 bg-border mx-1 self-center" />
          <ToolBtn cmd="bold" title="Bold"><Bold className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="italic" title="Italic"><Italic className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="underline" title="Underline"><Underline className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="strikeThrough" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>
          <div className="w-px h-5 bg-border mx-1 self-center" />
          <ToolBtn cmd="formatBlock" val="h2" title="Heading 1"><span className="text-[11px] font-bold">H1</span></ToolBtn>
          <ToolBtn cmd="formatBlock" val="h3" title="Heading 2"><span className="text-[11px] font-bold">H2</span></ToolBtn>
          <ToolBtn cmd="formatBlock" val="p" title="Paragraph"><span className="text-[11px]">P</span></ToolBtn>
          <div className="w-px h-5 bg-border mx-1 self-center" />
          <ToolBtn cmd="insertUnorderedList" title="Bullet list"><List className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="insertOrderedList" title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>
          <div className="w-px h-5 bg-border mx-1 self-center" />
          <ToolBtn cmd="justifyLeft" title="Align left"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="justifyCenter" title="Align center"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="justifyRight" title="Align right"><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
          <div className="w-px h-5 bg-border mx-1 self-center" />
          <ToolBtn cmd="createLink" val={prompt as unknown as string} title="Insert link">
            <Link2 className="w-3.5 h-3.5" />
          </ToolBtn>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        data-placeholder="Start writing your research notes…"
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
        className={cn(
          "flex-1 p-4 outline-none overflow-y-auto text-sm text-foreground leading-relaxed",
          "prose prose-sm max-w-none dark:prose-invert",
          "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5",
          "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4",
          "[&_a]:text-primary [&_a]:underline",
          !readOnly && "cursor-text"
        )}
      />
    </div>
  );
}

/* ─── DocumentViewer ─────────────────────────────────────────── */
interface DocumentViewerProps {
  node: CanvasNodeData;
  onClose: () => void;
  onSave: (id: string, content: string, title: string) => void;
}

function DocumentViewer({ node, onClose, onSave }: DocumentViewerProps) {
  const [editTitle, setEditTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  const [saved, setSaved] = useState(true);
  const [imgZoom, setImgZoom] = useState(1);

  const handleSave = useCallback(() => {
    onSave(node.id, content, editTitle);
    setSaved(true);
    toast.success("Changes saved");
  }, [node.id, content, editTitle, onSave]);

  // Auto-save on content change
  useEffect(() => { setSaved(false); }, [content, editTitle]);

  // Keyboard: Ctrl+S save, Escape close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const isImage = node.type === "image";
  const isPdf   = node.type === "pdf";
  const isText  = node.type === "text" || node.type === "note";
  const isDoc   = node.type === "document" && !isPdf && !isImage;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className={cn(
        "flex flex-col gap-0 p-0 overflow-hidden",
        isImage ? "max-w-4xl" : "max-w-4xl",
        "h-[88vh]"
      )}>
        {/* Header */}
        <DialogHeader className="flex-none px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex-none">{nodeIcon(node.type, node.colorKey, "w-5 h-5")}</div>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none truncate placeholder:text-muted-foreground"
              placeholder="Untitled"
            />
            <div className="flex items-center gap-2 flex-none">
              {!saved && (
                <span className="text-[11px] text-muted-foreground">Unsaved</span>
              )}
              {(isText || isDoc) && (
                <button
                  onClick={handleSave}
                  className="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
              )}
              {node.url && (
                <a
                  href={node.url}
                  download={node.title}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}
              {node.fileSize && (
                <span className="text-[11px] text-muted-foreground">{fmtSize(node.fileSize)}</span>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-auto bg-background">
          {isImage && node.url && (
            <div className="flex flex-col items-center min-h-full p-4 gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setImgZoom(z => Math.max(0.2, z - 0.15))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[12px] text-muted-foreground min-w-[44px] text-center">{Math.round(imgZoom * 100)}%</span>
                <button onClick={() => setImgZoom(z => Math.min(4, z + 0.15))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setImgZoom(1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="overflow-auto flex-1 flex items-start justify-center w-full">
                <img
                  src={node.url}
                  alt={node.title}
                  style={{ transform: `scale(${imgZoom})`, transformOrigin: "top center", transition: "transform 0.2s" }}
                  className="max-w-full rounded-lg shadow-md"
                  draggable={false}
                />
              </div>
            </div>
          )}

          {isPdf && node.url && (
            <iframe
              src={node.url}
              title={node.title}
              className="w-full h-full border-none"
              style={{ minHeight: "75vh" }}
            />
          )}

          {(isText || isDoc) && (
            <RichTextEditor
              value={content}
              onChange={(html) => { setContent(html); setSaved(false); }}
            />
          )}

          {/* Fallback for unknown files */}
          {!isImage && !isPdf && !isText && !isDoc && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <FileText className="w-16 h-16 opacity-20" />
              <p className="text-sm">Preview not available for this file type.</p>
              {node.url && (
                <a href={node.url} download={node.title}
                  className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── CanvasNodeCard ─────────────────────────────────────────── */
interface CanvasNodeCardProps {
  node: CanvasNodeData;
  selected: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, colorKey: string) => void;
  onTogglePin: (id: string) => void;
}

function CanvasNodeCard({
  node, selected, onMouseDown, onClick, onDelete, onColorChange, onTogglePin,
}: CanvasNodeCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const col = NODE_COLORS[node.colorKey] ?? NODE_COLORS.blue;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false); setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isNote = node.type === "note";

  return (
    <div
      className={cn(
        "absolute group select-none",
        isNote ? "w-48" : "w-44",
        "rounded-xl border-2 shadow-sm transition-shadow",
        col.bg, col.border,
        selected && "ring-2 ring-primary ring-offset-1 shadow-md",
        !selected && "hover:shadow-md",
        "cursor-grab active:cursor-grabbing"
      )}
      style={{ left: node.x, top: node.y, zIndex: selected ? 10 : (node.pinned ? 5 : 2) }}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, node.id); }}
      onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
    >
      {/* Card top strip + actions */}
      <div className={cn("flex items-center justify-between px-2.5 pt-2.5 pb-1.5")}>
        <div className="flex items-center gap-1.5 min-w-0">
          {nodeIcon(node.type, node.colorKey, "w-4 h-4 shrink-0")}
          <span className={cn("text-[10px] font-semibold uppercase tracking-wide", col.icon)}>
            {node.type === "note" ? "Note" : node.type === "image" ? "Image" : node.type === "pdf" ? "PDF" : "Doc"}
          </span>
        </div>
        <div ref={menuRef} className="relative flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.pinned && <Pin className="w-3 h-3 text-muted-foreground" />}
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(p => !p); setShowColorPicker(false); }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 min-w-[140px] bg-card border border-border rounded-xl shadow-lg py-1 z-50" onClick={e => e.stopPropagation()}>
              <button onClick={() => { onClick(node.id); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" /> Open
              </button>
              <button onClick={() => { onTogglePin(node.id); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left transition-colors">
                <Pin className="w-3.5 h-3.5 text-muted-foreground" /> {node.pinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={() => { setShowColorPicker(true); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left transition-colors">
                <Palette className="w-3.5 h-3.5 text-muted-foreground" /> Color
              </button>
              <div className="my-1 border-t border-border/60" />
              <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-destructive hover:bg-destructive/10 w-full text-left transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg p-2 z-50 flex flex-wrap gap-1.5 w-[116px]" onClick={e => e.stopPropagation()}>
              {Object.entries(NODE_COLORS).map(([key, c]) => (
                <button
                  key={key}
                  title={c.label}
                  onClick={() => { onColorChange(node.id, key); setShowColorPicker(false); }}
                  className={cn("w-7 h-7 rounded-full border-2 transition-transform hover:scale-110", `bg-${key}-400`,
                    node.colorKey === key ? "border-foreground" : "border-transparent"
                  )}
                  style={{ background: `hsl(${key === "blue" ? "221 90% 60%" : key === "purple" ? "262 72% 60%" : key === "green" ? "162 63% 45%" : key === "amber" ? "38 92% 55%" : key === "rose" ? "0 72% 55%" : "220 9% 55%"})` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-2.5 pb-2.5">
        {node.type === "image" && node.url ? (
          <div className="rounded-lg overflow-hidden mb-2 h-24 bg-secondary">
            <img src={node.url} alt={node.title} className="w-full h-full object-cover" draggable={false} />
          </div>
        ) : node.type === "note" ? (
          <p className="text-[12px] text-foreground/80 leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {node.content.replace(/<[^>]+>/g, "").slice(0, 120) || "Empty note…"}
          </p>
        ) : (
          <div className="flex items-center gap-2 py-2 px-2 rounded-lg bg-secondary">
            {nodeIcon(node.type, node.colorKey, "w-6 h-6 opacity-70 shrink-0")}
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">{node.mimeType ?? "Document"}</p>
              {node.fileSize && <p className="text-[10px] text-muted-foreground/60">{fmtSize(node.fileSize)}</p>}
            </div>
          </div>
        )}
        <p className="mt-1.5 text-[12px] font-medium text-foreground leading-tight line-clamp-2">{node.title || "Untitled"}</p>
      </div>
    </div>
  );
}

/* ─── ResearchCanvas (Main Page) ─────────────────────────────── */
const INITIAL_NODES: CanvasNodeData[] = [
  {
    id: "sample_note_1",
    type: "note",
    title: "Research Focus",
    content: "<p>Welcome to your <strong>Research Canvas</strong>.</p><p>Use this space to visually organize your research materials, papers, and ideas.</p><ul><li>Drag nodes to arrange them</li><li>Scroll to zoom in/out</li><li>Click a node to open it</li></ul>",
    x: 80, y: 80,
    colorKey: "purple",
  },
  {
    id: "sample_doc_1",
    type: "document",
    title: "Attention Is All You Need — Notes",
    content: "<h2>Key Contributions</h2><p>The Transformer model relies entirely on attention mechanisms, dispensing with recurrence and convolutions entirely.</p><h2>Architecture</h2><p>Encoder-Decoder with multi-head self-attention and position-wise feed-forward networks.</p>",
    x: 310, y: 80,
    colorKey: "blue",
    tags: ["NLP", "Attention", "Deep Learning"],
  },
  {
    id: "sample_note_2",
    type: "note",
    title: "Next Steps",
    content: "<ul><li>Run baseline experiments</li><li>Review literature on RLHF</li><li>Schedule collab meeting with Prof. Hassan</li></ul>",
    x: 80, y: 310,
    colorKey: "amber",
  },
];

export default function ResearchCanvas() {
  const [nodes, setNodes] = useState<CanvasNodeData[]>(INITIAL_NODES);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    active: false, startMouseX: 0, startMouseY: 0,
    startNodeX: 0, startNodeY: 0, startPanX: 0, startPanY: 0, mode: "pan",
  });
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─ Zoom ─ */
  const applyZoom = useCallback((delta: number, cx?: number, cy?: number) => {
    setZoom(prev => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * delta));
      if (cx !== undefined && cy !== undefined) {
        const canvasX = (cx - pan.x) / prev;
        const canvasY = (cy - pan.y) / prev;
        setPan({ x: cx - canvasX * next, y: cy - canvasY * next });
      }
      return next;
    });
  }, [pan]);

  /* ─ Wheel ─ */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? 1 / (1 + ZOOM_STEP) : 1 + ZOOM_STEP;
      applyZoom(delta, cx, cy);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [applyZoom]);

  /* ─ Canvas mousedown ─ */
  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setSelectedId(null);
    setDragState({
      active: true, mode: "pan",
      startMouseX: e.clientX, startMouseY: e.clientY,
      startPanX: pan.x, startPanY: pan.y,
      startNodeX: 0, startNodeY: 0,
    });
  }, [pan]);

  /* ─ Node mousedown ─ */
  const onNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedId(id);
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setDragState({
      active: true, mode: "node", nodeId: id,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startNodeX: node.x, startNodeY: node.y,
      startPanX: pan.x, startPanY: pan.y,
    });
  }, [nodes, pan]);

  /* ─ Mouse move ─ */
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.active) return;
    const dx = e.clientX - dragState.startMouseX;
    const dy = e.clientY - dragState.startMouseY;

    if (dragState.mode === "pan") {
      setPan({ x: dragState.startPanX + dx, y: dragState.startPanY + dy });
    } else if (dragState.mode === "node" && dragState.nodeId) {
      setNodes(prev => prev.map(n =>
        n.id === dragState.nodeId
          ? { ...n, x: dragState.startNodeX + dx / zoom, y: dragState.startNodeY + dy / zoom }
          : n
      ));
    }
  }, [dragState, zoom]);

  /* ─ Mouse up ─ */
  const onMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, active: false }));
  }, []);

  /* ─ File upload ─ */
  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;

    Array.from(files).forEach((file, i) => {
      const url = URL.createObjectURL(file);
      const type = detectType(file.type, file.name);
      const id = genId();
      const canvasX = (cx - pan.x) / zoom + (i % 4) * 170 - 255;
      const canvasY = (cy - pan.y) / zoom + Math.floor(i / 4) * 200 - 100;

      const node: CanvasNodeData = {
        id, type, url, mimeType: file.type,
        title: file.name.replace(/\.[^.]+$/, ""),
        content: "",
        x: Math.max(0, canvasX), y: Math.max(0, canvasY),
        colorKey: ["blue", "purple", "green", "amber", "rose", "slate"][i % 6],
        fileSize: file.size,
      };

      if (type === "document" && file.type.startsWith("text/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string ?? "";
          setNodes(prev => prev.map(n => n.id === id ? { ...n, content: `<pre style="white-space:pre-wrap">${text.replace(/</g, "&lt;")}</pre>` } : n));
        };
        reader.readAsText(file);
      }

      setNodes(prev => [...prev, node]);
    });

    toast.success(`Added ${files.length} file${files.length > 1 ? "s" : ""} to canvas`);
  }, [pan, zoom]);

  /* ─ Drag-drop file from OS ─ */
  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDropZoneActive(true); };
  const onDragLeave = () => setDropZoneActive(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropZoneActive(false);
    processFiles(e.dataTransfer.files);
  };

  /* ─ Add note ─ */
  const addNote = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;
    const node: CanvasNodeData = {
      id: genId(), type: "note", title: "New Note", content: "",
      x: (cx - pan.x) / zoom - 96, y: (cy - pan.y) / zoom - 80,
      colorKey: "amber",
    };
    setNodes(prev => [...prev, node]);
    setViewerId(node.id);
  };

  /* ─ Add text document ─ */
  const addDocument = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;
    const node: CanvasNodeData = {
      id: genId(), type: "text", title: "New Document", content: "",
      x: (cx - pan.x) / zoom - 88, y: (cy - pan.y) / zoom - 80,
      colorKey: "blue",
    };
    setNodes(prev => [...prev, node]);
    setViewerId(node.id);
  };

  /* ─ Delete node ─ */
  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (viewerId === id) setViewerId(null);
    toast.success("Node removed");
  };

  /* ─ Save from viewer ─ */
  const saveNodeContent = (id: string, content: string, title: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, content, title } : n));
  };

  /* ─ Color + Pin ─ */
  const changeColor = (id: string, colorKey: string) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, colorKey } : n));
  const togglePin = (id: string) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  /* ─ Fit all nodes ─ */
  const fitToScreen = () => {
    if (nodes.length === 0) { setPan({ x: 40, y: 40 }); setZoom(1); return; }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
    const minX = Math.min(...xs) - 40, minY = Math.min(...ys) - 40;
    const maxX = Math.max(...xs) + 200, maxY = Math.max(...ys) + 200;
    const scaleX = rect.width / (maxX - minX);
    const scaleY = rect.height / (maxY - minY);
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(scaleX, scaleY) * 0.9));
    setZoom(newZoom);
    setPan({ x: -minX * newZoom + (rect.width - (maxX - minX) * newZoom) / 2, y: -minY * newZoom + (rect.height - (maxY - minY) * newZoom) / 2 });
  };

  const viewerNode = viewerId ? nodes.find(n => n.id === viewerId) ?? null : null;

  return (
    <AppLayout fullBleed>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex-none h-12 border-b border-border bg-card flex items-center gap-1 px-3 z-20">
          {/* Left: title */}
          <div className="flex items-center gap-2 mr-3">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-semibold text-foreground">Research Canvas</span>
            <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{nodes.length} nodes</span>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Add Note */}
          <button onClick={addNote} title="Add Note"
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-[12px] text-foreground transition-colors">
            <StickyNote className="w-3.5 h-3.5 text-amber-500" /> Note
          </button>

          {/* Add Document */}
          <button onClick={addDocument} title="Add Document"
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-[12px] text-foreground transition-colors">
            <FileText className="w-3.5 h-3.5 text-blue-500" /> Document
          </button>

          {/* Upload File */}
          <button onClick={() => fileInputRef.current?.click()} title="Upload files"
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
          <input ref={fileInputRef} type="file" multiple accept="*/*" className="hidden"
            onChange={e => { processFiles(e.target.files); e.target.value = ""; }} />

          <div className="flex-1" />

          {/* Zoom controls */}
          <button onClick={() => applyZoom(1 / (1 + ZOOM_STEP))}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="text-[12px] text-foreground w-14 text-center h-7 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors tabular-nums"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => applyZoom(1 + ZOOM_STEP)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={fitToScreen} title="Fit all to screen"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Canvas Container ── */}
        <div
          ref={containerRef}
          className={cn(
            "relative flex-1 overflow-hidden bg-muted/30",
            "select-none",
            dragState.active && dragState.mode === "pan" ? "cursor-grabbing" : "cursor-grab",
            dropZoneActive && "ring-4 ring-primary ring-inset"
          )}
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {/* Dot grid background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.12) 1px, transparent 1px)`,
              backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
              backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
            }}
          />

          {/* Drop hint overlay */}
          <AnimatePresence>
            {dropZoneActive && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 bg-primary/5"
              >
                <div className="bg-card border-2 border-dashed border-primary rounded-2xl px-8 py-6 text-center shadow-lg">
                  <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Drop files to add to canvas</p>
                  <p className="text-xs text-muted-foreground mt-1">PDFs, images, text documents and more</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <Layers className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Your canvas is empty</p>
                <p className="text-xs text-muted-foreground mt-1">Upload files or add notes to get started</p>
              </div>
            </div>
          )}

          {/* Transform layer: all canvas nodes */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              position: "absolute",
              inset: 0,
              willChange: "transform",
            }}
          >
            {nodes.map(node => (
              <CanvasNodeCard
                key={node.id}
                node={node}
                selected={selectedId === node.id}
                zoom={zoom}
                onMouseDown={onNodeMouseDown}
                onClick={(id) => setViewerId(id)}
                onDelete={deleteNode}
                onColorChange={changeColor}
                onTogglePin={togglePin}
              />
            ))}
          </div>

          {/* Zoom indicator (bottom-left) */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none">
            <span className="text-[11px] text-muted-foreground/60 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-border/40">
              {Math.round(zoom * 100)}% · {nodes.length} nodes · Scroll to zoom · Drag to pan
            </span>
          </div>

          {/* Quick tip bottom-right */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            <span className="text-[11px] text-muted-foreground/50 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-border/40">
              Drop files anywhere to add
            </span>
          </div>
        </div>
      </div>

      {/* ── Document Viewer ── */}
      {viewerNode && (
        <DocumentViewer
          node={viewerNode}
          onClose={() => setViewerId(null)}
          onSave={saveNodeContent}
        />
      )}
    </AppLayout>
  );
}
