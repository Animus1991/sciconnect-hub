import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Undo2, Redo2, Bold, Italic, List, Clock, MessageSquare, X, ChevronLeft, Type, AlignLeft } from "lucide-react";
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

We employ a data-encoding strategy using...

### 3.2 Variational Circuit Architecture

The core of our approach utilizes a layered variational ansatz with...

## 4. Results

Our experiments demonstrate a 23% improvement in classification accuracy compared to purely classical baselines, while requiring 40% fewer training epochs to converge.
`;

const mockVersions: DocVersion[] = [
  { id: "v3", content: initialContent, savedBy: "Dr. Alex Thompson", savedAt: "2 min ago", label: "Current" },
  { id: "v2", content: initialContent.replace("23%", "18%").replace("40%", "35%"), savedBy: "Dr. Sarah Chen", savedAt: "1 hour ago", label: "Updated results" },
  { id: "v1", content: initialContent.replace("## 4. Results\n\nOur experiments demonstrate", "## 4. Results\n\nPreliminary experiments show"), savedBy: "Dr. Alex Thompson", savedAt: "Yesterday", label: "Initial draft" },
];

const mockComments: DocComment[] = [
  { id: "c1", author: { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)" }, text: "Should we add more detail about the variational ansatz structure here?", timestamp: "10:45 AM", resolved: false, selection: "layered variational ansatz" },
  { id: "c2", author: { name: "Prof. James Wilson", initials: "JW", color: "hsl(200, 50%, 50%)" }, text: "The improvement numbers look great! Can we add confidence intervals?", timestamp: "11:20 AM", resolved: false, selection: "23% improvement" },
  { id: "c3", author: { name: "Maria Garcia", initials: "MG", color: "hsl(280, 50%, 55%)" }, text: "I've added references for the related work section.", timestamp: "Yesterday", resolved: true },
];

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live cursor simulation
  const [liveCursors] = useState([
    { name: "Dr. Sarah Chen", initials: "SC", color: "hsl(160, 60%, 45%)", line: 8 },
  ]);

  const handleContentChange = (newContent: string) => {
    setUndoStack(prev => [...prev.slice(-20), content]);
    setRedoStack([]);
    setContent(newContent);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, content]);
    setContent(prev);
    setUndoStack(u => u.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, content]);
    setContent(next);
    setRedoStack(r => r.slice(0, -1));
  };

  const saveVersion = () => {
    setIsSaving(true);
    setTimeout(() => {
      const v: DocVersion = {
        id: `v_${Date.now()}`,
        content,
        savedBy: "Dr. Alex Thompson",
        savedAt: "Just now",
        label: `Version ${versions.length + 1}`,
      };
      setVersions(prev => [v, ...prev]);
      setIsSaving(false);
      toast.success("Version saved", { description: `${title} — Version ${versions.length + 1}` });
    }, 500);
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h3 className="font-serif text-sm font-semibold text-foreground">{title}</h3>

          {/* Live collaborator indicator */}
          {liveCursors.map(cursor => (
            <Badge key={cursor.name} variant="secondary" className="text-[9px] font-display flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cursor.color }} />
              {cursor.initials} editing
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={undoStack.length === 0} className="p-1.5 rounded hover:bg-secondary transition-colors disabled:opacity-30">
            <Undo2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={redo} disabled={redoStack.length === 0} className="p-1.5 rounded hover:bg-secondary transition-colors disabled:opacity-30">
            <Redo2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button onClick={() => setShowVersions(!showVersions)} className={`p-1.5 rounded transition-colors ${showVersions ? "bg-accent/10 text-accent" : "hover:bg-secondary"}`}>
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowComments(!showComments)} className={`p-1.5 rounded transition-colors relative ${showComments ? "bg-accent/10 text-accent" : "hover:bg-secondary"}`}>
            <MessageSquare className="w-3.5 h-3.5" />
            {unresolvedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent text-accent-foreground text-[8px] font-bold flex items-center justify-center">
                {unresolvedCount}
              </span>
            )}
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button size="sm" onClick={saveVersion} disabled={isSaving} className="text-[10px] h-7 px-2.5 font-display bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="w-3 h-3 mr-1" /> {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-border">
        <button className="p-1.5 rounded hover:bg-secondary transition-colors"><Bold className="w-3.5 h-3.5 text-muted-foreground" /></button>
        <button className="p-1.5 rounded hover:bg-secondary transition-colors"><Italic className="w-3.5 h-3.5 text-muted-foreground" /></button>
        <button className="p-1.5 rounded hover:bg-secondary transition-colors"><Type className="w-3.5 h-3.5 text-muted-foreground" /></button>
        <button className="p-1.5 rounded hover:bg-secondary transition-colors"><List className="w-3.5 h-3.5 text-muted-foreground" /></button>
        <button className="p-1.5 rounded hover:bg-secondary transition-colors"><AlignLeft className="w-3.5 h-3.5 text-muted-foreground" /></button>
      </div>

      <div className="flex">
        {/* Editor */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            className="w-full h-[400px] p-6 bg-transparent text-sm font-display text-foreground leading-relaxed resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Side panel: Versions or Comments */}
        <AnimatePresence>
          {(showVersions || showComments) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border overflow-hidden flex-shrink-0"
            >
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
                          <button
                            onClick={() => restoreVersion(v)}
                            className="text-[10px] font-display text-accent hover:underline"
                          >
                            Restore this version
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showComments && !showVersions && (
                  <div className="p-3 space-y-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
                      Comments ({unresolvedCount} open)
                    </p>

                    {/* New comment input */}
                    <div className="flex gap-2">
                      <input
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addComment()}
                        placeholder="Add a comment..."
                        className="flex-1 text-xs font-display bg-secondary/30 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/30"
                      />
                    </div>

                    {/* Comment list */}
                    {comments.map(c => (
                      <motion.div
                        key={c.id}
                        layout
                        className={`rounded-lg p-3 space-y-1.5 transition-colors ${
                          c.resolved ? "bg-secondary/20 opacity-60" : "bg-secondary/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-display font-bold text-primary-foreground flex-shrink-0"
                            style={{ backgroundColor: c.author.color }}
                          >
                            {c.author.initials}
                          </div>
                          <span className="text-[10px] font-display font-semibold text-foreground">{c.author.name}</span>
                          <span className="text-[9px] text-muted-foreground ml-auto">{c.timestamp}</span>
                        </div>
                        {c.selection && (
                          <p className="text-[10px] text-muted-foreground font-display italic border-l-2 border-accent/30 pl-2">
                            "{c.selection}"
                          </p>
                        )}
                        <p className="text-xs font-display text-foreground/90">{c.text}</p>
                        <button
                          onClick={() => toggleResolve(c.id)}
                          className="text-[10px] font-display text-accent hover:underline"
                        >
                          {c.resolved ? "Reopen" : "Resolve"}
                        </button>
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
