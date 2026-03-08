import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Undo2, Redo2, Bold, Italic, List, Clock, MessageSquare, ChevronLeft, Type, AlignLeft, Code, Heading1, Heading2, Quote, Download, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface DocVersion {
  id: string;
  content: string;
  savedBy: string;
  savedAt: string;
  label?: string;
}

interface DocComment {
  id: string;
  author: { name: string; initials: string; color: string };
  text: string;
  timestamp: string;
  resolved: boolean;
  selection?: string;
}

interface DocumentEditorProps {
  docId: string;
  title: string;
  onClose: () => void;
}

const initialContent = `# Main Manuscript

## Abstract

Quantum machine learning (QML) represents a promising intersection of quantum computing and artificial intelligence. In this paper, we present a novel hybrid quantum-classical neural network architecture that leverages variational quantum circuits for feature extraction while maintaining classical post-processing layers for classification tasks.

## 1. Introduction

The rapid advancement of quantum computing hardware has opened new avenues for computational approaches that were previously intractable. Our work builds upon recent developments in parameterized quantum circuits and demonstrates significant improvements in training convergence and classification accuracy on benchmark datasets.

## 2. Related Work

Previous approaches to quantum machine learning have primarily focused on...

## 3. Methodology

### 3.1 Quantum Feature Map

We employ a data-encoding strategy using amplitude encoding:

\`\`\`python
def quantum_feature_map(x, n_qubits):
    circuit = QuantumCircuit(n_qubits)
    for i in range(n_qubits):
        circuit.ry(x[i] * np.pi, i)
    return circuit
\`\`\`

### 3.2 Variational Circuit Architecture

The core of our approach utilizes a layered variational ansatz with entangling gates between adjacent qubits.

> "The expressibility of the variational ansatz is crucial for achieving quantum advantage." — Cerezo et al., 2021

## 4. Results

Our experiments demonstrate a **23% improvement** in classification accuracy compared to purely classical baselines, while requiring *40% fewer* training epochs to converge.

| Model | Accuracy | Epochs | Parameters |
|-------|----------|--------|------------|
| Classical CNN | 85.2% | 200 | 1.2M |
| Hybrid QML | **96.1%** | 120 | 0.8M |
| Pure Quantum | 78.4% | 350 | 0.3M |
`;

const mockVersions: DocVersion[] = [
  { id: "v3", content: initialContent, savedBy: "Dr. Alex Thompson", savedAt: "2 min ago", label: "Current" },
  { id: "v2", content: initialContent.replace("23%", "18%").replace("40%", "35%"), savedBy: "Dr. Sarah Chen", savedAt: "1 hour ago", label: "Updated results" },
  { id: "v1", content: initialContent.replace("**23% improvement**", "18% improvement"), savedBy: "Dr. Alex Thompson", savedAt: "Yesterday", label: "Initial draft" },
];

const mockComments: DocComment[] = [
  { id: "c1", author: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, text: "Should we add more detail about the variational ansatz structure here?", timestamp: "10:45 AM", resolved: false, selection: "layered variational ansatz" },
  { id: "c2", author: { name: "Prof. James Wilson", initials: "JW", color: "hsl(200, 50%, 50%)" }, text: "The improvement numbers look great! Can we add confidence intervals?", timestamp: "11:20 AM", resolved: false, selection: "23% improvement" },
  { id: "c3", author: { name: "Maria Garcia", initials: "MG", color: "hsl(280, 50%, 55%)" }, text: "I've added references for the related work section.", timestamp: "Yesterday", resolved: true },
];

// Simple markdown renderer
const renderMarkdown = (text: string): string => {
  let html = text
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) =>
      `<pre class="bg-secondary/50 rounded-lg p-3 my-2 overflow-x-auto"><code class="text-xs font-mono text-foreground/90">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-secondary/50 rounded px-1 py-0.5 text-xs font-mono text-accent">$1</code>')
    // Tables
    .replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/g, (_m, header, rows) => {
      const heads = header.split('|').filter((s: string) => s.trim()).map((h: string) => `<th class="px-3 py-1.5 text-left text-[10px] font-display font-semibold text-muted-foreground border-b border-border">${h.trim()}</th>`).join('');
      const bodyRows = rows.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter((s: string) => s.trim()).map((c: string) => `<td class="px-3 py-1.5 text-xs font-display text-foreground border-b border-border/50">${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table class="w-full border border-border rounded-lg my-2 overflow-hidden"><thead><tr>${heads}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    })
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-accent/40 pl-3 my-2 text-sm text-muted-foreground italic font-display">$1</blockquote>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-serif font-semibold text-foreground mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-serif font-bold text-foreground mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-serif font-bold text-foreground mt-6 mb-3">$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Paragraphs (lines that aren't already HTML)
    .replace(/^(?!<)((?!^$).+)$/gm, '<p class="text-sm font-display text-foreground/90 leading-relaxed mb-1">$1</p>')
    // Empty lines
    .replace(/^\s*$/gm, '');

  return html;
};

