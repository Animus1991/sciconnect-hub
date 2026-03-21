import { useState, useCallback, useRef, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Search, Grid, Pin, PinOff, Trash2, Copy, Download,
  MoreHorizontal, ChevronDown, ChevronUp, ChevronsUpDown, X,
  LayoutTemplate, FilePlus2, ArrowUpDown, Filter, SortAsc, SortDesc,
  Type, Hash, CalendarDays, CheckSquare, Link2, Percent,
} from "lucide-react";
import {
  WorkspaceSheet, SheetColumn, SheetRow, SheetType, CellType,
  SHEET_TYPE_META, SHEET_TEMPLATES,
  createBlankSheet, createFromSheetTemplate,
} from "@/data/workspaceMockData";
import { useSheetStorage } from "@/hooks/useWorkspaceStorage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  "High":         "bg-red-500/20 text-red-400 border-red-500/20",
  "Medium":       "bg-amber-500/20 text-amber-400 border-amber-500/20",
  "Low":          "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  "Done":         "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  "In Progress":  "bg-blue-500/20 text-blue-400 border-blue-500/20",
  "Not Started":  "bg-secondary text-muted-foreground border-border",
  "Blocked":      "bg-red-500/20 text-red-400 border-red-500/20",
  "Supported":    "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  "Testing":      "bg-violet-500/20 text-violet-400 border-violet-500/20",
};

const STATUS_OPTIONS = ["Not Started", "In Progress", "Done", "Blocked", "Testing", "High", "Medium", "Low", "Supported"];
const CELL_TYPE_ICONS: Record<CellType, React.ElementType> = {
  text: Type, number: Hash, date: CalendarDays, status: CheckSquare, url: Link2, percent: Percent,
};

function genId() { return Math.random().toString(36).slice(2, 11); }

function CellView({ value, type, editing, onChange, onCommit, onKeyDown }: {
  value: string; type: CellType; editing: boolean;
  onChange: (v: string) => void; onCommit: () => void; onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const ref = useRef<HTMLInputElement | HTMLSelectElement>(null);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  if (!editing) {
    if (type === "status") {
      const cls = STATUS_COLORS[value] ?? "bg-secondary text-muted-foreground border-border";
      return value
        ? <span className={cn("inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium border", cls)}>{value}</span>
        : <span className="text-muted-foreground/30 text-[11px]">—</span>;
    }
    if (type === "percent") {
      const pct = Math.min(100, Math.max(0, parseFloat(value) || 0));
      return (
        <div className="flex items-center gap-2 w-full min-w-[60px]">
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] text-muted-foreground w-8 text-right flex-shrink-0">{pct}%</span>
        </div>
      );
    }
    if (type === "url" && value) {
      return <a href={value} target="_blank" rel="noopener noreferrer" className="text-accent text-[12px] underline underline-offset-2 truncate">{value}</a>;
    }
    return <span className={cn("text-[12px] truncate", type === "number" ? "text-right font-mono" : "text-foreground", !value && "text-muted-foreground/30")}>{value || "—"}</span>;
  }

  if (type === "status") {
    return (
      <select
        ref={ref as React.Ref<HTMLSelectElement>}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onCommit}
        className="w-full h-full bg-accent/10 border-0 outline-none text-[12px] text-foreground rounded-sm px-1"
      >
        <option value="">—</option>
        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    );
  }

  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      type={type === "date" ? "date" : type === "number" || type === "percent" ? "number" : "text"}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={onKeyDown}
      className="w-full h-full bg-transparent outline-none text-[12px] text-foreground px-0"
    />
  );
}

