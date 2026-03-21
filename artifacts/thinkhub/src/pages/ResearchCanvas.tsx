import {
  useState, useRef, useEffect, useCallback, useMemo,
  type DragEvent,
} from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Upload, ZoomIn, ZoomOut, Maximize2, Trash2, FileText, ImageIcon, FileType,
  StickyNote, Type, Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Link2, RotateCcw, RotateCw, Download, X, Plus, Search, Layers,
  MoreHorizontal, Pin, PanelLeft, Lightbulb, HelpCircle, FlaskConical,
  BookOpen, ListChecks, GitBranch, AlignLeft, ChevronRight, ChevronDown,
  Network, Users, Columns2, BookMarked, MapPin, Calendar, Copy,
  CheckSquare, Square, Tag, ArrowRightLeft, Pencil, FileDown,
  Sparkles, LayoutTemplate, AlignJustify, Check, LayoutList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  NodeType, CanvasNodeData, Connection, Board, ConnType,
  NODE_COLORS, NODE_TYPE_META, CONN_TYPE_META, BOARD_TEMPLATES,
  loadBoards, saveBoards, genId, createNode, createBoard,
  ViewMode, VIEW_MODE_META, hasSeenOnboarding,
} from "@/data/canvasData";
import AIAssistPanel from "@/components/canvas/AIAssistPanel";
import OutlineView from "@/components/canvas/OutlineView";
import EvidenceMapView from "@/components/canvas/EvidenceMapView";
import OnboardingOverlay from "@/components/canvas/OnboardingOverlay";

/* ── Constants ───────────────────────────────────────────────── */
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.12;
const NODE_W = 192;
const NODE_H = 110;

/* ── Types ───────────────────────────────────────────────────── */
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

/* ── Helpers ─────────────────────────────────────────────────── */
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function detectFileType(mimeType: string, name: string): NodeType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("text/") || name.endsWith(".md") || name.endsWith(".txt")) return "document";
  return "document";
}

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

function viewModeIcon(mode: ViewMode, cls = "w-3.5 h-3.5") {
  switch (mode) {
    case "canvas":       return <LayoutTemplate className={cls} />;
    case "outline":      return <LayoutList className={cls} />;
    case "evidence-map": return <GitBranch className={cls} />;
  }
}

function connTypeStroke(ct: ConnType) {
  return CONN_TYPE_META[ct]?.stroke ?? "#94a3b8";
}
function connTypeDash(ct: ConnType) {
  return CONN_TYPE_META[ct]?.dash;
}

/* ── RichTextEditor ──────────────────────────────────────────── */
function RichTextEditor({ value, onChange, readOnly = false, placeholder = "Start writing…" }: {
  value: string; onChange: (html: string) => void; readOnly?: boolean; placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    if (ref.current) onChange(ref.current.innerHTML);
  };
  const Btn = ({ cmd, val, title, children }: { cmd: string; val?: string; title: string; children: React.ReactNode }) => (
    <button type="button" title={title} onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
      className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </button>
  );
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {!readOnly && (
        <div className="flex flex-wrap gap-0.5 px-2 py-1.5 border-b border-border bg-card">
          <Btn cmd="undo" title="Undo"><RotateCcw className="w-3 h-3" /></Btn>
          <Btn cmd="redo" title="Redo"><RotateCw className="w-3 h-3" /></Btn>
          <div className="w-px h-4 bg-border mx-1 self-center" />
          <Btn cmd="bold" title="Bold"><Bold className="w-3 h-3" /></Btn>
          <Btn cmd="italic" title="Italic"><Italic className="w-3 h-3" /></Btn>
          <Btn cmd="underline" title="Underline"><Underline className="w-3 h-3" /></Btn>
          <Btn cmd="strikeThrough" title="Strikethrough"><Strikethrough className="w-3 h-3" /></Btn>
          <div className="w-px h-4 bg-border mx-1 self-center" />
          <Btn cmd="formatBlock" val="h2" title="H1"><span className="text-[10px] font-bold">H1</span></Btn>
          <Btn cmd="formatBlock" val="h3" title="H2"><span className="text-[10px] font-bold">H2</span></Btn>
          <Btn cmd="formatBlock" val="p" title="Paragraph"><span className="text-[10px]">P</span></Btn>
          <div className="w-px h-4 bg-border mx-1 self-center" />
          <Btn cmd="insertUnorderedList" title="Bullet list"><List className="w-3 h-3" /></Btn>
          <Btn cmd="insertOrderedList" title="Numbered list"><ListOrdered className="w-3 h-3" /></Btn>
        </div>
      )}
      <div
        ref={ref}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        className={cn(
          "flex-1 p-4 outline-none overflow-y-auto text-sm text-foreground leading-relaxed",
          "prose prose-sm max-w-none dark:prose-invert",
          "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5",
          "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground/50 [&:empty]:before:pointer-events-none",
          !readOnly && "cursor-text"
        )}
      />
    </div>
  );
}

