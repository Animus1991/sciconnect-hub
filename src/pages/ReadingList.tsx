import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkPlus, BookOpen, Clock, Folder, Plus, MoreVertical, CheckCircle2,
  Star, Tag, ExternalLink, Search, ChevronDown, ChevronRight, Filter,
  ArrowUpDown, Highlighter, Quote, Calendar, FileText, Trash2, Share2,
  Copy, GripVertical, Eye, SortAsc, SortDesc, BarChart3, Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useMemo, useCallback } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────

interface ReadingCollection {
  id: string;
  name: string;
  papers: number;
  read: number;
  lastUpdated: string;
  tags: string[];
  shared: boolean;
  color: string;
}

interface Paper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  date: string;
  readStatus: "unread" | "reading" | "read";
  priority: "high" | "medium" | "low";
  notes: number;
  abstract: string;
  doi: string;
  readingTimeMin: number;
  collection: string;
  addedDate: string;
  starred: boolean;
}

interface Highlight {
  id: string;
  text: string;
  paperTitle: string;
  page: number;
  color: "yellow" | "blue" | "green" | "pink";
  createdAt: string;
  note?: string;
}

const collections: ReadingCollection[] = [
  { id: "c1", name: "Transformer Architectures Deep Dive", papers: 24, read: 18, lastUpdated: "2h ago", tags: ["Deep Learning", "NLP"], shared: true, color: "hsl(var(--info))" },
  { id: "c2", name: "CRISPR Advances 2025-2026", papers: 15, read: 9, lastUpdated: "1d ago", tags: ["Gene Editing", "Biology"], shared: false, color: "hsl(var(--success))" },
  { id: "c3", name: "Quantum Error Correction Survey", papers: 31, read: 12, lastUpdated: "3d ago", tags: ["Quantum Computing", "Physics"], shared: true, color: "hsl(var(--highlight))" },
  { id: "c4", name: "Grant Proposal References", papers: 42, read: 42, lastUpdated: "1w ago", tags: ["Mixed", "Grant"], shared: false, color: "hsl(var(--gold))" },
];

const initialPapers: Paper[] = [
  { id: "p1", title: "Foundation Models for Scientific Discovery: A Survey", authors: "Dr. Wei Zhang, Prof. Sarah Liu, Dr. James Park", journal: "Nature Reviews Methods Primers", date: "Feb 2026", readStatus: "unread", priority: "high", notes: 2, abstract: "We provide a comprehensive survey of foundation models applied to scientific discovery, covering molecular design, protein folding, climate modeling, and materials science. Our analysis reveals that transfer learning from large-scale pre-training significantly accelerates hypothesis generation.", doi: "10.1038/s43586-026-0012-3", readingTimeMin: 45, collection: "c1", addedDate: "2d ago", starred: true },
  { id: "p2", title: "Self-Supervised Learning in Medical Imaging: Progress and Future", authors: "Prof. Ana Cardoso, Dr. Michael Torres", journal: "The Lancet Digital Health", date: "Jan 2026", readStatus: "reading", priority: "medium", notes: 5, abstract: "This review examines self-supervised learning techniques for medical image analysis, including contrastive learning, masked autoencoders, and vision transformers adapted for radiology, pathology, and dermatology applications.", doi: "10.1016/S2589-7500(26)00042-7", readingTimeMin: 35, collection: "c1", addedDate: "5d ago", starred: false },
  { id: "p3", title: "Probabilistic Programming for Bayesian Deep Learning", authors: "Dr. Marcus Kim, Dr. Julia Fischer", journal: "JMLR", date: "Mar 2026", readStatus: "read", priority: "low", notes: 0, abstract: "We present a unified probabilistic programming framework that enables seamless specification and inference of Bayesian deep learning models, with automatic differentiation variational inference and Hamiltonian Monte Carlo support.", doi: "10.5555/3546258.3546312", readingTimeMin: 60, collection: "c1", addedDate: "1w ago", starred: false },
  { id: "p4", title: "Ocean Carbon Sequestration: New Mechanisms and Global Implications", authors: "Dr. Elena Volkov, Prof. Kenji Tanaka, Dr. Maria Santos", journal: "Science", date: "Feb 2026", readStatus: "unread", priority: "medium", notes: 1, abstract: "We identify novel biological and chemical mechanisms for deep-ocean carbon sequestration using isotopic tracing and autonomous underwater vehicle surveys across the Pacific and Atlantic basins.", doi: "10.1126/science.adj9821", readingTimeMin: 30, collection: "c2", addedDate: "3d ago", starred: true },
  { id: "p5", title: "Topological Quantum Error Correction with Surface Codes", authors: "Dr. Aisha Patel, Prof. Robert Müller", journal: "Physical Review X", date: "Mar 2026", readStatus: "unread", priority: "high", notes: 0, abstract: "We demonstrate a fault-tolerant quantum error correction protocol using surface codes on a 72-qubit superconducting processor, achieving logical error rates below the threshold for practical quantum computation.", doi: "10.1103/PhysRevX.16.011023", readingTimeMin: 55, collection: "c3", addedDate: "1d ago", starred: false },
  { id: "p6", title: "CRISPR-Cas13 for Programmable RNA Editing in Human Cells", authors: "Prof. Lin Chen, Dr. David Okonkwo", journal: "Cell", date: "Jan 2026", readStatus: "reading", priority: "high", notes: 3, abstract: "We engineer an optimized CRISPR-Cas13 system for precise, reversible RNA editing in primary human cells with minimal off-target effects, enabling therapeutic modulation of gene expression without permanent genomic modification.", doi: "10.1016/j.cell.2026.01.015", readingTimeMin: 40, collection: "c2", addedDate: "4d ago", starred: true },
];