const DocumentEditor = ({ docId, title, onClose }: DocumentEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [versions, setVersions] = useState(mockVersions);
  const [comments, setComments] = useState(mockComments);
  const [showVersions, setShowVersions] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [liveCursors] = useState([
    { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)", line: 8 },
  ]);

  const renderedHtml = useMemo(() => renderMarkdown(content), [content]);

  const handleContentChange = (newContent: string) => {
    setUndoStack(prev => [...prev.slice(-20), content]);
    setRedoStack([]);
    setContent(newContent);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    setRedoStack(r => [...r, content]);
    setContent(undoStack[undoStack.length - 1]);
    setUndoStack(u => u.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    setUndoStack(u => [...u, content]);
    setContent(redoStack[redoStack.length - 1]);
    setRedoStack(r => r.slice(0, -1));
  };

  const insertFormatting = (prefix: string, suffix = prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end);
    const newContent = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
    handleContentChange(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const saveVersion = () => {
    setIsSaving(true);
    setTimeout(() => {
      const v: DocVersion = {
        id: `v_${Date.now()}`, content, savedBy: "Dr. Alex Thompson",
        savedAt: "Just now", label: `Version ${versions.length + 1}`,
      };
      setVersions(prev => [v, ...prev]);
      setIsSaving(false);
      toast.success("Version saved", { description: `${title} — Version ${versions.length + 1}` });
    }, 500);
  };

  const exportPdf = () => {
    // Generate printable HTML and trigger print dialog
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Please allow popups for PDF export"); return; }
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
        h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 8px; }
        h2 { font-size: 20px; margin-top: 32px; color: #2a2a2a; }
        h3 { font-size: 16px; margin-top: 24px; }
        pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
        code { font-family: 'Courier New', monospace; }
        blockquote { border-left: 3px solid #666; padding-left: 16px; color: #666; font-style: italic; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        strong { font-weight: 700; }
        @media print { body { margin: 0; } }
      </style></head><body>${renderedHtml}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
    toast.success("PDF export ready", { description: "Use the print dialog to save as PDF" });
  };

  const restoreVersion = (v: DocVersion) => {
    setUndoStack(prev => [...prev, content]);
    setContent(v.content);
    setShowVersions(false);
    toast.info("Version restored", { description: v.label || v.savedAt });
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const c: DocComment = {
      id: `c_${Date.now()}`,
      author: { name: "Dr. Alex Thompson", initials: "AT", color: "hsl(var(--gold))" },
      text: newComment,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      resolved: false,
    };
    setComments(prev => [c, ...prev]);
    setNewComment("");
  };

  const toggleResolve = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c));
  };

  const unresolvedCount = comments.filter(c => !c.resolved).length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
      className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/20 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h3 className="font-serif text-sm font-semibold text-foreground">{title}</h3>
          {liveCursors.map(cursor => (
            <Badge key={cursor.name} variant="secondary" className="text-[9px] font-display flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cursor.color }} />
              {cursor.initials} editing
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {/* View mode toggles */}
          <div className="flex items-center bg-secondary/30 rounded-lg p-0.5 mr-2">
            <button onClick={() => setViewMode("edit")} className={`p-1 rounded text-[10px] font-display ${viewMode === "edit" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <Edit3 className="w-3 h-3" />
            </button>
            <button onClick={() => setViewMode("split")} className={`p-1 rounded text-[10px] font-display ${viewMode === "split" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <Code className="w-3 h-3" />
            </button>
            <button onClick={() => setViewMode("preview")} className={`p-1 rounded text-[10px] font-display ${viewMode === "preview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <Eye className="w-3 h-3" />
            </button>
          </div>
          <button onClick={undo} disabled={undoStack.length === 0} className="p-1.5 rounded hover:bg-secondary transition-colors disabled:opacity-30">
            <Undo2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={redo} disabled={redoStack.length === 0} className="p-1.5 rounded hover:bg-secondary transition-colors disabled:opacity-30">
            <Redo2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button onClick={() => { setShowVersions(!showVersions); if (!showVersions) setShowComments(false); }}
            className={`p-1.5 rounded transition-colors ${showVersions ? "bg-accent/10 text-accent" : "hover:bg-secondary"}`}>
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setShowComments(!showComments); if (!showComments) setShowVersions(false); }}
            className={`p-1.5 rounded transition-colors relative ${showComments && !showVersions ? "bg-accent/10 text-accent" : "hover:bg-secondary"}`}>
            <MessageSquare className="w-3.5 h-3.5" />
            {unresolvedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent text-accent-foreground text-[8px] font-bold flex items-center justify-center">{unresolvedCount}</span>
            )}
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button size="sm" onClick={exportPdf} variant="outline" className="text-[10px] h-7 px-2 font-display">
            <Download className="w-3 h-3 mr-1" /> PDF
          </Button>
          <Button size="sm" onClick={saveVersion} disabled={isSaving} className="text-[10px] h-7 px-2.5 font-display bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="w-3 h-3 mr-1" /> {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Formatting toolbar */}
      {viewMode !== "preview" && (
        <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-border">
          <button onClick={() => insertFormatting("**")} className="p-1.5 rounded hover:bg-secondary transition-colors" title="Bold"><Bold className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onClick={() => insertFormatting("*")} className="p-1.5 rounded hover:bg-secondary transition-colors" title="Italic"><Italic className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onClick={() => insertFormatting("`")} className="p-1.5 rounded hover:bg-secondary transition-colors" title="Code"><Code className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button onClick={() => insertFormatting("# ", "")} className="p-1.5 rounded hover:bg-secondary transition-colors" title="Heading 1"><Heading1 className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onClick={() => insertFormatting("## ", "")} className="p-1.5 rounded hover:bg-secondary transition-colors" title="Heading 2"><Heading2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button onClick={() => insertFormatting("- ", "")} className="p-1.5 rounded hover:bg-secondary transition-colors" title="List"><List className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onClick={() => insertFormatting("> ", "")} className="p-1.5 rounded hover:bg-secondary transition-colors" title="Quote"><Quote className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onClick={() => insertFormatting("```\n", "\n```")} className="p-1.5 rounded hover:bg-secondary transition-colors" title="Code Block"><Type className="w-3.5 h-3.5 text-muted-foreground" /></button>
        </div>
      )}

      <div className="flex">
        {/* Editor / Preview */}
        <div className="flex-1 min-w-0 flex">
          {(viewMode === "edit" || viewMode === "split") && (
            <div className={`${viewMode === "split" ? "w-1/2 border-r border-border" : "w-full"} min-w-0`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => handleContentChange(e.target.value)}
                className="w-full h-[400px] p-6 bg-transparent text-sm font-mono text-foreground leading-relaxed resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
          )}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} min-w-0`}>
              <ScrollArea className="h-[400px]">
                <div className="p-6 prose-custom" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {(showVersions || (showComments && !showVersions)) && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="border-l border-border overflow-hidden flex-shrink-0">
              <ScrollArea className="h-[440px]">
                {showVersions && (
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">Version History</p>
                    {versions.map(v => (
                      <div key={v.id} className="bg-secondary/30 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-display font-semibold text-foreground">{v.label || "Version"}</span>
                          <span className="text-[10px] text-muted-foreground">{v.savedAt}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-display">{v.savedBy}</p>
                        {v.id !== versions[0].id && (
                          <button onClick={() => restoreVersion(v)} className="text-[10px] font-display text-accent hover:underline">Restore this version</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {showComments && !showVersions && (
                  <div className="p-3 space-y-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">Comments ({unresolvedCount} open)</p>
                    <div className="flex gap-2">
                      <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()}
                        placeholder="Add a comment..."
                        className="flex-1 text-xs font-display bg-secondary/30 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/30" />
                    </div>
                    {comments.map(c => (
                      <motion.div key={c.id} layout className={`rounded-lg p-3 space-y-1.5 transition-colors ${c.resolved ? "bg-secondary/20 opacity-60" : "bg-secondary/40"}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-display font-bold text-primary-foreground flex-shrink-0" style={{ backgroundColor: c.author.color }}>{c.author.initials}</div>
                          <span className="text-[10px] font-display font-semibold text-foreground">{c.author.name}</span>
                          <span className="text-[9px] text-muted-foreground ml-auto">{c.timestamp}</span>
                        </div>
                        {c.selection && <p className="text-[10px] text-muted-foreground font-display italic border-l-2 border-accent/30 pl-2">"{c.selection}"</p>}
                        <p className="text-xs font-display text-foreground/90">{c.text}</p>
                        <button onClick={() => toggleResolve(c.id)} className="text-[10px] font-display text-accent hover:underline">{c.resolved ? "Reopen" : "Resolve"}</button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DocumentEditor;