function SheetListItem({ sheet, active, onSelect, onPin, onDuplicate, onDelete }: {
  sheet: WorkspaceSheet; active: boolean;
  onSelect: () => void; onPin: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const meta = SHEET_TYPE_META[sheet.type];
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col gap-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
        active ? "bg-accent/10 border border-accent/20" : "hover:bg-secondary/60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("text-[13px] font-medium leading-snug flex-1 min-w-0 truncate", active ? "text-accent" : "text-foreground")}>
          {sheet.pinned && <Pin className="inline w-3 h-3 mr-1 text-accent" />}{sheet.title}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-all" onClick={e => e.stopPropagation()}>
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={e => { e.stopPropagation(); onPin(); }}>
              {sheet.pinned ? <PinOff className="w-3.5 h-3.5 mr-2" /> : <Pin className="w-3.5 h-3.5 mr-2" />}
              {sheet.pinned ? "Unpin" : "Pin"}
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
        <span className="text-[10px] text-muted-foreground">{sheet.rows.length} rows</span>
        <span className="text-[10px] text-muted-foreground">·</span>
        <span className="text-[10px] text-muted-foreground truncate">{formatDistanceToNow(new Date(sheet.updatedAt), { addSuffix: true })}</span>
      </div>
    </div>
  );
}

function TemplateCard({ template, onClick }: { template: typeof SHEET_TEMPLATES[number]; onClick: () => void }) {
  const meta = SHEET_TYPE_META[template.type];
  return (
    <button onClick={onClick} className="text-left p-4 rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all">
      <div className="flex items-center gap-2 mb-1.5">
        <Grid className={cn("w-4 h-4", meta.color)} />
        <span className="text-[13px] font-semibold text-foreground">{template.title}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">{meta.description}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{template.columns.length} columns</p>
    </button>
  );
}