/* ── DocumentViewer ──────────────────────────────────────────── */
function DocumentViewer({ node, onClose, onSave, onTagsChange }: {
  node: CanvasNodeData;
  onClose: () => void;
  onSave: (id: string, content: string, title: string) => void;
  onTagsChange: (id: string, tags: string[]) => void;
}) {
  const [editTitle, setEditTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  const [saved, setSaved] = useState(true);
  const [imgZoom, setImgZoom] = useState(1);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(node.tags ?? []);
  const [authorInput, setAuthorInput] = useState(node.author ?? "");
  const [yearInput, setYearInput] = useState(node.year ? String(node.year) : "");
  const [doiInput, setDoiInput] = useState(node.doi ?? "");
  const [journalInput, setJournalInput] = useState(node.journal ?? "");

  const handleSave = useCallback(() => {
    onSave(node.id, content, editTitle);
    onTagsChange(node.id, tags);
    setSaved(true);
    toast.success("Saved");
  }, [node.id, content, editTitle, tags, onSave, onTagsChange]);

  useEffect(() => { setSaved(false); }, [content, editTitle, tags]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleSave]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags(p => [...p, t]); }
    setTagInput("");
  };
  const removeTag = (t: string) => setTags(p => p.filter(x => x !== t));

  const isImage = node.type === "image";
  const isPdf   = node.type === "pdf";
  const isText  = node.type === "note" || node.type === "document" || node.type === "text";
  const isCit   = node.type === "citation";
  const col     = NODE_COLORS[node.colorKey] ?? NODE_COLORS.slate;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="flex flex-col gap-0 p-0 overflow-hidden max-w-4xl h-[88vh]">
        <DialogHeader className="flex-none px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <span className={col.icon}>{nodeTypeIcon(node.type, "w-4 h-4")}</span>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
              placeholder="Untitled" />
            <div className="flex items-center gap-2 flex-none">
              {node.isAiGenerated && (
                <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
              {!saved && <span className="text-[11px] text-muted-foreground">Unsaved</span>}
              {(isText || isCit) && (
                <button onClick={handleSave}
                  className="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors">
                  Save
                </button>
              )}
              {node.url && (
                <a href={node.url} download={node.title}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 min-w-0 overflow-auto bg-background">
            {isImage && node.url && (
              <div className="flex flex-col items-center min-h-full p-4 gap-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setImgZoom(z => Math.max(0.2, z - 0.15))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors"><ZoomOut className="w-3.5 h-3.5" /></button>
                  <span className="text-[12px] text-muted-foreground w-12 text-center">{Math.round(imgZoom * 100)}%</span>
                  <button onClick={() => setImgZoom(z => Math.min(4, z + 0.15))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors"><ZoomIn className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setImgZoom(1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors"><Maximize2 className="w-3.5 h-3.5" /></button>
                </div>
                <img src={node.url} alt={node.title}
                  style={{ transform: `scale(${imgZoom})`, transformOrigin: "top center", transition: "transform 0.2s" }}
                  className="max-w-full rounded-lg shadow-md" draggable={false} />
              </div>
            )}
            {isPdf && node.url && (
              <iframe src={node.url} title={node.title} className="w-full h-full border-none" style={{ minHeight: "75vh" }} />
            )}
            {isCit && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Author(s)</label>
                    <input value={authorInput} onChange={e => setAuthorInput(e.target.value)}
                      className="mt-1 w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary/50 transition-colors"
                      placeholder="Author et al." />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Year</label>
                    <input value={yearInput} onChange={e => setYearInput(e.target.value)} type="number"
                      className="mt-1 w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary/50 transition-colors"
                      placeholder="2024" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Journal / Venue</label>
                    <input value={journalInput} onChange={e => setJournalInput(e.target.value)}
                      className="mt-1 w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary/50 transition-colors"
                      placeholder="NeurIPS 2024" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">DOI</label>
                    <input value={doiInput} onChange={e => setDoiInput(e.target.value)}
                      className="mt-1 w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary/50 transition-colors"
                      placeholder="10.xxxx/..." />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Notes / Abstract</label>
                  <div className="mt-1 border border-border rounded-xl overflow-hidden" style={{ minHeight: 240 }}>
                    <RichTextEditor value={content} onChange={c => { setContent(c); setSaved(false); }}
                      placeholder="Add your notes, abstract, or key excerpts…" />
                  </div>
                </div>
                <button onClick={() => {
                  onSave(node.id, content, editTitle);
                  onTagsChange(node.id, tags);
                  toast.success("Citation saved");
                  setSaved(true);
                }} className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors">
                  Save Citation
                </button>
              </div>
            )}
            {isText && (
              <RichTextEditor value={content} onChange={c => { setContent(c); setSaved(false); }}
                placeholder="Start writing your research notes…" />
            )}
            {!isImage && !isPdf && !isText && !isCit && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <FileText className="w-12 h-12 opacity-20" />
                <p className="text-sm">Preview not available for this file type.</p>
                {node.url && (
                  <a href={node.url} download={node.title} className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="w-[220px] flex-none border-l border-border bg-card/50 overflow-y-auto p-4 space-y-5">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Type</p>
              <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold", col.tag, "bg-secondary")}>
                {nodeTypeIcon(node.type)}
                {NODE_TYPE_META[node.type].label}
              </div>
            </div>
            {node.isAiGenerated && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">AI Provenance</p>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span className="text-[11px] text-purple-400">AI-generated</span>
                </div>
                {node.aiRationale && <p className="text-[10px] text-muted-foreground leading-relaxed">{node.aiRationale}</p>}
                {node.aiConfidence != null && (
                  <p className="text-[10px] text-muted-foreground mt-1">Confidence: {Math.round(node.aiConfidence * 100)}%</p>
                )}
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tags</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary text-[10px] text-foreground">
                    {t}
                    <button onClick={() => removeTag(t)} className="ml-0.5 text-muted-foreground hover:text-foreground"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag…"
                  className="flex-1 min-w-0 bg-secondary rounded-lg px-2 py-1 text-[11px] text-foreground outline-none border border-border focus:border-primary/50 transition-colors" />
                <button onClick={addTag} className="w-6 h-6 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            {node.fileSize && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">File</p>
                <p className="text-[11px] text-foreground">{fmtSize(node.fileSize)}</p>
                {node.mimeType && <p className="text-[10px] text-muted-foreground">{node.mimeType}</p>}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── CanvasNodeCard ───────────────────────────────────────────── */
function CanvasNodeCard({ node, selected, isConnecting, connectingFromId, onMouseDown, onClick, onOpen, onDelete, onColorChange, onTogglePin, onStartConnect, onTagRemove, onInlineEdit, dimmed, isAiSelected }: {
  node: CanvasNodeData;
  selected: boolean;
  isConnecting: boolean;
  connectingFromId: string | null;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onClick: (id: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, colorKey: string) => void;
  onTogglePin: (id: string) => void;
  onStartConnect: (id: string) => void;
  onTagRemove: (id: string, tag: string) => void;
  onInlineEdit: (id: string, content: string) => void;
  dimmed?: boolean;
  isAiSelected?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [editingInline, setEditingInline] = useState(false);
  const inlineRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const col = NODE_COLORS[node.colorKey] ?? NODE_COLORS.slate;
  const isSection = node.type === "section";
  const isSource = connectingFromId === node.id;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false); setShowColors(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (editingInline && inlineRef.current) {
      inlineRef.current.focus();
      inlineRef.current.select();
    }
  }, [editingInline]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting && !isSource) {
      onClick(node.id);
    } else if (!isConnecting) {
      onClick(node.id);
    }
  };

  /* ─ Section Node ─ */
  if (isSection) {
    return (
      <div
        className={cn(
          "absolute group select-none cursor-grab active:cursor-grabbing",
          "w-80",
          dimmed && "opacity-30 pointer-events-none"
        )}
        style={{ left: node.x, top: node.y, zIndex: selected ? 8 : 2 }}
        onMouseDown={e => { e.stopPropagation(); onMouseDown(e, node.id); }}
        onClick={handleClick}
      >
        <div className={cn("flex items-center gap-3", selected && "opacity-100")}>
          <span className={cn("text-[11px] font-bold uppercase tracking-widest whitespace-nowrap", col.tag)}>
            {node.title}
          </span>
          <div className={cn("flex-1 h-px opacity-30 bg-current", col.tag)} />
          <div ref={menuRef} className="relative opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            <button onClick={e => { e.stopPropagation(); setShowMenu(p => !p); }}
              className="w-4 h-4 flex items-center justify-center rounded text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-3 h-3" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1 z-50 min-w-[120px]" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setEditingInline(true); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left">
                  <Pencil className="w-3 h-3 text-muted-foreground" /> Rename
                </button>
                <div className="my-0.5 border-t border-border/60" />
                <button onClick={() => { onDelete(node.id); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-destructive hover:bg-destructive/10 w-full text-left">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        {editingInline && (
          <input
            defaultValue={node.title}
            onBlur={e => { onInlineEdit(node.id, e.target.value); setEditingInline(false); }}
            onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { e.currentTarget.blur(); } }}
            autoFocus
            className="mt-1 w-full bg-secondary rounded px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-foreground outline-none border border-primary/50"
            onClick={e => e.stopPropagation()}
          />
        )}
      </div>
    );
  }

  /* ─ Standard Node Card ─ */
  const isCit = node.type === "citation";
  const isNote = node.type === "note";
  const isTask = node.type === "task";
  const isQuestion = node.type === "question";
  const canInlineEdit = node.type === "note" || node.type === "task";

  /* Per-type border style */
  const typeBorderStyle = isQuestion ? "border-dashed" : "border-solid";

  return (
    <div
      className={cn(
        "absolute group select-none rounded-xl border-2 shadow-sm transition-all overflow-hidden",
        "cursor-grab active:cursor-grabbing",
        typeBorderStyle,
        node.type === "citation" ? "w-56" : "w-48",
        col.bg, col.border,
        selected && "ring-2 ring-primary/70 ring-offset-2 shadow-md",
        !selected && "hover:shadow-md",
        isConnecting && !isSource && "ring-2 ring-emerald-400/50 cursor-crosshair hover:ring-emerald-400",
        isSource && "ring-2 ring-emerald-500 shadow-emerald-500/20 shadow-lg",
        isAiSelected && !selected && "ring-2 ring-purple-400/50",
        dimmed && "opacity-30 pointer-events-none"
      )}
      style={{ left: node.x, top: node.y, zIndex: selected ? 10 : (node.pinned ? 5 : 3) }}
      onMouseDown={e => { e.stopPropagation(); if (!editingInline) onMouseDown(e, node.id); }}
      onClick={handleClick}
      onDoubleClick={e => { e.stopPropagation(); if (canInlineEdit) { setEditingInline(true); } else { onOpen(node.id); } }}
    >
      {/* Colored header strip — visual taxonomy */}
      <div className={cn("flex items-center justify-between px-2.5 pt-2 pb-1.5", col.headerBg ?? "")}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={col.icon}>{nodeTypeIcon(node.type)}</span>
          <span className={cn("text-[10px] font-bold uppercase tracking-wide truncate", col.tag)}>
            {NODE_TYPE_META[node.type].shortLabel}
          </span>
          {node.pinned && <Pin className="w-2.5 h-2.5 text-muted-foreground shrink-0" />}
          {isCit && node.year && <span className="text-[10px] text-muted-foreground shrink-0">{node.year}</span>}
          {isTask && (
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
              node.status === "done" ? "bg-emerald-400/15 text-emerald-400" : "bg-secondary/80 text-muted-foreground")}>
              {node.status === "done" ? "done" : "open"}
            </span>
          )}
          {node.isAiGenerated && (
            <span title={`AI-generated${node.aiConfidence != null ? ` (${Math.round(node.aiConfidence * 100)}% confidence)` : ""}`}>
              <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0" />
            </span>
          )}
        </div>
        <div ref={menuRef} className="relative flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isConnecting && (
            <button onClick={e => { e.stopPropagation(); onStartConnect(node.id); }}
              title="Connect to another node"
              className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-emerald-400 transition-colors">
              <ArrowRightLeft className="w-3 h-3" />
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); setShowMenu(p => !p); setShowColors(false); }}
            className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1 z-50 min-w-[140px]" onClick={e => e.stopPropagation()}>
              <button onClick={() => { onOpen(node.id); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" /> Open
              </button>
              <button onClick={() => { onTogglePin(node.id); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left">
                <Pin className="w-3.5 h-3.5 text-muted-foreground" /> {node.pinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={() => { setShowColors(true); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Color
              </button>
              <button onClick={() => { onStartConnect(node.id); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left">
                <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" /> Connect
              </button>
              <div className="my-0.5 border-t border-border/60" />
              <button onClick={() => { onDelete(node.id); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-destructive hover:bg-destructive/10 w-full text-left">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
          {showColors && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg p-2 z-50 flex flex-wrap gap-1.5 w-[116px]" onClick={e => e.stopPropagation()}>
              {Object.entries(NODE_COLORS).map(([k, c]) => (
                <button key={k} title={c.label} onClick={() => { onColorChange(node.id, k); setShowColors(false); }}
                  className={cn("w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    node.colorKey === k ? "border-foreground" : "border-transparent"
                  )}
                  style={{ background: c.stroke }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-2.5 pb-2.5 bg-card">
        {node.type === "image" && node.url && (
          <div className="rounded-lg overflow-hidden mb-1.5 h-20 bg-secondary">
            <img src={node.url} alt={node.title} className="w-full h-full object-cover" draggable={false} />
          </div>
        )}
        {(node.type === "pdf" || node.type === "document") && (
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-secondary mb-1.5">
            <span className={cn("shrink-0", col.icon)}>{nodeTypeIcon(node.type, "w-5 h-5")}</span>
            <div className="min-w-0">
              {node.mimeType && <p className="text-[10px] text-muted-foreground truncate">{node.mimeType}</p>}
              {node.fileSize && <p className="text-[10px] text-muted-foreground/60">{fmtSize(node.fileSize)}</p>}
            </div>
          </div>
        )}

        {isCit && node.author && (
          <p className="text-[10px] text-muted-foreground italic mb-0.5">{node.author}</p>
        )}
        {isCit && node.journal && (
          <p className="text-[10px] text-muted-foreground mb-0.5">{node.journal}</p>
        )}

        <p className={cn("text-[12px] font-semibold text-foreground leading-snug",
          node.type === "note" ? "line-clamp-3" : "line-clamp-2"
        )}>
          {node.title || "Untitled"}
        </p>

        {(isNote || node.type === "insight" || node.type === "question" || node.type === "hypothesis" || node.type === "evidence") && node.content && (
          editingInline ? (
            <textarea
              ref={inlineRef}
              defaultValue={node.content.replace(/<[^>]+>/g, "")}
              onBlur={e => { onInlineEdit(node.id, e.target.value); setEditingInline(false); }}
              onKeyDown={e => { if (e.key === "Escape") e.currentTarget.blur(); }}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              className="mt-1 w-full bg-secondary rounded-lg px-2 py-1.5 text-[11px] text-foreground outline-none border border-primary/50 resize-none leading-relaxed"
              rows={3}
            />
          ) : (
            <p className="mt-1 text-[11px] text-foreground/70 leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {node.content.replace(/<[^>]+>/g, "").slice(0, 120) || ""}
            </p>
          )
        )}

        {isTask && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {node.status === "done"
              ? <CheckSquare className="w-3 h-3 text-emerald-400" />
              : <Square className="w-3 h-3 text-muted-foreground" />}
            <p className="text-[10px] text-muted-foreground">{node.status === "done" ? "Completed" : "Open"}</p>
          </div>
        )}

        {/* AI rationale hint */}
        {node.isAiGenerated && node.aiRationale && (
          <p className="mt-1 text-[9px] text-purple-400/60 italic line-clamp-1">{node.aiRationale}</p>
        )}

        {node.tags && node.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {node.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/80 text-muted-foreground">{t}</span>
            ))}
            {node.tags.length > 3 && <span className="text-[9px] text-muted-foreground">+{node.tags.length - 3}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ConnectionsLayer (SVG) ──────────────────────────────────── */
function ConnectionsLayer({ connections, nodes, onRemove }: {
  connections: Connection[];
  nodes: CanvasNodeData[];
  onRemove: (id: string) => void;
}) {
  const nodeMap = useMemo(() => {
    const m: Record<string, CanvasNodeData> = {};
    nodes.forEach(n => { m[n.id] = n; });
    return m;
  }, [nodes]);

  return (
    <svg style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <marker id="rc-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#6b7280" opacity="0.7" />
        </marker>
        <marker id="rc-arr-sup" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#34d399" opacity="0.8" />
        </marker>
        <marker id="rc-arr-con" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#f87171" opacity="0.8" />
        </marker>
        <marker id="rc-arr-ai" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#c084fc" opacity="0.8" />
        </marker>
      </defs>
      {connections.map(conn => {
        const from = nodeMap[conn.fromId];
        const to   = nodeMap[conn.toId];
        if (!from || !to) return null;
        const ax = from.x + NODE_W / 2;
        const ay = from.y + NODE_H / 2;
        const bx = to.x + NODE_W / 2;
        const by = to.y + NODE_H / 2;
        const cx1 = ax + (bx - ax) * 0.4;
        const cy1 = ay;
        const cx2 = ax + (bx - ax) * 0.6;
        const cy2 = by;
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2 - 10;
        const d = `M ${ax} ${ay} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${bx} ${by}`;
        const stroke = connTypeStroke(conn.connType);
        const dash   = connTypeDash(conn.connType);
        const marker = conn.isAiGenerated ? "url(#rc-arr-ai)" :
          conn.connType === "supports" ? "url(#rc-arr-sup)" :
          conn.connType === "contradicts" ? "url(#rc-arr-con)" : "url(#rc-arr)";
        const connStroke = conn.isAiGenerated ? "#c084fc80" : stroke;
        return (
          <g key={conn.id}>
            <path d={d} stroke={connStroke} strokeWidth={conn.isAiGenerated ? "1" : "1.5"} fill="none"
              strokeDasharray={conn.isAiGenerated ? "4,3" : dash}
              markerEnd={marker} opacity={conn.isAiGenerated ? "0.55" : "0.65"} />
            {conn.label && conn.label !== "→" && (
              <text x={mx} y={my} textAnchor="middle" fontSize="9" fill={connStroke} opacity="0.85"
                style={{ fontFamily: "inherit", fontWeight: 500 }}>
                {CONN_TYPE_META[conn.connType]?.label ?? conn.label}
              </text>
            )}
            {conn.isAiGenerated && (
              <text x={mx + 4} y={my - 9} textAnchor="middle" fontSize="8" fill="#c084fc" opacity="0.7">✦</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Board List Panel ─────────────────────────────────────────── */
function BoardListPanel({ boards, activeBoardId, onSelect, onNew, onRename, onDuplicate, onDelete, onClose }: {
  boards: Board[];
  activeBoardId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  return (
    <div className="w-60 flex-none flex flex-col border-r border-border bg-card h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-semibold text-foreground">Research Boards</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onNew} title="New board"
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {boards.map(board => (
            <div key={board.id} className="relative group">
              {renaming === board.id ? (
                <input
                  autoFocus
                  value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  onBlur={() => { onRename(board.id, renameVal || board.name); setRenaming(null); }}
                  onKeyDown={e => {
                    if (e.key === "Enter") { onRename(board.id, renameVal || board.name); setRenaming(null); }
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg bg-secondary text-[12px] text-foreground outline-none border border-primary/50"
                />
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(board.id)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onSelect(board.id); }}
                  className={cn(
                    "w-full text-left px-2.5 py-2.5 rounded-lg transition-colors cursor-pointer",
                    board.id === activeBoardId ? "bg-accent/10 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[12px] font-medium truncate", board.id === activeBoardId && "text-accent")}>{board.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {board.nodes.length}n · {board.connections.length}c · {new Date(board.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setMenuId(menuId === board.id ? null : board.id); }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-all"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {menuId === board.id && (
                <div className="absolute right-1 top-full mt-0.5 bg-card border border-border rounded-xl shadow-lg py-1 z-50 min-w-[140px]"
                  onMouseLeave={() => setMenuId(null)}>
                  <button onClick={() => { setRenameVal(board.name); setRenaming(board.id); setMenuId(null); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left">
                    <Pencil className="w-3 h-3 text-muted-foreground" /> Rename
                  </button>
                  <button onClick={() => { onDuplicate(board.id); setMenuId(null); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left">
                    <Copy className="w-3 h-3 text-muted-foreground" /> Duplicate
                  </button>
                  {boards.length > 1 && (
                    <>
                      <div className="my-0.5 border-t border-border/60" />
                      <button onClick={() => { onDelete(board.id); setMenuId(null); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-destructive hover:bg-destructive/10 w-full text-left">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/* ── Properties Panel ─────────────────────────────────────────── */
function PropertiesPanel({ node, connections, allNodes, onClose, onUpdate, onTagsChange, onStatusChange, onDeleteConnection, onOpen }: {
  node: CanvasNodeData;
  connections: Connection[];
  allNodes: CanvasNodeData[];
  onClose: () => void;
  onUpdate: (id: string, fields: Partial<CanvasNodeData>) => void;
  onTagsChange: (id: string, tags: string[]) => void;
  onStatusChange: (id: string, status: CanvasNodeData["status"]) => void;
  onDeleteConnection: (connId: string) => void;
  onOpen: (id: string) => void;
}) {
  const [tagInput, setTagInput] = useState("");
  const tags = node.tags ?? [];
  const col = NODE_COLORS[node.colorKey] ?? NODE_COLORS.slate;

  const nodeConns = connections.filter(c => c.fromId === node.id || c.toId === node.id);
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) onTagsChange(node.id, [...tags, t]);
    setTagInput("");
  };

  return (
    <div className="w-64 flex-none flex flex-col border-l border-border bg-card h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className={col.icon}>{nodeTypeIcon(node.type, "w-3.5 h-3.5")}</span>
          <span className="text-[12px] font-semibold text-foreground truncate">{NODE_TYPE_META[node.type].label}</span>
          {node.isAiGenerated && <Sparkles className="w-3 h-3 text-purple-400 shrink-0" title="AI-generated" />}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onOpen(node.id)} title="Open in full view"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* AI Provenance */}
          {node.isAiGenerated && (
            <div className="rounded-xl bg-purple-400/8 border border-purple-400/20 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">AI-Generated</span>
                {node.aiConfidence != null && (
                  <span className="text-[10px] text-purple-300 ml-auto">{Math.round(node.aiConfidence * 100)}% confidence</span>
                )}
              </div>
              {node.aiRationale && (
                <p className="text-[10px] text-muted-foreground leading-relaxed">{node.aiRationale}</p>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Title</label>
            <input
              value={node.title}
              onChange={e => onUpdate(node.id, { title: e.target.value })}
              className="mt-1 w-full bg-secondary rounded-lg px-2.5 py-1.5 text-[12px] text-foreground outline-none border border-border focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Status */}
          {(node.type === "task" || node.type === "question" || node.type === "hypothesis") && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {(["open", "pending", "resolved", "done"] as CanvasNodeData["status"][]).map(s => (
                  <button key={s!} onClick={() => onStatusChange(node.id, s)}
                    className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors",
                      node.status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Citation fields */}
          {node.type === "citation" && (
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Citation Info</label>
              <input placeholder="Author(s)" value={node.author ?? ""}
                onChange={e => onUpdate(node.id, { author: e.target.value })}
                className="w-full bg-secondary rounded-lg px-2.5 py-1.5 text-[11px] text-foreground outline-none border border-border focus:border-primary/50 transition-colors" />
              <div className="flex gap-1">
                <input placeholder="Year" type="number" value={node.year ?? ""}
                  onChange={e => onUpdate(node.id, { year: Number(e.target.value) || undefined })}
                  className="w-20 bg-secondary rounded-lg px-2 py-1.5 text-[11px] text-foreground outline-none border border-border focus:border-primary/50 transition-colors" />
                <input placeholder="Venue" value={node.journal ?? ""}
                  onChange={e => onUpdate(node.id, { journal: e.target.value })}
                  className="flex-1 bg-secondary rounded-lg px-2 py-1.5 text-[11px] text-foreground outline-none border border-border focus:border-primary/50 transition-colors" />
              </div>
              <input placeholder="DOI" value={node.doi ?? ""}
                onChange={e => onUpdate(node.id, { doi: e.target.value })}
                className="w-full bg-secondary rounded-lg px-2.5 py-1.5 text-[11px] text-foreground outline-none border border-border focus:border-primary/50 transition-colors" />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Tags</label>
            <div className="mt-1 flex flex-wrap gap-1 mb-1.5">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary text-[10px] text-foreground">
                  <Tag className="w-2.5 h-2.5 text-muted-foreground" />{t}
                  <button onClick={() => onTagsChange(node.id, tags.filter(x => x !== t))}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add tag…"
                className="flex-1 min-w-0 bg-secondary rounded-lg px-2 py-1 text-[11px] text-foreground outline-none border border-border focus:border-primary/50 transition-colors" />
              <button onClick={addTag} className="w-6 h-6 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Connections */}
          {nodeConns.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Connections ({nodeConns.length})</label>
              <div className="mt-1 space-y-1">
                {nodeConns.map(c => {
                  const isFrom = c.fromId === node.id;
                  const otherId = isFrom ? c.toId : c.fromId;
                  const other = allNodes.find(n => n.id === otherId);
                  const meta = CONN_TYPE_META[c.connType];
                  return (
                    <div key={c.id} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-secondary group/conn">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta?.stroke ?? "#94a3b8" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground">{isFrom ? `→ ${meta?.label}` : `← ${meta?.label}`}</p>
                        <p className="text-[11px] text-foreground truncate">{other?.title ?? "Unknown"}</p>
                      </div>
                      {c.isAiGenerated && <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0" title="AI-suggested" />}
                      <button onClick={() => onDeleteConnection(c.id)}
                        className="opacity-0 group-hover/conn:opacity-100 w-4 h-4 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="pt-1 border-t border-border/60">
            <p className="text-[10px] text-muted-foreground">Created {new Date(node.createdAt).toLocaleDateString()}</p>
            <p className="text-[10px] text-muted-foreground">Updated {new Date(node.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

/* ── Template Picker Dialog ───────────────────────────────────── */
function templateIcon(id: string) {
  switch (id) {
    case "lit-review":          return <BookOpen className="w-5 h-5" />;
    case "concept-map":         return <Network className="w-5 h-5" />;
    case "mentor-prep":         return <Users className="w-5 h-5" />;
    case "paper-comparison":    return <Columns2 className="w-5 h-5" />;
    case "hypothesis-explorer": return <FlaskConical className="w-5 h-5" />;
    case "reading-pipeline":    return <BookMarked className="w-5 h-5" />;
    case "argument-map":        return <GitBranch className="w-5 h-5" />;
    case "thesis-plan":         return <Calendar className="w-5 h-5" />;
    default:                    return <Layers className="w-5 h-5" />;
  }
}

const CATEGORY_LABELS = { research: "Research", planning: "Planning", analysis: "Analysis", preparation: "Preparation" };

/* ── Add Node Type Menu ───────────────────────────────────────── */
const ADD_NODE_TYPES: { type: NodeType; label: string; color: string; description: string }[] = [
  { type: "note",       label: "Note",       color: "text-amber-400",   description: "Free-form sticky note" },
  { type: "insight",    label: "Insight",    color: "text-emerald-400", description: "Key finding or insight" },
  { type: "question",   label: "Question",   color: "text-purple-400",  description: "Open research question" },
  { type: "hypothesis", label: "Hypothesis", color: "text-blue-400",    description: "Hypothesis to explore" },
  { type: "citation",   label: "Citation",   color: "text-slate-400",   description: "Paper or reference" },
  { type: "evidence",   label: "Evidence",   color: "text-teal-400",    description: "Supporting evidence" },
  { type: "task",       label: "Task",       color: "text-rose-400",    description: "Action item" },
  { type: "document",   label: "Document",   color: "text-blue-400",    description: "Text document" },
  { type: "section",    label: "Section",    color: "text-slate-400",   description: "Zone label / frame" },
];

/* ── ResearchCanvas (Main) ────────────────────────────────────── */
export default function ResearchCanvas() {
  /* ── Board state (persisted) ─ */
  const [boards, setBoards] = useState<Board[]>(() => {
    const loaded = loadBoards();
    if (loaded.length === 0) return [createBoard("My First Canvas")];
    return loaded;
  });
  const [activeBoardId, setActiveBoardId] = useState<string>(() => boards[0].id);

  /* ── View & layout state ─ */
  const [viewMode, setViewMode]         = useState<ViewMode>("canvas");
  const [showBoardList, setShowBoardList] = useState(true);
  const [showAIPanel, setShowAIPanel]   = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());

  /* ── Canvas view state ─ */
  const [zoom, setZoom]   = useState(1);
  const [pan,  setPan]    = useState({ x: 80, y: 60 });
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [aiSelectedIds, setAiSelectedIds] = useState<string[]>([]);
  const [viewerId,      setViewerId]      = useState<string | null>(null);
  const [dragState,     setDragState]     = useState<DragState>({
    active: false, startMouseX: 0, startMouseY: 0,
    startNodeX: 0, startNodeY: 0, startPanX: 0, startPanY: 0, mode: "pan",
  });
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [pendingConn, setPendingConn] = useState<{ fromId: string; toId: string } | null>(null);

  /* ── UI state ─ */
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<NodeType | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef   = useRef<HTMLDivElement>(null);
  const viewMenuRef  = useRef<HTMLDivElement>(null);

  /* ── Derived ─ */
  const activeBoard = useMemo(
    () => boards.find(b => b.id === activeBoardId) ?? boards[0],
    [boards, activeBoardId]
  );
  const nodes      = activeBoard?.nodes ?? [];
  const connections = activeBoard?.connections ?? [];

  const filteredNodeIds = useMemo(() => {
    if (!searchQuery && !filterType) return null;
    return new Set(
      nodes.filter(node => {
        const mt = !filterType || node.type === filterType;
        const ms = !searchQuery ||
          node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node.author ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return mt && ms;
      }).map(n => n.id)
    );
  }, [nodes, searchQuery, filterType]);

  /* ── Persistence autosave ─ */
  useEffect(() => {
    const t = setTimeout(() => saveBoards(boards), 600);
    return () => clearTimeout(t);
  }, [boards]);

  /* ── Board mutations ─ */
  const mutateBoard = useCallback((updater: (b: Board) => Partial<Board>) => {
    setBoards(prev => prev.map(b =>
      b.id === activeBoardId
        ? { ...b, ...updater(b), updatedAt: new Date().toISOString() }
        : b
    ));
  }, [activeBoardId]);

  const setNodes = useCallback((updater: (nodes: CanvasNodeData[]) => CanvasNodeData[]) => {
    mutateBoard(b => ({ nodes: updater(b.nodes) }));
  }, [mutateBoard]);

  const setConns = useCallback((updater: (c: Connection[]) => Connection[]) => {
    mutateBoard(b => ({ connections: updater(b.connections) }));
  }, [mutateBoard]);

  /* ── Zoom / Wheel ─ */
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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const delta = e.deltaY > 0 ? 1 / (1 + ZOOM_STEP) : 1 + ZOOM_STEP;
      applyZoom(delta, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, [applyZoom]);

  /* ── Escape key ─ */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConnectingFromId(null);
        setPendingConn(null);
        setShowAddMenu(false);
        setShowSearch(false);
        setShowTemplateDialog(false);
        setShowViewMenu(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* ── Close menus on outside click ─ */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setShowAddMenu(false);
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) setShowViewMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Canvas mouse handlers ─ */
  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setSelectedId(null);
    if (connectingFromId) { setConnectingFromId(null); return; }
    setDragState({ active: true, mode: "pan", startMouseX: e.clientX, startMouseY: e.clientY, startPanX: pan.x, startPanY: pan.y, startNodeX: 0, startNodeY: 0 });
  }, [pan, connectingFromId]);

  const onNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (connectingFromId) return;
    setSelectedId(id);
    // AI multi-select: toggle with Ctrl/Meta
    if (showAIPanel) {
      if (e.ctrlKey || e.metaKey) {
        setAiSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      } else if (!aiSelectedIds.includes(id)) {
        setAiSelectedIds([id]);
      }
    }
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setDragState({ active: true, mode: "node", nodeId: id, startMouseX: e.clientX, startMouseY: e.clientY, startNodeX: node.x, startNodeY: node.y, startPanX: pan.x, startPanY: pan.y });
  }, [nodes, pan, connectingFromId, showAIPanel, aiSelectedIds]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.active) return;
    const dx = e.clientX - dragState.startMouseX;
    const dy = e.clientY - dragState.startMouseY;
    if (dragState.mode === "pan") {
      setPan({ x: dragState.startPanX + dx, y: dragState.startPanY + dy });
    } else if (dragState.mode === "node" && dragState.nodeId) {
      const now = new Date().toISOString();
      setNodes(prev => prev.map(n =>
        n.id === dragState.nodeId
          ? { ...n, x: dragState.startNodeX + dx / zoom, y: dragState.startNodeY + dy / zoom, updatedAt: now }
          : n
      ));
    }
  }, [dragState, zoom, setNodes]);

  const onMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, active: false }));
  }, []);

  /* ── Node click (handles connect mode) ─ */
  const onNodeClick = useCallback((id: string) => {
    if (connectingFromId) {
      if (id === connectingFromId) { setConnectingFromId(null); return; }
      const exists = connections.some(c =>
        (c.fromId === connectingFromId && c.toId === id) ||
        (c.fromId === id && c.toId === connectingFromId)
      );
      if (!exists) setPendingConn({ fromId: connectingFromId, toId: id });
      setConnectingFromId(null);
    } else {
      setSelectedId(id);
    }
  }, [connectingFromId, connections]);

  /* ── Add node ─ */
  const addNode = useCallback((type: NodeType) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;
    const x = (cx - pan.x) / zoom - NODE_W / 2;
    const y = (cy - pan.y) / zoom - NODE_H / 2;
    const node = createNode(type, x, y);
    setNodes(prev => [...prev, node]);
    setSelectedId(node.id);
    setShowAddMenu(false);
    if (type !== "section" && type !== "citation") setViewerId(node.id);
    toast.success(`${NODE_TYPE_META[type].label} added`);
  }, [pan, zoom, setNodes]);

  /* ── File upload ─ */
  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;

    Array.from(files).forEach((file, i) => {
      const url = URL.createObjectURL(file);
      const type = detectFileType(file.type, file.name);
      const x = (cx - pan.x) / zoom + (i % 4) * 220 - 330;
      const y = (cy - pan.y) / zoom + Math.floor(i / 4) * 180 - 90;
      const node = createNode(type, Math.max(0, x), Math.max(0, y), {
        url, mimeType: file.type, fileSize: file.size,
        title: file.name.replace(/\.[^.]+$/, ""),
        colorKey: ["blue", "purple", "green", "amber", "rose", "slate"][i % 6],
      });
      if (type === "document" && file.type.startsWith("text/")) {
        const reader = new FileReader();
        reader.onload = ev => {
          const text = ev.target?.result as string ?? "";
          setNodes(prev => prev.map(n =>
            n.id === node.id ? { ...n, content: `<pre style="white-space:pre-wrap">${text.replace(/</g, "&lt;")}</pre>` } : n
          ));
        };
        reader.readAsText(file);
      }
      setNodes(prev => [...prev, node]);
    });
    toast.success(`Added ${files.length} file${files.length > 1 ? "s" : ""} to canvas`);
  }, [pan, zoom, setNodes]);

  const onDragOver  = (e: DragEvent) => { e.preventDefault(); setDropZoneActive(true); };
  const onDragLeave = () => setDropZoneActive(false);
  const onDrop      = (e: DragEvent) => { e.preventDefault(); setDropZoneActive(false); processFiles(e.dataTransfer.files); };

  /* ── Node operations ─ */
  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConns(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
    if (selectedId === id) setSelectedId(null);
    if (viewerId === id) setViewerId(null);
    setAiSelectedIds(prev => prev.filter(x => x !== id));
    toast.success("Removed");
  };
  const saveNodeContent = (id: string, content: string, title: string) => {
    const now = new Date().toISOString();
    setNodes(prev => prev.map(n => n.id === id ? { ...n, content, title, updatedAt: now } : n));
  };
  const updateNodeTags = (id: string, tags: string[]) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, tags } : n));
  };
  const updateNode = (id: string, fields: Partial<CanvasNodeData>) => {
    const now = new Date().toISOString();
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...fields, updatedAt: now } : n));
  };
  const changeColor  = (id: string, colorKey: string) => updateNode(id, { colorKey });
  const togglePin    = (id: string) => setNodes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const updateStatus = (id: string, status: CanvasNodeData["status"]) => updateNode(id, { status });
  const inlineEdit   = (id: string, content: string) => {
    const now = new Date().toISOString();
    setNodes(prev => prev.map(n => n.id === id ? { ...n, title: content, updatedAt: now } : n));
  };

  /* ── Connections ─ */
  const deleteConn = (connId: string) => setConns(prev => prev.filter(c => c.id !== connId));

  const createConn = (fromId: string, toId: string, connType: ConnType) => {
    const conn: Connection = { id: genId("c"), fromId, toId, label: CONN_TYPE_META[connType].label, connType };
    setConns(prev => [...prev, conn]);
  };

  /* ── AI Panel handlers ─ */
  const onAcceptAINodes = useCallback((newNodes: CanvasNodeData[]) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;
    const baseX = (cx - pan.x) / zoom;
    const baseY = (cy - pan.y) / zoom;

    const positioned = newNodes.map((n, i) => ({
      ...n,
      x: baseX - 96 + (i % 4) * 220,
      y: baseY - 55 + Math.floor(i / 4) * 150,
    }));
    setNodes(prev => [...prev, ...positioned]);
  }, [pan, zoom, setNodes]);

  const onAcceptAIConnections = useCallback((suggestions: Array<{
    fromId: string; toId: string; connType: ConnType; label: string; aiRationale?: string;
  }>) => {
    const newConns: Connection[] = suggestions.map(s => ({
      id: genId("c"),
      fromId: s.fromId,
      toId: s.toId,
      label: s.label,
      connType: s.connType,
      isAiGenerated: true,
      aiRationale: s.aiRationale,
    }));
    setConns(prev => [...prev, ...newConns]);
  }, [setConns]);

  const onAddSynthesisNode = useCallback((node: CanvasNodeData) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;
    const positioned = { ...node, x: (cx - pan.x) / zoom - 96, y: (cy - pan.y) / zoom - 55 };
    setNodes(prev => [...prev, positioned]);
  }, [pan, zoom, setNodes]);

  /* ── Boards CRUD ─ */
  const switchBoard = (id: string) => {
    setActiveBoardId(id);
    setSelectedId(null);
    setViewerId(null);
    setConnectingFromId(null);
    setAiSelectedIds([]);
    setZoom(1);
    setPan({ x: 80, y: 60 });
  };

  const newBoard = () => setShowTemplateDialog(true);

  const createFromTemplate = (templateId: string | null) => {
    const board = templateId
      ? (BOARD_TEMPLATES.find(t => t.id === templateId)?.create() ?? createBoard("New Board"))
      : createBoard("New Board");
    setBoards(prev => [...prev, board]);
    switchBoard(board.id);
    setShowTemplateDialog(false);
    toast.success(`"${board.name}" created`);
  };

  const renameBoard = (id: string, name: string) => {
    setBoards(prev => prev.map(b => b.id === id ? { ...b, name, updatedAt: new Date().toISOString() } : b));
  };

  const duplicateBoard = (id: string) => {
    const src = boards.find(b => b.id === id);
    if (!src) return;
    const now = new Date().toISOString();
    const copy: Board = { ...src, id: genId("board"), name: `${src.name} (copy)`, createdAt: now, updatedAt: now };
    setBoards(prev => [...prev, copy]);
    toast.success("Board duplicated");
  };

  const deleteBoardById = (id: string) => {
    if (boards.length <= 1) return toast.error("Cannot delete the only board");
    const remaining = boards.filter(b => b.id !== id);
    setBoards(remaining);
    if (activeBoardId === id) switchBoard(remaining[0].id);
    toast.success("Board deleted");
  };

  /* ── Fit to screen ─ */
  const fitToScreen = () => {
    if (nodes.length === 0) { setPan({ x: 80, y: 60 }); setZoom(1); return; }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
    const minX = Math.min(...xs) - 60, minY = Math.min(...ys) - 60;
    const maxX = Math.max(...xs) + NODE_W + 60, maxY = Math.max(...ys) + NODE_H + 60;
    const scaleX = rect.width / (maxX - minX);
    const scaleY = rect.height / (maxY - minY);
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(scaleX, scaleY) * 0.9));
    setZoom(newZoom);
    setPan({
      x: -minX * newZoom + (rect.width - (maxX - minX) * newZoom) / 2,
      y: -minY * newZoom + (rect.height - (maxY - minY) * newZoom) / 2,
    });
  };

  /* ── Export board as Markdown ─ */
  const exportBoardText = () => {
    const lines: string[] = [`# ${activeBoard.name}`, `Exported ${new Date().toLocaleDateString()}`, ""];
    const byType: Record<string, CanvasNodeData[]> = {};
    nodes.forEach(n => { (byType[n.type] ??= []).push(n); });
    Object.entries(byType).forEach(([type, ns]) => {
      lines.push(`## ${NODE_TYPE_META[type as NodeType]?.label ?? type}s`);
      ns.forEach(n => {
        lines.push(`### ${n.title}${n.isAiGenerated ? " ✦ [AI]" : ""}`);
        if (n.author) lines.push(`Author: ${n.author}${n.year ? ` (${n.year})` : ""}`);
        if (n.journal) lines.push(`Venue: ${n.journal}`);
        if (n.content) lines.push(n.content.replace(/<[^>]+>/g, "").trim());
        if (n.tags?.length) lines.push(`Tags: ${n.tags.join(", ")}`);
        lines.push("");
      });
    });
    if (connections.length > 0) {
      lines.push("## Connections");
      connections.forEach(c => {
        const from = nodes.find(n => n.id === c.fromId);
        const to   = nodes.find(n => n.id === c.toId);
        if (from && to) lines.push(`- "${from.title}" ${CONN_TYPE_META[c.connType]?.label ?? "→"} "${to.title}"${c.isAiGenerated ? " [AI]" : ""}`);
      });
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${activeBoard.name.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Board exported as Markdown");
  };

  /* ── Derived UI ─ */
  const selectedNode = selectedId ? nodes.find(n => n.id === selectedId) ?? null : null;
  const viewerNode   = viewerId ? nodes.find(n => n.id === viewerId) ?? null : null;
  const showProps    = !!selectedNode && !viewerNode && !showAIPanel;
  const nodeCount    = nodes.length;
  const connCount    = connections.length;
  const aiNodeCount  = nodes.filter(n => n.isAiGenerated).length;

  return (
    <AppLayout fullBleed>
      <TooltipProvider delayDuration={400}>
        <div className="flex flex-col h-full overflow-hidden">

          {/* ════════════════════════════════════════════════════
              TOOLBAR — grouped: [Nav] | [Create] | [AI] | [View] | [Zoom/Export]
          ════════════════════════════════════════════════════ */}
          <div className="flex-none h-11 border-b border-border bg-card flex items-center gap-0 px-2 z-20 overflow-x-auto">

            {/* GROUP 1: Navigation */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setShowBoardList(p => !p)}
                  className={cn("w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors shrink-0",
                    showBoardList && "bg-secondary text-foreground")}>
                  <PanelLeft className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle board list</TooltipContent>
            </Tooltip>

            <div className="w-px h-5 bg-border mx-1.5 shrink-0" />

            {/* Board name + stats */}
            <div className="flex items-center gap-1.5 min-w-0 max-w-[180px] shrink-0">
              <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-[13px] font-semibold text-foreground truncate">{activeBoard?.name ?? "Canvas"}</span>
              <span className="text-[10px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                {nodeCount}n · {connCount}c
              </span>
            </div>

            <div className="w-px h-5 bg-border mx-1.5 shrink-0" />

            {/* GROUP 2: Create */}
            <div ref={addMenuRef} className="relative shrink-0">
              <button onClick={() => setShowAddMenu(p => !p)}
                className={cn("flex items-center gap-1 h-7 px-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-[12px] text-foreground transition-colors",
                  showAddMenu && "bg-accent/10 text-accent")}>
                <Plus className="w-3.5 h-3.5" /> Add
                <ChevronDown className="w-3 h-3 ml-0.5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showAddMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute left-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl py-1 z-50 min-w-[200px]">
                    <div className="px-3 pt-1 pb-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Research Objects</p>
                    </div>
                    {ADD_NODE_TYPES.map(({ type, label, color, description }) => (
                      <button key={type} onClick={() => addNode(type)}
                        className="flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left transition-colors">
                        <span className={color}>{nodeTypeIcon(type)}</span>
                        <div>
                          <span className="font-medium">{label}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">{description}</span>
                        </div>
                      </button>
                    ))}
                    <div className="my-0.5 border-t border-border/60" />
                    <div className="px-3 pt-1 pb-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Files</p>
                    </div>
                    <button onClick={() => { fileInputRef.current?.click(); setShowAddMenu(false); }}
                      className="flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-foreground hover:bg-secondary w-full text-left transition-colors">
                      <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Upload File</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setShowSearch(p => !p)}
                  className={cn("w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors ml-1 shrink-0",
                    showSearch && "bg-secondary text-foreground")}>
                  <Search className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Search nodes (⌘F)</TooltipContent>
            </Tooltip>

            {/* Search bar */}
            <AnimatePresence>
              {showSearch && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                  className="flex items-center gap-1.5 overflow-hidden ml-1 shrink-0">
                  <div className="relative flex items-center h-7 w-full">
                    <Search className="absolute left-2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search nodes…"
                      className="w-full pl-6 pr-2 h-7 bg-secondary rounded-lg text-[12px] text-foreground outline-none border border-border focus:border-primary/50 transition-colors"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-2 text-muted-foreground hover:text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {(["note", "insight", "question", "citation", "task"] as NodeType[]).map(t => (
                      <button key={t} onClick={() => setFilterType(ft => ft === t ? null : t)}
                        className={cn("h-5 px-1.5 rounded text-[9px] font-medium transition-colors",
                          filterType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80")}>
                        {NODE_TYPE_META[t].shortLabel}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-px h-5 bg-border mx-1.5 shrink-0" />

            {/* GROUP 3: AI Assist */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setShowAIPanel(p => {
                      if (!p) {
                        // Opening AI panel: default select all to none (user will select)
                      }
                      return !p;
                    });
                  }}
                  className={cn(
                    "flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[12px] font-medium transition-colors shrink-0",
                    showAIPanel
                      ? "bg-purple-400/15 text-purple-400 border border-purple-400/30"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI
                  {aiNodeCount > 0 && (
                    <span className="text-[9px] bg-purple-400/20 text-purple-400 px-1 rounded-full">{aiNodeCount}</span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">AI Research Assistant — extract nodes, suggest connections, synthesize, generate questions</TooltipContent>
            </Tooltip>

            {showAIPanel && (
              <span className="text-[10px] text-purple-400/70 ml-1.5 shrink-0 hidden sm:block">
                {aiSelectedIds.length > 0 ? `${aiSelectedIds.length} selected` : "Click nodes to select · Ctrl+click to multi-select"}
              </span>
            )}

            <div className="w-px h-5 bg-border mx-1.5 shrink-0" />

            {/* GROUP 4: View mode */}
            <div ref={viewMenuRef} className="relative shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowViewMenu(p => !p)}
                    className={cn(
                      "flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[12px] text-foreground transition-colors",
                      showViewMenu ? "bg-accent/10 text-accent" : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {viewModeIcon(viewMode)}
                    <span className="hidden sm:block">{VIEW_MODE_META[viewMode].label}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Switch view mode</TooltipContent>
              </Tooltip>
              <AnimatePresence>
                {showViewMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl py-1 z-50 min-w-[240px]"
                  >
                    <div className="px-3 pt-1.5 pb-1">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Visualization Modes</p>
                    </div>
                    {(["canvas", "outline", "evidence-map"] as ViewMode[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => { setViewMode(mode); setShowViewMenu(false); }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-secondary w-full text-left transition-colors"
                      >
                        <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                          mode === viewMode ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground")}>
                          {viewModeIcon(mode, "w-3.5 h-3.5")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-foreground">{VIEW_MODE_META[mode].label}</p>
                          <p className="text-[10px] text-muted-foreground">{VIEW_MODE_META[mode].description}</p>
                        </div>
                        {mode === viewMode && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 min-w-0" />

            {/* Connect mode banner */}
            <AnimatePresence>
              {connectingFromId && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2 px-3 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">Click a target node · Esc to cancel</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-px h-5 bg-border mx-1.5 shrink-0" />

            {/* GROUP 5: Zoom + Export */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => applyZoom(1 / (1 + ZOOM_STEP))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Zoom out</TooltipContent>
              </Tooltip>

              <span className="text-[11px] text-muted-foreground w-10 text-center font-mono tabular-nums">
                {Math.round(zoom * 100)}%
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => applyZoom(1 + ZOOM_STEP)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Zoom in</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={fitToScreen}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Fit to screen</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={exportBoardText}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Export board as Markdown</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════
              MAIN CONTENT AREA
          ════════════════════════════════════════════════════ */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">

            {/* Onboarding overlay */}
            {showOnboarding && (
              <OnboardingOverlay onDone={() => setShowOnboarding(false)} />
            )}

            {/* Board list panel */}
            <AnimatePresence initial={false}>
              {showBoardList && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="flex-none overflow-hidden h-full"
                  style={{ minWidth: 0 }}
                >
                  <BoardListPanel
                    boards={boards}
                    activeBoardId={activeBoardId}
                    onSelect={switchBoard}
                    onNew={newBoard}
                    onRename={renameBoard}
                    onDuplicate={duplicateBoard}
                    onDelete={deleteBoardById}
                    onClose={() => setShowBoardList(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Content: Canvas / Outline / Evidence Map ── */}
            <div className="flex-1 flex min-w-0 overflow-hidden relative">

              {/* CANVAS MODE */}
              {viewMode === "canvas" && (
                <div
                  ref={containerRef}
                  className={cn(
                    "flex-1 relative overflow-hidden select-none",
                    dropZoneActive && "ring-2 ring-primary/50 ring-inset",
                    connectingFromId ? "cursor-crosshair" : "cursor-default"
                  )}
                  onMouseDown={onCanvasMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  style={{ background: "radial-gradient(circle at 1px 1px, hsl(var(--border)/0.4) 1px, transparent 0) 0 0 / 24px 24px" }}
                >
                  {/* Drop zone indicator */}
                  {dropZoneActive && (
                    <div className="absolute inset-4 border-2 border-dashed border-primary/40 rounded-2xl flex items-center justify-center pointer-events-none z-30">
                      <div className="flex flex-col items-center gap-2 text-primary/60">
                        <Upload className="w-8 h-8" />
                        <p className="text-sm font-medium">Drop files to add to canvas</p>
                      </div>
                    </div>
                  )}

                  {/* Transform layer */}
                  <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", position: "absolute", top: 0, left: 0 }}>
                    {/* SVG connections */}
                    <ConnectionsLayer connections={connections} nodes={nodes} onRemove={deleteConn} />

                    {/* Nodes */}
                    {nodes.map(node => (
                      <CanvasNodeCard
                        key={node.id}
                        node={node}
                        selected={selectedId === node.id}
                        isConnecting={!!connectingFromId}
                        connectingFromId={connectingFromId}
                        onMouseDown={onNodeMouseDown}
                        onClick={onNodeClick}
                        onOpen={id => setViewerId(id)}
                        onDelete={deleteNode}
                        onColorChange={changeColor}
                        onTogglePin={togglePin}
                        onStartConnect={id => setConnectingFromId(id)}
                        onTagRemove={updateNodeTags}
                        onInlineEdit={inlineEdit}
                        dimmed={filteredNodeIds !== null && !filteredNodeIds.has(node.id)}
                        isAiSelected={aiSelectedIds.includes(node.id)}
                      />
                    ))}
                  </div>

                  {/* Empty state */}
                  {nodes.length === 0 && !dropZoneActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
                          <Layers className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1">Empty board</h3>
                        <p className="text-sm text-muted-foreground">Start building your research canvas</p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
                        {(["note", "insight", "question", "hypothesis", "citation"] as NodeType[]).map(t => {
                          const col = NODE_COLORS[NODE_TYPE_META[t].defaultColor];
                          return (
                            <button key={t} onClick={() => addNode(t)}
                              className={cn("flex items-center gap-1.5 h-8 px-3 rounded-xl border text-[12px] font-medium bg-card hover:bg-secondary transition-colors", col.border, col.tag)}>
                              {nodeTypeIcon(t, "w-3.5 h-3.5")}
                              {NODE_TYPE_META[t].label}
                            </button>
                          );
                        })}
                        <button onClick={newBoard}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-[12px] font-medium text-muted-foreground bg-card hover:bg-secondary transition-colors">
                          <Layers className="w-3.5 h-3.5" /> Use a template
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status bar */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-1.5 rounded-full bg-card/90 border border-border/80 text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm pointer-events-none z-10">
                    <span>{Math.round(zoom * 100)}%</span>
                    <div className="w-px h-3 bg-border" />
                    <span>{nodeCount} nodes · {connCount} connections</span>
                    {aiNodeCount > 0 && (
                      <>
                        <div className="w-px h-3 bg-border" />
                        <span className="text-purple-400 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />{aiNodeCount} AI
                        </span>
                      </>
                    )}
                    <div className="w-px h-3 bg-border" />
                    <span>Scroll to zoom · Drag to pan</span>
                  </div>
                </div>
              )}

              {/* OUTLINE MODE */}
              {viewMode === "outline" && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
                    <LayoutList className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Outline — hierarchical view of all research objects, grouped by type</span>
                    <button onClick={() => setViewMode("canvas")} className="ml-auto text-[11px] text-primary hover:text-primary/80 transition-colors">
                      Switch to Canvas
                    </button>
                  </div>
                  <OutlineView
                    nodes={nodes}
                    connections={connections}
                    selectedId={selectedId}
                    onSelect={id => setSelectedId(id)}
                    onOpen={id => setViewerId(id)}
                  />
                </div>
              )}

              {/* EVIDENCE MAP MODE */}
              {viewMode === "evidence-map" && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
                    <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Evidence Map — claims vs. supporting and contradicting evidence</span>
                    <button onClick={() => setViewMode("canvas")} className="ml-auto text-[11px] text-primary hover:text-primary/80 transition-colors">
                      Switch to Canvas
                    </button>
                  </div>
                  <EvidenceMapView
                    nodes={nodes}
                    connections={connections}
                    selectedId={selectedId}
                    onSelect={id => setSelectedId(id)}
                    onOpen={id => setViewerId(id)}
                  />
                </div>
              )}
            </div>

            {/* ── Right Panel: Properties OR AI Panel ── */}
            <AnimatePresence>
              {showAIPanel && (
                <AIAssistPanel
                  key="ai-panel"
                  nodes={nodes}
                  selectedNodeIds={aiSelectedIds}
                  onClose={() => setShowAIPanel(false)}
                  onAcceptNodes={onAcceptAINodes}
                  onAcceptConnections={onAcceptAIConnections}
                  onAddSynthesisNode={onAddSynthesisNode}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showProps && selectedNode && (
                <motion.div
                  key="props-panel"
                  initial={{ x: 256, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 256, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="flex-none"
                >
                  <PropertiesPanel
                    node={selectedNode}
                    connections={connections}
                    allNodes={nodes}
                    onClose={() => setSelectedId(null)}
                    onUpdate={updateNode}
                    onTagsChange={updateNodeTags}
                    onStatusChange={updateStatus}
                    onDeleteConnection={deleteConn}
                    onOpen={id => setViewerId(id)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Connection Type Picker Dialog ── */}
          {pendingConn && (
            <Dialog open onOpenChange={() => setPendingConn(null)}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold">Choose Relationship Type</DialogTitle>
                </DialogHeader>
                <p className="text-[12px] text-muted-foreground mb-3">
                  How does "<strong>{nodes.find(n => n.id === pendingConn.fromId)?.title}</strong>" relate to "<strong>{nodes.find(n => n.id === pendingConn.toId)?.title}</strong>"?
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {(Object.entries(CONN_TYPE_META) as [ConnType, (typeof CONN_TYPE_META)[ConnType]][]).map(([ct, meta]) => (
                    <button key={ct} onClick={() => { createConn(pendingConn.fromId, pendingConn.toId, ct); setPendingConn(null); }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left group">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.stroke }} />
                      <div className="flex-1">
                        <span className="text-[12px] font-medium text-foreground">{meta.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">{meta.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* ── Template Picker Dialog ── */}
          {showTemplateDialog && (
            <Dialog open onOpenChange={() => setShowTemplateDialog(false)}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>New Research Board</DialogTitle>
                  <p className="text-[13px] text-muted-foreground">Start from a template or create a blank board.</p>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-2">
                  <div className="grid grid-cols-2 gap-3 pb-2">
                    {/* Blank board */}
                    <button onClick={() => createFromTemplate(null)}
                      className="flex flex-col items-start gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-secondary/30 transition-all text-left">
                      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">Blank Board</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Start from scratch</p>
                      </div>
                    </button>

                    {/* Templates */}
                    {BOARD_TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => createFromTemplate(t.id)}
                        className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/30 transition-all text-left group">
                        <div className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          {templateIcon(t.id)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-semibold text-foreground">{t.name}</p>
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-wide">
                              {CATEGORY_LABELS[t.category]}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{t.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}

          {/* ── Document Viewer Dialog ── */}
          {viewerNode && (
            <DocumentViewer
              node={viewerNode}
              onClose={() => setViewerId(null)}
              onSave={saveNodeContent}
              onTagsChange={updateNodeTags}
            />
          )}

          {/* ── Hidden file input ── */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,text/*,.md,.txt"
            className="sr-only"
            onChange={e => { processFiles(e.target.files); e.target.value = ""; }}
          />
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