const initialHighlights: Highlight[] = [
  { id: "h1", text: "Transfer learning from large-scale pre-training significantly accelerates hypothesis generation across all surveyed scientific domains.", paperTitle: "Foundation Models for Scientific Discovery: A Survey", page: 12, color: "yellow", createdAt: "2d ago", note: "Key finding — relevant to our grant proposal" },
  { id: "h2", text: "Contrastive learning approaches outperform supervised baselines when labeled data constitutes less than 5% of the training set.", paperTitle: "Self-Supervised Learning in Medical Imaging", page: 8, color: "blue", createdAt: "5d ago" },
  { id: "h3", text: "Logical error rates of 10⁻⁶ per round were achieved with a distance-5 surface code, representing a 100x improvement over previous demonstrations.", paperTitle: "Topological Quantum Error Correction with Surface Codes", page: 4, color: "green", createdAt: "1d ago", note: "Breakthrough result — share with quantum team" },
  { id: "h4", text: "The engineered Cas13 variant exhibits >95% on-target editing efficiency with <0.1% transcriptome-wide off-target effects.", paperTitle: "CRISPR-Cas13 for Programmable RNA Editing", page: 6, color: "pink", createdAt: "4d ago" },
];

// ── Config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; icon: typeof BookOpen; className: string; dotClass: string }> = {
  unread: { label: "Unread", icon: Clock, className: "bg-muted text-muted-foreground border-border", dotClass: "bg-muted-foreground" },
  reading: { label: "Reading", icon: BookOpen, className: "bg-info/10 text-info border-info/20", dotClass: "bg-info" },
  read: { label: "Read", icon: CheckCircle2, className: "bg-success/10 text-success border-success/20", dotClass: "bg-success" },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  high: { label: "High", className: "text-destructive" },
  medium: { label: "Medium", className: "text-warning" },
  low: { label: "Low", className: "text-muted-foreground" },
};

const highlightColors: Record<string, string> = {
  yellow: "border-l-[hsl(var(--gold))] bg-[hsl(var(--gold-muted))]",
  blue: "border-l-[hsl(var(--info))] bg-[hsl(var(--info-muted))]",
  green: "border-l-[hsl(var(--success))] bg-[hsl(var(--success-muted))]",
  pink: "border-l-[hsl(var(--highlight))] bg-[hsl(var(--highlight-muted))]",
};

const statusCycle: Record<string, "unread" | "reading" | "read"> = { unread: "reading", reading: "read", read: "unread" };

type SortKey = "added" | "title" | "priority" | "readingTime";
type StatusFilter = "all" | "unread" | "reading" | "read";
type ViewTab = "papers" | "collections" | "highlights";