export default function Sheets() {
  const { sheets, upsertSheet, deleteSheet } = useSheetStorage();
  const [activeId, setActiveId] = useState<string | null>(sheets[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned">("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [pendingValue, setPendingValue] = useState("");
  const [sortCol, setSortCol] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [colNameDraft, setColNameDraft] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const activeSheet = sheets.find(s => s.id === activeId) ?? null;

  const patchSheet = useCallback((patch: Partial<WorkspaceSheet>) => {
    if (!activeSheet) return;
    upsertSheet({ ...activeSheet, ...patch, updatedAt: new Date().toISOString() });
  }, [activeSheet, upsertSheet]);

  const startEdit = useCallback((rowId: string, colId: string, currentValue: string) => {
    setEditingCell({ rowId, colId });
    setPendingValue(currentValue);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingCell || !activeSheet) { setEditingCell(null); return; }
    const rows = activeSheet.rows.map(r =>
      r.id === editingCell.rowId ? { ...r, cells: { ...r.cells, [editingCell.colId]: pendingValue } } : r
    );
    patchSheet({ rows });
    setEditingCell(null);
  }, [editingCell, activeSheet, pendingValue, patchSheet]);

  const cellKeyDown = useCallback((e: React.KeyboardEvent, rowId: string, colId: string) => {
    if (e.key === "Enter") { commitEdit(); }
    if (e.key === "Escape") { setEditingCell(null); }
    if (e.key === "Tab") {
      e.preventDefault();
      commitEdit();
      if (!activeSheet) return;
      const colIdx = activeSheet.columns.findIndex(c => c.id === colId);
      const rowIdx = activeSheet.rows.findIndex(r => r.id === rowId);
      const nextColIdx = colIdx + 1;
      if (nextColIdx < activeSheet.columns.length) {
        const nextCol = activeSheet.columns[nextColIdx];
        startEdit(rowId, nextCol.id, activeSheet.rows[rowIdx].cells[nextCol.id] ?? "");
      } else if (rowIdx + 1 < activeSheet.rows.length) {
        const nextRow = activeSheet.rows[rowIdx + 1];
        const firstCol = activeSheet.columns[0];
        startEdit(nextRow.id, firstCol.id, nextRow.cells[firstCol.id] ?? "");
      }
    }
  }, [commitEdit, activeSheet, startEdit]);

  const addRow = useCallback(() => {
    if (!activeSheet) return;
    const cells: Record<string, string> = {};
    activeSheet.columns.forEach(c => { cells[c.id] = ""; });
    patchSheet({ rows: [...activeSheet.rows, { id: genId(), cells }] });
  }, [activeSheet, patchSheet]);

  const deleteRow = useCallback((rowId: string) => {
    if (!activeSheet) return;
    patchSheet({ rows: activeSheet.rows.filter(r => r.id !== rowId) });
  }, [activeSheet, patchSheet]);

  const addColumn = useCallback((type: CellType = "text") => {
    if (!activeSheet) return;
    const newCol: SheetColumn = { id: genId(), name: "New Column", type, width: 160 };
    const rows = activeSheet.rows.map(r => ({ ...r, cells: { ...r.cells, [newCol.id]: "" } }));
    patchSheet({ columns: [...activeSheet.columns, newCol], rows });
  }, [activeSheet, patchSheet]);

  const deleteColumn = useCallback((colId: string) => {
    if (!activeSheet) return;
    patchSheet({
      columns: activeSheet.columns.filter(c => c.id !== colId),
      rows: activeSheet.rows.map(r => { const c = { ...r.cells }; delete c[colId]; return { ...r, cells: c }; }),
    });
  }, [activeSheet, patchSheet]);

  const renameColumn = useCallback((colId: string, name: string) => {
    if (!activeSheet) return;
    patchSheet({ columns: activeSheet.columns.map(c => c.id === colId ? { ...c, name } : c) });
    setEditingColId(null);
  }, [activeSheet, patchSheet]);

  const changeColType = useCallback((colId: string, type: CellType) => {
    if (!activeSheet) return;
    patchSheet({ columns: activeSheet.columns.map(c => c.id === colId ? { ...c, type } : c) });
  }, [activeSheet, patchSheet]);

  const sortRows = useCallback((colId: string) => {
    setSortCol(prev => {
      if (prev?.id === colId) return { id: colId, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { id: colId, dir: "asc" };
    });
  }, []);

  const newSheet = useCallback((type: SheetType = "free") => {
    const s = createBlankSheet(type);
    upsertSheet(s);
    setActiveId(s.id);
  }, [upsertSheet]);

  const fromTemplate = useCallback((t: typeof SHEET_TEMPLATES[number]) => {
    const s = createFromSheetTemplate(t);
    upsertSheet(s);
    setActiveId(s.id);
    setShowTemplates(false);
  }, [upsertSheet]);

  const duplicateSheet = useCallback((sheet: WorkspaceSheet) => {
    const clone: WorkspaceSheet = {
      ...sheet,
      id: genId(),
      title: sheet.title + " (copy)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      rows: sheet.rows.map(r => ({ ...r, id: genId() })),
      columns: sheet.columns.map(c => ({ ...c })),
    };
    upsertSheet(clone);
    setActiveId(clone.id);
  }, [upsertSheet]);

  const pinSheet = useCallback((sheet: WorkspaceSheet) => {
    upsertSheet({ ...sheet, pinned: !sheet.pinned, updatedAt: new Date().toISOString() });
  }, [upsertSheet]);

  const delSheet = useCallback((id: string) => {
    deleteSheet(id);
    const remaining = sheets.filter(s => s.id !== id);
    setActiveId(remaining[0]?.id ?? null);
    toast.success("Sheet deleted");
  }, [sheets, deleteSheet]);

  const exportCSV = useCallback(() => {
    if (!activeSheet) return;
    const header = activeSheet.columns.map(c => `"${c.name}"`).join(",");
    const rows = activeSheet.rows.map(r =>
      activeSheet.columns.map(c => `"${(r.cells[c.id] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = (activeSheet.title || "sheet") + ".csv";
    a.click(); URL.revokeObjectURL(url);
    toast.success("Exported as CSV");
  }, [activeSheet]);

  const displayRows = (() => {
    if (!activeSheet) return [];
    let rows = [...activeSheet.rows];
    if (filterQuery) {
      rows = rows.filter(r =>
        Object.values(r.cells).some(v => v.toLowerCase().includes(filterQuery.toLowerCase()))
      );
    }
    if (sortCol) {
      rows.sort((a, b) => {
        const av = a.cells[sortCol.id] ?? "";
        const bv = b.cells[sortCol.id] ?? "";
        const n = parseFloat(av) - parseFloat(bv);
        const cmp = isNaN(n) ? av.localeCompare(bv) : n;
        return sortCol.dir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  })();

  const filtered = sheets
    .filter(s => filter === "pinned" ? s.pinned : true)
    .filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <AppLayout>
      <TooltipProvider delayDuration={400}>
        <div className="flex h-[calc(100vh-56px)] overflow-hidden">

          {/* ── LEFT PANEL ── */}
          <div className="w-[260px] flex-shrink-0 border-r border-border flex flex-col bg-card/30">
            <div className="p-3 border-b border-border space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-foreground">Sheets</h2>
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
                    <DropdownMenuContent align="end" className="w-52">
                      {(Object.keys(SHEET_TYPE_META) as SheetType[]).map(t => (
                        <DropdownMenuItem key={t} onClick={() => newSheet(t)}>
                          <span className={cn("w-2 h-2 rounded-full mr-2 bg-current", SHEET_TYPE_META[t].color)} />
                          {SHEET_TYPE_META[t].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sheets…" className="h-7 pl-7 text-[12px]" />
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
                  <Grid className="w-8 h-8 text-muted-foreground/40 mb-3" />
                  <p className="text-[12px] text-muted-foreground">No sheets yet</p>
                  <Button size="sm" variant="ghost" className="mt-3 text-[11px] h-7" onClick={() => newSheet()}>
                    <Plus className="w-3 h-3 mr-1" />Create one
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map(s => (
                    <SheetListItem
                      key={s.id} sheet={s} active={s.id === activeId}
                      onSelect={() => setActiveId(s.id)}
                      onPin={() => pinSheet(s)}
                      onDuplicate={() => duplicateSheet(s)}
                      onDelete={() => delSheet(s.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground text-center">{sheets.length} sheet{sheets.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {!activeSheet ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Grid className="w-8 h-8 text-accent" />
                </div>
                <div className="text-center max-w-sm">
                  <h3 className="text-[18px] font-semibold text-foreground mb-1">Research Sheets</h3>
                  <p className="text-sm text-muted-foreground">Organize literature matrices, hypothesis trackers, milestone tables, and comparison grids — all inside the platform.</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => newSheet()} variant="default" className="gap-2">
                    <FilePlus2 className="w-4 h-4" />New Sheet
                  </Button>
                  <Button onClick={() => setShowTemplates(true)} variant="outline" className="gap-2">
                    <LayoutTemplate className="w-4 h-4" />Templates
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-xl mt-2">
                  {SHEET_TEMPLATES.slice(0, 4).map(t => (
                    <TemplateCard key={t.type} template={t} onClick={() => fromTemplate(t)} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Sheet header */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border/50">
                  <div className="flex-1 min-w-0">
                    {editingTitle ? (
                      <input
                        autoFocus
                        value={titleDraft}
                        onChange={e => setTitleDraft(e.target.value)}
                        onBlur={() => { patchSheet({ title: titleDraft.trim() || "Untitled Sheet" }); setEditingTitle(false); }}
                        onKeyDown={e => { if (e.key === "Enter") { patchSheet({ title: titleDraft.trim() || "Untitled Sheet" }); setEditingTitle(false); } }}
                        className="text-[18px] font-semibold bg-transparent outline-none text-foreground w-full"
                      />
                    ) : (
                      <h1
                        className="text-[18px] font-semibold text-foreground tracking-tight cursor-text"
                        onClick={() => { setTitleDraft(activeSheet.title); setEditingTitle(true); }}
                      >
                        {activeSheet.title}
                      </h1>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[11px] font-medium", SHEET_TYPE_META[activeSheet.type].color)}>
                        {SHEET_TYPE_META[activeSheet.type].label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground">{activeSheet.rows.length} rows · {activeSheet.columns.length} columns</span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground">Edited {formatDistanceToNow(new Date(activeSheet.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <Input value={filterQuery} onChange={e => setFilterQuery(e.target.value)} placeholder="Filter rows…" className="h-7 pl-7 w-36 text-[11px]" />
                      {filterQuery && (
                        <button onClick={() => setFilterQuery("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] gap-1" onClick={exportCSV}>
                      <Download className="w-3.5 h-3.5" />CSV
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => pinSheet(activeSheet)}>
                          {activeSheet.pinned ? <PinOff className="w-3.5 h-3.5 mr-2" /> : <Pin className="w-3.5 h-3.5 mr-2" />}
                          {activeSheet.pinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateSheet(activeSheet)}>
                          <Copy className="w-3.5 h-3.5 mr-2" />Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger><Plus className="w-3.5 h-3.5 mr-2" />Add column</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {(["text", "number", "date", "status", "url", "percent"] as CellType[]).map(t => {
                              const Icon = CELL_TYPE_ICONS[t];
                              return (
                                <DropdownMenuItem key={t} onClick={() => addColumn(t)}>
                                  <Icon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{t.charAt(0).toUpperCase() + t.slice(1)}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => delSheet(activeSheet.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" />Delete sheet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full border-collapse text-left select-none" style={{ tableLayout: "fixed", minWidth: activeSheet.columns.reduce((s, c) => s + c.width, 40) + "px" }}>
                    <colgroup>
                      <col style={{ width: 40 }} />
                      {activeSheet.columns.map(c => <col key={c.id} style={{ width: c.width }} />)}
                      <col style={{ width: 40 }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <th className="bg-card/90 border-b border-r border-border px-2 py-1.5 text-[10px] text-muted-foreground font-normal">#</th>
                        {activeSheet.columns.map(col => {
                          const Icon = CELL_TYPE_ICONS[col.type];
                          const sorted = sortCol?.id === col.id;
                          return (
                            <th key={col.id} className="bg-card/90 border-b border-r border-border px-0 py-0 text-left">
                              <div className="flex items-center gap-1 group">
                                {editingColId === col.id ? (
                                  <input
                                    autoFocus
                                    value={colNameDraft}
                                    onChange={e => setColNameDraft(e.target.value)}
                                    onBlur={() => renameColumn(col.id, colNameDraft)}
                                    onKeyDown={e => { if (e.key === "Enter") renameColumn(col.id, colNameDraft); if (e.key === "Escape") setEditingColId(null); }}
                                    className="flex-1 bg-transparent outline-none text-[11px] font-medium text-foreground px-2 py-1.5 min-w-0"
                                  />
                                ) : (
                                  <button
                                    className="flex-1 flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors min-w-0"
                                    onClick={() => sortRows(col.id)}
                                    onDoubleClick={() => { setEditingColId(col.id); setColNameDraft(col.name); }}
                                  >
                                    <Icon className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{col.name}</span>
                                    {sorted ? (sortCol?.dir === "asc" ? <SortAsc className="w-3 h-3 ml-auto flex-shrink-0 text-accent" /> : <SortDesc className="w-3 h-3 ml-auto flex-shrink-0 text-accent" />) : <ChevronsUpDown className="w-3 h-3 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-50" />}
                                  </button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="px-1 py-1.5 opacity-0 group-hover:opacity-70 hover:opacity-100 hover:text-foreground text-muted-foreground transition-all">
                                      <ChevronDown className="w-3 h-3" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" className="w-48">
                                    <DropdownMenuItem onClick={() => { setEditingColId(col.id); setColNameDraft(col.name); }}>
                                      <Type className="w-3.5 h-3.5 mr-2" />Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger><ArrowUpDown className="w-3.5 h-3.5 mr-2" />Change type</DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent>
                                        {(["text", "number", "date", "status", "url", "percent"] as CellType[]).map(t => {
                                          const TIcon = CELL_TYPE_ICONS[t];
                                          return (
                                            <DropdownMenuItem key={t} onClick={() => changeColType(col.id, t)}>
                                              <TIcon className="w-3.5 h-3.5 mr-2" />{t.charAt(0).toUpperCase() + t.slice(1)}
                                            </DropdownMenuItem>
                                          );
                                        })}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onClick={() => deleteColumn(col.id)}>
                                      <Trash2 className="w-3.5 h-3.5 mr-2" />Delete column
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </th>
                          );
                        })}
                        <th className="bg-card/90 border-b border-border px-0 py-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="w-full h-full flex items-center justify-center px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44">
                              {(["text", "number", "date", "status", "url", "percent"] as CellType[]).map(t => {
                                const Icon = CELL_TYPE_ICONS[t];
                                return (
                                  <DropdownMenuItem key={t} onClick={() => addColumn(t)}>
                                    <Icon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{t.charAt(0).toUpperCase() + t.slice(1)} column
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map((row, rowIdx) => (
                        <tr key={row.id} className="group hover:bg-secondary/20 transition-colors">
                          <td className="border-b border-r border-border/50 px-2 py-1 text-[10px] text-muted-foreground/50 text-center font-mono">
                            <div className="flex items-center justify-center gap-0.5">
                              <span className="group-hover:hidden">{rowIdx + 1}</span>
                              <button className="hidden group-hover:flex text-muted-foreground hover:text-destructive transition-colors" onClick={() => deleteRow(row.id)}>
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          {activeSheet.columns.map(col => {
                            const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id;
                            const val = row.cells[col.id] ?? "";
                            return (
                              <td
                                key={col.id}
                                className={cn(
                                  "border-b border-r border-border/50 px-2 py-1.5 cursor-cell transition-colors",
                                  isEditing ? "bg-accent/10 outline outline-1 outline-accent" : "hover:bg-secondary/30"
                                )}
                                onClick={() => !isEditing && startEdit(row.id, col.id, val)}
                              >
                                <CellView
                                  value={isEditing ? pendingValue : val}
                                  type={col.type}
                                  editing={isEditing}
                                  onChange={setPendingValue}
                                  onCommit={commitEdit}
                                  onKeyDown={e => cellKeyDown(e, row.id, col.id)}
                                />
                              </td>
                            );
                          })}
                          <td className="border-b border-border/50" />
                        </tr>
                      ))}
                      <tr>
                        <td className="border-b border-r border-border/30 px-2 py-1" />
                        <td colSpan={activeSheet.columns.length} className="border-b border-border/30">
                          <button
                            onClick={addRow}
                            className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors w-full"
                          >
                            <Plus className="w-3 h-3" />Add row
                          </button>
                        </td>
                        <td className="border-b border-border/30" />
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-2 border-t border-border/50 bg-background/40">
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-muted-foreground">{displayRows.length} of {activeSheet.rows.length} rows</span>
                    {filterQuery && <span className="text-[11px] text-accent">Filtered</span>}
                    {sortCol && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        Sorted by {activeSheet.columns.find(c => c.id === sortCol.id)?.name}
                        <button onClick={() => setSortCol(null)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Click cell to edit · Tab to move · Enter to confirm
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Templates dialog */}
        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[16px] font-semibold">Sheet Templates</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground -mt-1">Start from a research-optimized template to organize your structured data.</p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {SHEET_TEMPLATES.map(t => (
                <TemplateCard key={t.type + t.title} template={t} onClick={() => fromTemplate(t)} />
              ))}
              <button
                onClick={() => { newSheet("free"); setShowTemplates(false); }}
                className="text-left p-4 rounded-xl border border-dashed border-border hover:border-accent/40 hover:bg-accent/5 transition-all flex items-center gap-3"
              >
                <Plus className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Blank Sheet</p>
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
