import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Plus, Search, FileText, Pin, PinOff, Trash2, Copy, Download,
  ChevronDown, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, Code, Code2, Link2, Highlighter,
  Heading1, Heading2, Heading3, Undo2, Redo2, Table, CheckSquare,
  AlignLeft, MoreHorizontal, Clock, Hash, Subscript, Superscript,
  FilePlus2, LayoutTemplate, X, Check, Minus,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import LinkExt from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table as TableExt, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import SubscriptExt from "@tiptap/extension-subscript";
import SuperscriptExt from "@tiptap/extension-superscript";
import {
  WorkspaceDocument, DocType, DOC_TYPE_META, DOC_TEMPLATES,
  createBlankDocument, createFromDocTemplate,
} from "@/data/workspaceMockData";
import { useDocumentStorage } from "@/hooks/useWorkspaceStorage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function readingTime(wordCount: number) {
  const mins = Math.ceil(wordCount / 200);
  return mins <= 1 ? "< 1 min read" : `${mins} min read`;
}

function countWords(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<u[^>]*>(.*?)<\/u>/gi, "_$1_")
    .replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) => c.split("\n").map((l: string) => "> " + l.trim()).join("\n") + "\n\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n").trim();
}

function ToolbarBtn({ onClick, active, disabled, title, children }: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onMouseDown={e => { e.preventDefault(); onClick(); }}
          disabled={disabled}
          className={cn(
            "h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground transition-colors text-[11px]",
            "hover:bg-secondary hover:text-foreground",
            active && "bg-accent/20 text-accent",
            disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{title}</TooltipContent>
    </Tooltip>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-border mx-0.5" />;
}

function DocListItem({ doc, active, onSelect, onPin, onDuplicate, onDelete }: {
  doc: WorkspaceDocument; active: boolean;
  onSelect: () => void; onPin: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const meta = DOC_TYPE_META[doc.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group relative flex flex-col gap-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
        active ? "bg-accent/10 border border-accent/20" : "hover:bg-secondary/60"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("text-[13px] font-medium text-foreground leading-snug flex-1 min-w-0 truncate", active && "text-accent")}>
          {doc.pinned && <Pin className="inline w-3 h-3 mr-1 text-accent" />}
          {doc.title}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-all" onClick={e => e.stopPropagation()}>
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={e => { e.stopPropagation(); onPin(); }}>
              {doc.pinned ? <PinOff className="w-3.5 h-3.5 mr-2" /> : <Pin className="w-3.5 h-3.5 mr-2" />}
              {doc.pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={e => { e.stopPropagation(); onDuplicate(); }}>
              <Copy className="w-3.5 h-3.5 mr-2" />Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={cn("text-[10px] font-medium", meta.color)}>{meta.label}</span>
        <span className="text-[10px] text-muted-foreground">·</span>
        <span className="text-[10px] text-muted-foreground">{doc.wordCount}w</span>
        <span className="text-[10px] text-muted-foreground">·</span>
        <span className="text-[10px] text-muted-foreground truncate">{formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}</span>
      </div>
    </motion.div>
  );
}

function TemplateCard({ template, onClick }: { template: typeof DOC_TEMPLATES[number]; onClick: () => void }) {
  const meta = DOC_TYPE_META[template.type];
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all group"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <FileText className={cn("w-4 h-4", meta.color)} />
        <span className="text-[13px] font-semibold text-foreground">{template.title}</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{meta.description}</p>
    </button>
  );
}

export default function Documents() {
  const { documents, upsertDocument, deleteDocument } = useDocumentStorage();
  const [activeId, setActiveId] = useState<string | null>(documents[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned">("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(false);

  const activeDoc = documents.find(d => d.id === activeId) ?? null;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: { depth: 100 }, link: false, underline: false }),
      UnderlineExt,
      Placeholder.configure({ placeholder: "Start writing your research document…" }),
      CharacterCount,
      LinkExt.configure({ openOnClick: false, autolink: true }),
      Highlight.configure({ multicolor: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableExt.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      SubscriptExt,
      SuperscriptExt,
    ],
    content: activeDoc?.content ?? "<p></p>",
    onUpdate({ editor }) {
      setSaveStatus("unsaved");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const html = editor.getHTML();
        const wc = countWords(html);
        setActiveIdAndSave(html, wc);
        setSaveStatus("saved");
      }, 1500);
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[480px] prose prose-sm prose-invert max-w-none px-8 py-6 text-foreground",
      },
    },
  });

  const setActiveIdAndSave = useCallback((html: string, wc: number) => {
    setActiveId(prev => {
      if (!prev) return prev;
      upsertDocument({
        ...documents.find(d => d.id === prev)!,
        content: html,
        wordCount: wc,
        updatedAt: new Date().toISOString(),
      });
      return prev;
    });
  }, [documents, upsertDocument]);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    if (!activeDoc || !editor) return;
    editor.commands.setContent(activeDoc.content, false);
    setTitle(activeDoc.title);
    setSaveStatus("saved");
  }, [activeId]);

  useEffect(() => {
    if (activeDoc) setTitle(activeDoc.title);
  }, [activeDoc?.id]);

  const handleTitleBlur = useCallback(() => {
    if (!activeDoc) return;
    const t = title.trim() || "Untitled Document";
    setTitle(t);
    upsertDocument({ ...activeDoc, title: t, updatedAt: new Date().toISOString() });
  }, [activeDoc, title, upsertDocument]);

  const newDoc = useCallback((type: DocType = "free") => {
    const doc = createBlankDocument(type);
    upsertDocument(doc);
    setActiveId(doc.id);
    setSaveStatus("saved");
  }, [upsertDocument]);

  const newFromTemplate = useCallback((template: typeof DOC_TEMPLATES[number]) => {
    const doc = createFromDocTemplate(template);
    upsertDocument(doc);
    setActiveId(doc.id);
    setShowTemplates(false);
    setSaveStatus("saved");
  }, [upsertDocument]);

  const duplicateDoc = useCallback((doc: WorkspaceDocument) => {
    const clone: WorkspaceDocument = {
      ...doc,
      id: Math.random().toString(36).slice(2),
      title: doc.title + " (copy)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
    };
    upsertDocument(clone);
    setActiveId(clone.id);
  }, [upsertDocument]);

  const pinDoc = useCallback((doc: WorkspaceDocument) => {
    upsertDocument({ ...doc, pinned: !doc.pinned });
  }, [upsertDocument]);

  const delDoc = useCallback((id: string) => {
    deleteDocument(id);
    const remaining = documents.filter(d => d.id !== id);
    setActiveId(remaining[0]?.id ?? null);
    toast.success("Document deleted");
  }, [documents, deleteDocument]);

  const exportMarkdown = useCallback(() => {
    if (!activeDoc || !editor) return;
    const md = htmlToMarkdown(editor.getHTML());
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = (activeDoc.title || "document") + ".md";
    a.click(); URL.revokeObjectURL(url);
    toast.success("Exported as Markdown");
  }, [activeDoc, editor]);

  const exportTxt = useCallback(() => {
    if (!activeDoc || !editor) return;
    const txt = editor.getHTML().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = (activeDoc.title || "document") + ".txt";
    a.click(); URL.revokeObjectURL(url);
    toast.success("Exported as plain text");
  }, [activeDoc, editor]);

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const filtered = documents
    .filter(d => filter === "pinned" ? d.pinned : true)
    .filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const wc = editor ? countWords(editor.getHTML()) : 0;

  return (
    <AppLayout>
      <TooltipProvider delayDuration={400}>
        <div className="flex h-[calc(100vh-56px)] overflow-hidden">

          {/* ── LEFT PANEL ── */}
          <div className="w-[260px] flex-shrink-0 border-r border-border flex flex-col bg-card/30">
            <div className="p-3 border-b border-border space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-foreground">Documents</h2>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowTemplates(true)}>
                        <LayoutTemplate className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Templates</TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="h-6 px-2 text-[11px] gap-1">
                        <Plus className="w-3 h-3" />New
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {(Object.keys(DOC_TYPE_META) as DocType[]).map(t => (
                        <DropdownMenuItem key={t} onClick={() => newDoc(t)}>
                          <span className={cn("w-2 h-2 rounded-full mr-2 flex-shrink-0 bg-current", DOC_TYPE_META[t].color)} />
                          {DOC_TYPE_META[t].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…" className="h-7 pl-7 text-[12px]" />
              </div>
              <div className="flex gap-1">
                {(["all", "pinned"] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cn("flex-1 h-6 rounded-md text-[11px] font-medium capitalize transition-colors",
                      filter === f ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground")}
                  >{f}</button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1 p-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <FileText className="w-8 h-8 text-muted-foreground/40 mb-3" />
                  <p className="text-[12px] text-muted-foreground">No documents yet</p>
                  <Button size="sm" variant="ghost" className="mt-3 text-[11px] h-7" onClick={() => newDoc()}>
                    <Plus className="w-3 h-3 mr-1" />Create one
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map(doc => (
                    <DocListItem
                      key={doc.id}
                      doc={doc}
                      active={doc.id === activeId}
                      onSelect={() => setActiveId(doc.id)}
                      onPin={() => pinDoc(doc)}
                      onDuplicate={() => duplicateDoc(doc)}
                      onDelete={() => delDoc(doc.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground text-center">{documents.length} document{documents.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {!activeDoc ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-accent" />
                </div>
                <div className="text-center max-w-sm">
                  <h3 className="text-[18px] font-semibold text-foreground mb-1">Research Documents</h3>
                  <p className="text-sm text-muted-foreground">Create, draft, and organize all your research writing in one place. Start from a template or create a blank document.</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => newDoc()} variant="default" className="gap-2">
                    <FilePlus2 className="w-4 h-4" />New Document
                  </Button>
                  <Button onClick={() => setShowTemplates(true)} variant="outline" className="gap-2">
                    <LayoutTemplate className="w-4 h-4" />Templates
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-xl mt-2">
                  {DOC_TEMPLATES.slice(0, 4).map(t => (
                    <TemplateCard key={t.type} template={t} onClick={() => newFromTemplate(t)} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Doc Header */}
                <div className="flex items-center gap-3 px-8 pt-5 pb-2 border-b border-border/50">
                  <div className="flex-1 min-w-0">
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      onBlur={handleTitleBlur}
                      className="w-full bg-transparent text-[20px] font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 tracking-tight"
                      placeholder="Untitled Document"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[11px] font-medium", DOC_TYPE_META[activeDoc.type].color)}>
                        {DOC_TYPE_META[activeDoc.type].label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground">
                        Edited {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[11px]",
                      saveStatus === "saved" ? "text-muted-foreground" :
                      saveStatus === "saving" ? "text-amber-400" : "text-muted-foreground"
                    )}>
                      {saveStatus === "saved" ? <span className="flex items-center gap-1"><Check className="w-3 h-3" />Saved</span> : "Saving…"}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] gap-1">
                          <Download className="w-3.5 h-3.5" />Export<ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={exportMarkdown}><Hash className="w-3.5 h-3.5 mr-2" />Markdown (.md)</DropdownMenuItem>
                        <DropdownMenuItem onClick={exportTxt}><AlignLeft className="w-3.5 h-3.5 mr-2" />Plain text (.txt)</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => pinDoc(activeDoc)}>
                          {activeDoc.pinned ? <PinOff className="w-3.5 h-3.5 mr-2" /> : <Pin className="w-3.5 h-3.5 mr-2" />}
                          {activeDoc.pinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateDoc(activeDoc)}>
                          <Copy className="w-3.5 h-3.5 mr-2" />Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => delDoc(activeDoc.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Toolbar */}
                {editor && (
                  <div className="flex items-center gap-0.5 px-8 py-1.5 border-b border-border/50 bg-background/60 flex-wrap">
                    <ToolbarBtn title="Undo (⌘Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                      <Undo2 className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Redo (⌘⇧Z)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                      <Redo2 className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <Sep />
                    <ToolbarBtn title="Bold (⌘B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                      <Bold className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Italic (⌘I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                      <Italic className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Underline (⌘U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                      <Underline className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
                      <Strikethrough className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
                      <Subscript className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
                      <Superscript className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <Sep />
                    <ToolbarBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                      <Heading1 className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                      <Heading2 className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                      <Heading3 className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <Sep />
                    <ToolbarBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                      <List className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                      <ListOrdered className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Task list" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
                      <CheckSquare className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <Sep />
                    <ToolbarBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                      <Quote className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
                      <Code className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                      <Code2 className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
                      <Highlighter className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <Sep />
                    <ToolbarBtn title="Insert table" onClick={addTable}>
                      <Table className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                      <Minus className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Link" active={editor.isActive("link")} onClick={() => {
                      const url = window.prompt("URL:");
                      if (url) editor.chain().focus().setLink({ href: url }).run();
                    }}>
                      <Link2 className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                  </div>
                )}

                {/* Editor */}
                <ScrollArea className="flex-1">
                  <div className="max-w-[800px] mx-auto">
                    <EditorContent editor={editor} />
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-2 border-t border-border/50 bg-background/40">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Hash className="w-3 h-3" />{wc.toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3" />{readingTime(wc)}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Auto-saved · {new Date(activeDoc.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Template dialog */}
        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[16px] font-semibold">Document Templates</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground -mt-1">Start from a structured template to accelerate your research writing.</p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {DOC_TEMPLATES.map(t => (
                <TemplateCard key={t.type + t.title} template={t} onClick={() => newFromTemplate(t)} />
              ))}
              <button
                onClick={() => { newDoc("free"); setShowTemplates(false); }}
                className="text-left p-4 rounded-xl border border-dashed border-border bg-transparent hover:border-accent/40 hover:bg-accent/5 transition-all flex items-center gap-3"
              >
                <Plus className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Blank Document</p>
                  <p className="text-[11px] text-muted-foreground">Start from scratch</p>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AppLayout>
  );
}