// ── Component ─────────────────────────────────────────────────────────────────

const ReadingList = () => {
  const [papers, setPapers] = useState(initialPapers);
  const [highlights] = useState(initialHighlights);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("added");
  const [sortAsc, setSortAsc] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("papers");
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);

  const cycleStatus = useCallback((id: string) => {
    setPapers(prev => prev.map(p =>
      p.id === id ? { ...p, readStatus: statusCycle[p.readStatus] } : p
    ));
  }, []);

  const toggleStar = useCallback((id: string) => {
    setPapers(prev => prev.map(p =>
      p.id === id ? { ...p, starred: !p.starred } : p
    ));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedPaper(prev => prev === id ? null : id);
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortAsc(prev => !prev);
    else { setSortKey(key); setSortAsc(false); }
  }, [sortKey]);

  // ── Derived data ──

  const stats = useMemo(() => ({
    total: papers.length,
    unread: papers.filter(p => p.readStatus === "unread").length,
    reading: papers.filter(p => p.readStatus === "reading").length,
    read: papers.filter(p => p.readStatus === "read").length,
    totalReadingTime: papers.filter(p => p.readStatus !== "read").reduce((s, p) => s + p.readingTimeMin, 0),
    highlights: highlights.length,
  }), [papers, highlights]);

  const filteredPapers = useMemo(() => {
    let result = [...papers];
    if (statusFilter !== "all") result = result.filter(p => p.readStatus === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q) ||
        p.doi.toLowerCase().includes(q)
      );
    }
    // Starred first, then sort
    result.sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      const dir = sortAsc ? 1 : -1;
      switch (sortKey) {
        case "title": return dir * a.title.localeCompare(b.title);
        case "priority": {
          const order = { high: 0, medium: 1, low: 2 };
          return dir * (order[a.priority] - order[b.priority]);
        }
        case "readingTime": return dir * (a.readingTimeMin - b.readingTimeMin);
        default: return 0; // added order preserved
      }
    });
    return result;
  }, [papers, statusFilter, search, sortKey, sortAsc]);

  // ── Render ──

  return (
    <AppLayout>
      <TooltipProvider delayDuration={300}>
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Reading List</h1>
                <p className="text-sm text-muted-foreground font-display mt-0.5">
                  {stats.total} papers · {stats.totalReadingTime} min remaining · {stats.highlights} highlights
                </p>
              </div>
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-display font-semibold hover:bg-accent/90 transition-colors">
                <Plus className="w-4 h-4" /> Add Paper
              </button>
            </div>
          </motion.div>

          {/* Compact Stats Strip */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border mb-5 overflow-x-auto"
          >
            {[
              { key: "all" as StatusFilter, label: "All", count: stats.total, dot: "bg-foreground" },
              { key: "unread" as StatusFilter, label: "Unread", count: stats.unread, dot: "bg-muted-foreground" },
              { key: "reading" as StatusFilter, label: "Reading", count: stats.reading, dot: "bg-info" },
              { key: "read" as StatusFilter, label: "Read", count: stats.read, dot: "bg-success" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => { setStatusFilter(f.key); setActiveTab("papers"); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-display font-medium transition-colors whitespace-nowrap ${
                  statusFilter === f.key && activeTab === "papers"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${f.dot}`} />
                {f.label}
                <span className="text-[10px] text-muted-foreground">{f.count}</span>
              </button>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            <button
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-display font-medium transition-colors whitespace-nowrap ${
                activeTab === "collections" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Folder className="w-3 h-3" />
              Collections
              <span className="text-[10px] text-muted-foreground">{collections.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("highlights")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-display font-medium transition-colors whitespace-nowrap ${
                activeTab === "highlights" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Highlighter className="w-3 h-3" />
              Highlights
              <span className="text-[10px] text-muted-foreground">{stats.highlights}</span>
            </button>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
            {/* Main Content */}
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                {/* ═══ PAPERS TAB ═══ */}
                {activeTab === "papers" && (
                  <motion.div key="papers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    {/* Search + Sort Bar */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search title, author, journal, DOI..."
                          className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-display text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                            <ArrowUpDown className="w-3 h-3" />
                            Sort
                            {sortAsc ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {([
                            ["added", "Date Added"],
                            ["title", "Title"],
                            ["priority", "Priority"],
                            ["readingTime", "Reading Time"],
                          ] as [SortKey, string][]).map(([key, label]) => (
                            <DropdownMenuItem key={key} onClick={() => handleSort(key)} className="text-xs font-display">
                              {label} {sortKey === key && (sortAsc ? "↑" : "↓")}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Paper List */}
                    <div className="space-y-2">
                      {filteredPapers.length === 0 ? (
                        <div className="text-center py-16">
                          <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                          <p className="text-sm text-muted-foreground font-display">No papers match your filters</p>
                        </div>
                      ) : (
                        filteredPapers.map((paper, i) => {
                          const st = statusConfig[paper.readStatus];
                          const pr = priorityConfig[paper.priority];
                          const isExpanded = expandedPaper === paper.id;

                          return (
                            <motion.div
                              key={paper.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="bg-card rounded-xl border border-border hover:border-accent/20 transition-colors group"
                            >
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  {/* Status dot + expand */}
                                  <div className="flex flex-col items-center gap-1.5 pt-0.5">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button onClick={() => cycleStatus(paper.id)} className="group/dot">
                                          <span className={`block w-3 h-3 rounded-full ${st.dotClass} ring-2 ring-transparent group-hover/dot:ring-accent/30 transition-all`} />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="left" className="text-xs">
                                        Click: {st.label} → {statusConfig[statusCycle[paper.readStatus]].label}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="outline" className={`text-[10px] font-display px-1.5 py-0 h-5 ${st.className}`}>
                                            {st.label}
                                          </Badge>
                                          {paper.priority === "high" && (
                                            <span className={`text-[10px] font-display font-medium ${pr.className}`}>● High</span>
                                          )}
                                          {paper.starred && (
                                            <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                                          )}
                                        </div>

                                        <button onClick={() => toggleExpand(paper.id)} className="text-left w-full">
                                          <h3 className="font-serif text-[15px] font-semibold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                                            {paper.title}
                                          </h3>
                                        </button>

                                        <p className="text-xs text-muted-foreground font-display mt-1 line-clamp-1">{paper.authors}</p>

                                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground font-display flex-wrap">
                                          <span className="font-medium">{paper.journal}</span>
                                          <span className="text-border">·</span>
                                          <span>{paper.date}</span>
                                          <span className="text-border">·</span>
                                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{paper.readingTimeMin}m</span>
                                          {paper.notes > 0 && (
                                            <>
                                              <span className="text-border">·</span>
                                              <span className="flex items-center gap-0.5"><Tag className="w-3 h-3" />{paper.notes}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-1 shrink-0">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button onClick={() => toggleStar(paper.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                                              <Star className={`w-3.5 h-3.5 ${paper.starred ? "text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" : "text-muted-foreground"}`} />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="text-xs">{paper.starred ? "Unstar" : "Star"}</TooltipContent>
                                        </Tooltip>

                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
                                              <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem className="text-xs font-display gap-2"><ExternalLink className="w-3 h-3" /> Open Paper</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs font-display gap-2"><Copy className="w-3 h-3" /> Copy DOI</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs font-display gap-2"><Share2 className="w-3 h-3" /> Share</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs font-display gap-2"><Folder className="w-3 h-3" /> Move to…</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-xs font-display gap-2 text-destructive"><Trash2 className="w-3 h-3" /> Remove</DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Expandable Abstract */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 pt-0 ml-6 border-t border-border">
                                      <p className="text-xs text-muted-foreground font-display leading-relaxed pt-3">
                                        {paper.abstract}
                                      </p>
                                      <div className="flex items-center gap-3 mt-2 pt-2 text-[10px] text-muted-foreground font-mono">
                                        <span>DOI: {paper.doi}</span>
                                        <span>·</span>
                                        <span>Added {paper.addedDate}</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ═══ COLLECTIONS TAB ═══ */}
                {activeTab === "collections" && (
                  <motion.div key="collections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-muted-foreground font-display">{collections.length} collections</p>
                      <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-display text-muted-foreground hover:text-foreground transition-colors">
                        <Plus className="w-3 h-3" /> New Collection
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {collections.map((col, i) => {
                        const pct = Math.round((col.read / col.papers) * 100);
                        return (
                          <motion.div
                            key={col.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-card rounded-xl border border-border p-4 hover:border-accent/20 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${col.color}15` }}>
                                <Folder className="w-4 h-4" style={{ color: col.color }} />
                              </div>
                              <div className="flex items-center gap-1.5">
                                {col.shared && (
                                  <Badge variant="outline" className="text-[9px] font-display px-1.5 py-0 h-4">Shared</Badge>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
                                      <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-36">
                                    <DropdownMenuItem className="text-xs font-display gap-2"><FileText className="w-3 h-3" /> Open</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs font-display gap-2"><Share2 className="w-3 h-3" /> Share</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-xs font-display gap-2 text-destructive"><Trash2 className="w-3 h-3" /> Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <h3 className="font-display text-sm font-semibold text-foreground mb-1.5 group-hover:text-accent transition-colors line-clamp-1">
                              {col.name}
                            </h3>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {col.tags.map(t => (
                                <span key={t} className="text-[10px] font-display text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">{t}</span>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1 flex-1" />
                              <span className="text-[10px] text-muted-foreground font-display font-medium w-16 text-right">
                                {col.read}/{col.papers} read
                              </span>
                            </div>

                            <p className="text-[10px] text-muted-foreground font-display mt-2">Updated {col.lastUpdated}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ═══ HIGHLIGHTS TAB ═══ */}
                {activeTab === "highlights" && (
                  <motion.div key="highlights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <p className="text-xs text-muted-foreground font-display mb-4">{highlights.length} highlights across your papers</p>
                    <div className="space-y-2">
                      {highlights.map((h, i) => (
                        <motion.div
                          key={h.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`rounded-xl border border-border p-4 border-l-4 ${highlightColors[h.color]}`}
                        >
                          <div className="flex items-start gap-3">
                            <Quote className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground font-display leading-relaxed italic">
                                "{h.text}"
                              </p>
                              {h.note && (
                                <p className="text-xs text-muted-foreground font-display mt-2 pl-3 border-l-2 border-border">
                                  {h.note}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground font-display">
                                <span className="font-medium">{h.paperTitle}</span>
                                <span>·</span>
                                <span>p. {h.page}</span>
                                <span>·</span>
                                <span>{h.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══ SIDEBAR ═══ */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Reading Queue */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-accent" /> Up Next
                </h3>
                <div className="space-y-2.5">
                  {papers.filter(p => p.readStatus === "unread" && p.priority === "high").slice(0, 3).map(p => (
                    <div key={p.id} className="group cursor-pointer">
                      <p className="text-xs font-display font-medium text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-display mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {p.readingTimeMin}m · {p.journal}
                      </p>
                    </div>
                  ))}
                  {papers.filter(p => p.readStatus === "unread" && p.priority === "high").length === 0 && (
                    <p className="text-[11px] text-muted-foreground font-display">No high-priority unread papers</p>
                  )}
                </div>
              </div>

              {/* Weekly Goal */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-accent" /> Weekly Goal
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={60} className="h-2 flex-1" />
                  <span className="text-xs font-display font-semibold text-foreground">3/5</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-display">Papers read this week — 2 more to reach your goal</p>
              </div>

              {/* Recently Completed */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Recently Read
                </h3>
                <div className="space-y-2.5">
                  {papers.filter(p => p.readStatus === "read").slice(0, 2).map(p => (
                    <div key={p.id} className="group cursor-pointer">
                      <p className="text-xs font-display font-medium text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-display mt-0.5">{p.journal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">
                  Reading Stats
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Avg. reading time", value: `${Math.round(papers.reduce((s, p) => s + p.readingTimeMin, 0) / papers.length)}m` },
                    { label: "Notes written", value: String(papers.reduce((s, p) => s + p.notes, 0)) },
                    { label: "Collections", value: String(collections.length) },
                    { label: "Completion rate", value: `${Math.round((stats.read / stats.total) * 100)}%` },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-display">{s.label}</span>
                      <span className="text-xs font-display font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default ReadingList;
