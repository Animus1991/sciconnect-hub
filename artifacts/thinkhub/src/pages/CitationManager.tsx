import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, Download, Upload, Copy, Star, Folder, Tag,
  ExternalLink, FileText, BarChart3, ChevronDown, MoreVertical, Trash2,
  Share2, Edit3, ArrowUpDown, SortAsc, SortDesc, TrendingUp, Link2,
  CheckSquare, X, Bookmark, Globe, GraduationCap, Mic, Database, File
} from "lucide-react";
import { BlockchainVerificationBadge } from "@/components/blockchain/BlockchainVerificationBadge";
import { mockHash } from "@/lib/blockchain-utils";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

type CitationType = "article" | "book" | "conference" | "preprint" | "thesis" | "dataset";
type SortKey = "cited" | "year" | "added" | "title";
type FilterView = "all" | "starred" | string; // string = collection id

interface Citation {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  volume?: string;
  pages?: string;
  doi: string;
  type: CitationType;
  abstract: string;
  tags: string[];
  collections: string[];
  notes: string;
  starred: boolean;
  dateAdded: string;
  citedBy: number;
  pdfAvailable: boolean;
}

interface Collection {
  id: string;
  name: string;
  color: string;
  count: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const typeConfig: Record<CitationType, { label: string; icon: typeof FileText; color: string }> = {
  article:    { label: "Article",    icon: FileText,       color: "hsl(var(--info))" },
  book:       { label: "Book",       icon: BookOpen,       color: "hsl(var(--gold))" },
  conference: { label: "Conference", icon: Mic,            color: "hsl(var(--highlight))" },
  preprint:   { label: "Preprint",   icon: File,           color: "hsl(var(--warning))" },
  thesis:     { label: "Thesis",     icon: GraduationCap,  color: "hsl(var(--success))" },
  dataset:    { label: "Dataset",    icon: Database,       color: "hsl(var(--accent))" },
};

const collections: Collection[] = [
  { id: "col-1", name: "Quantum Error Correction", color: "hsl(var(--highlight))", count: 24 },
  { id: "col-2", name: "Federated Learning", color: "hsl(var(--info))", count: 18 },
  { id: "col-3", name: "CRISPR Therapeutics", color: "hsl(var(--success))", count: 31 },
  { id: "col-4", name: "Climate Modeling", color: "hsl(var(--gold))", count: 12 },
  { id: "col-5", name: "Neuromorphic Computing", color: "hsl(var(--destructive))", count: 9 },
];

const citations: Citation[] = [
  {
    id: "cit-001", title: "Suppressing quantum errors by scaling a surface code logical qubit",
    authors: ["Acharya, R.", "Aleiner, I.", "Allen, R.", "et al. (Google Quantum AI)"],
    journal: "Nature", year: 2023, volume: "614", pages: "676-681",
    doi: "10.1038/s41586-022-05434-1", type: "article",
    abstract: "Practical quantum computing will require error rates well below those achievable with physical qubits. Quantum error correction offers a path to exponentially reduce error rates, but requires enormous physical qubit overhead.",
    tags: ["quantum computing", "error correction", "surface codes"], collections: ["col-1"],
    notes: "Key reference for our surface code braiding approach.", starred: true,
    dateAdded: "Mar 2025", citedBy: 1247, pdfAvailable: true,
  },
  {
    id: "cit-002", title: "Communication-Efficient Learning of Deep Networks from Decentralized Data",
    authors: ["McMahan, B.", "Moore, E.", "Ramage, D.", "Hampson, S."],
    journal: "AISTATS", year: 2017, volume: "", pages: "",
    doi: "10.48550/arXiv.1602.05629", type: "conference",
    abstract: "Modern mobile devices have access to a wealth of data suitable for learning models. We introduce the Federated Averaging algorithm which combines local SGD on each client with server-side model averaging.",
    tags: ["federated learning", "deep learning", "privacy"], collections: ["col-2"],
    notes: "Foundational FedAvg paper. Compare our convergence rates.", starred: true,
    dateAdded: "Jan 2025", citedBy: 8934, pdfAvailable: true,
  },
  {
    id: "cit-003", title: "CRISPR-Cas13 for RNA editing and diagnostics",
    authors: ["Abudayyeh, O.O.", "Gootenberg, J.S.", "Konermann, S."],
    journal: "Nature Methods", year: 2019, volume: "16", pages: "887-893",
    doi: "10.1038/s41592-019-0538-3", type: "article",
    abstract: "Cas13 enzymes are RNA-guided RNA-targeting CRISPR effectors that enable programmable RNA knockdown and editing for both fundamental research and therapeutic applications.",
    tags: ["CRISPR", "Cas13", "RNA editing", "diagnostics"], collections: ["col-3"],
    notes: "Core methodology reference for off-target study.", starred: false,
    dateAdded: "Apr 2025", citedBy: 2156, pdfAvailable: true,
  },
  {
    id: "cit-004", title: "Permafrost carbon feedback to climate change",
    authors: ["Schuur, E.A.G.", "McGuire, A.D.", "Schädel, C."],
    journal: "Nature", year: 2015, volume: "520", pages: "171-179",
    doi: "10.1038/nature14338", type: "article",
    abstract: "Large quantities of organic carbon are stored in frozen Arctic soils. As the climate warms, this carbon may be released as CO₂ and CH₄, creating a positive feedback to climate change.",
    tags: ["permafrost", "carbon cycle", "climate change"], collections: ["col-4"],
    notes: "", starred: false,
    dateAdded: "Jun 2025", citedBy: 3421, pdfAvailable: false,
  },
  {
    id: "cit-005", title: "Attention Is All You Need",
    authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N.", "Uszkoreit, J.", "Jones, L.", "Gomez, A.N."],
    journal: "NeurIPS", year: 2017, volume: "", pages: "",
    doi: "10.48550/arXiv.1706.03762", type: "conference",
    abstract: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    tags: ["transformers", "attention", "NLP", "deep learning"], collections: ["col-2", "col-5"],
    notes: "Foundation for all transformer-based approaches in our work.", starred: true,
    dateAdded: "Dec 2024", citedBy: 92456, pdfAvailable: true,
  },
  {
    id: "cit-006", title: "Neuromorphic computing with memristive devices",
    authors: ["Zidan, M.A.", "Strachan, J.P.", "Lu, W.D."],
    journal: "Nature Electronics", year: 2018, volume: "1", pages: "22-29",
    doi: "10.1038/s41928-017-0006-8", type: "article",
    abstract: "Neuromorphic computing systems aim to emulate the neural structure of the biological brain using memristive crossbar arrays for in-memory computation.",
    tags: ["neuromorphic", "memristors", "brain-inspired computing"], collections: ["col-5"],
    notes: "", starred: false,
    dateAdded: "Aug 2025", citedBy: 876, pdfAvailable: true,
  },
  {
    id: "cit-007", title: "Deep Learning for Protein Structure Prediction",
    authors: ["Jumper, J.", "Evans, R.", "Pritzel, A.", "et al."],
    journal: "Nature", year: 2021, volume: "596", pages: "583-589",
    doi: "10.1038/s41586-021-03819-2", type: "article",
    abstract: "AlphaFold2 achieves accuracy competitive with experiment in the majority of cases using a novel machine learning approach for protein structure determination.",
    tags: ["protein folding", "AlphaFold", "structural biology"], collections: ["col-3"],
    notes: "Relevant for our drug discovery pipeline.", starred: false,
    dateAdded: "Feb 2025", citedBy: 18420, pdfAvailable: true,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CitationManager() {
  const [search, setSearch] = useState("");
  const [filterView, setFilterView] = useState<FilterView>("all");
  const [sortKey, setSortKey] = useState<SortKey>("cited");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(
    new Set(citations.filter(c => c.starred).map(c => c.id))
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);

  const toggleExpand = useCallback((id: string) => setExpandedId(p => p === id ? null : id), []);
  const toggleStar = useCallback((id: string) => {
    setStarredIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);
  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  }, [sortKey]);

  const copyDoi = useCallback((doi: string) => {
    navigator.clipboard.writeText(doi);
    toast.success("DOI copied to clipboard");
  }, []);

  const handleExport = useCallback(() => {
    const count = selectedIds.size || citations.length;
    toast.success(`Exported ${count} citations as BibTeX`);
    setSelectedIds(new Set());
  }, [selectedIds]);

  // ── Derived ──

  const totalCitedBy = citations.reduce((s, c) => s + c.citedBy, 0);

  const filtered = useMemo(() => {
    let result = [...citations];
    if (filterView === "starred") result = result.filter(c => starredIds.has(c.id));
    else if (filterView !== "all") result = result.filter(c => c.collections.includes(filterView));

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.authors.some(a => a.toLowerCase().includes(q)) ||
        c.journal.toLowerCase().includes(q) ||
        c.doi.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    const dir = sortAsc ? 1 : -1;
    result.sort((a, b) => {
      const sa = starredIds.has(a.id) ? 0 : 1;
      const sb = starredIds.has(b.id) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      switch (sortKey) {
        case "cited": return dir * (a.citedBy - b.citedBy);
        case "year": return dir * (a.year - b.year);
        case "title": return dir * a.title.localeCompare(b.title);
        default: return 0;
      }
    });
    return result;
  }, [filterView, search, sortKey, sortAsc, starredIds]);

  // Top cited for sidebar
  const topCited = useMemo(() =>
    [...citations].sort((a, b) => b.citedBy - a.citedBy).slice(0, 4),
  []);

  // Type breakdown
  const typeBreakdown = useMemo(() => {
    const map = new Map<CitationType, number>();
    citations.forEach(c => map.set(c.type, (map.get(c.type) || 0) + 1));
    return Array.from(map.entries()).map(([type, count]) => ({ type, count, ...typeConfig[type] }));
  }, []);

  return (
    <AppLayout>
      <TooltipProvider delayDuration={300}>
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[27px] font-semibold text-foreground tracking-[-0.02em]">Citation Manager</h1>
                <p className="text-[13px] text-muted-foreground font-display mt-0.5">
                  {citations.length} references · {totalCitedBy.toLocaleString()} total citations · {collections.length} collections
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={showImport} onOpenChange={setShowImport}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-xs font-display text-muted-foreground hover:text-foreground transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Import
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-serif">Import Citations</DialogTitle>
                      <DialogDescription className="font-display">Import from BibTeX, DOI, or reference managers</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="bibtex">
                      <TabsList className="w-full">
                        <TabsTrigger value="bibtex" className="flex-1 text-xs font-display">BibTeX</TabsTrigger>
                        <TabsTrigger value="doi" className="flex-1 text-xs font-display">DOI</TabsTrigger>
                        <TabsTrigger value="manager" className="flex-1 text-xs font-display">Zotero / Mendeley</TabsTrigger>
                      </TabsList>
                      <TabsContent value="bibtex" className="space-y-3 mt-3">
                        <Textarea placeholder="Paste BibTeX entries here..." rows={8} className="font-mono text-xs" />
                        <Button size="sm" className="w-full" onClick={() => { setShowImport(false); toast.success("Parsing BibTeX..."); }}>
                          Parse & Import
                        </Button>
                      </TabsContent>
                      <TabsContent value="doi" className="space-y-3 mt-3">
                        <Textarea placeholder="Enter DOIs (one per line)..." rows={6} className="font-mono text-xs" />
                        <Button size="sm" className="w-full" onClick={() => { setShowImport(false); toast.success("Resolving DOIs..."); }}>
                          Resolve & Import
                        </Button>
                      </TabsContent>
                      <TabsContent value="manager" className="space-y-3 mt-3">
                        <div className="grid grid-cols-2 gap-3">
                          <button className="h-16 rounded-lg border border-border bg-card flex flex-col items-center justify-center gap-1 hover:border-accent/30 transition-colors" onClick={() => toast.info("Zotero sync requires backend")}>
                            <BookOpen className="w-5 h-5 text-accent" />
                            <span className="text-[11px] font-display text-muted-foreground">Connect Zotero</span>
                          </button>
                          <button className="h-16 rounded-lg border border-border bg-card flex flex-col items-center justify-center gap-1 hover:border-accent/30 transition-colors" onClick={() => toast.info("Mendeley sync requires backend")}>
                            <Bookmark className="w-5 h-5 text-accent" />
                            <span className="text-[11px] font-display text-muted-foreground">Connect Mendeley</span>
                          </button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <button onClick={handleExport} className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-xs font-display text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
                <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-display font-semibold hover:bg-accent/90 transition-colors">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </motion.div>

          {/* Filter Strip */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border mb-5 overflow-x-auto"
          >
            <button
              onClick={() => setFilterView("all")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-display font-medium transition-colors whitespace-nowrap ${
                filterView === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-3 h-3" /> All
              <span className="text-[10px] text-muted-foreground">{citations.length}</span>
            </button>
            <button
              onClick={() => setFilterView("starred")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-display font-medium transition-colors whitespace-nowrap ${
                filterView === "starred" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="w-3 h-3" /> Starred
              <span className="text-[10px] text-muted-foreground">{starredIds.size}</span>
            </button>

            <div className="w-px h-5 bg-border mx-0.5" />

            {collections.map(col => (
              <button
                key={col.id}
                onClick={() => setFilterView(filterView === col.id ? "all" : col.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-display font-medium transition-colors whitespace-nowrap ${
                  filterView === col.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                {col.name.length > 16 ? col.name.slice(0, 16) + "…" : col.name}
              </button>
            ))}

            <div className="flex-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowUpDown className="w-3 h-3" /> Sort
                  {sortAsc ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {([["cited", "Citations"], ["year", "Year"], ["added", "Date Added"], ["title", "Title"]] as [SortKey, string][]).map(([k, l]) => (
                  <DropdownMenuItem key={k} onClick={() => handleSort(k)} className="text-xs font-display">
                    {l} {sortKey === k && (sortAsc ? "↑" : "↓")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Bulk selection bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 rounded-lg border border-accent/20">
                  <CheckSquare className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-display font-medium text-accent">{selectedIds.size} selected</span>
                  <div className="flex-1" />
                  <button onClick={handleExport} className="text-xs font-display text-accent hover:underline">Export BibTeX</button>
                  <button onClick={() => toast.success("Tags applied")} className="text-xs font-display text-accent hover:underline">Tag</button>
                  <button onClick={() => setSelectedIds(new Set())} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two Column */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
            {/* ═══ MAIN ═══ */}
            <div className="min-w-0">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, author, journal, DOI, tags..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                />
              </div>

              {/* Citation List */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-display">No citations match your search</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((cit, i) => {
                    const tc = typeConfig[cit.type];
                    const TypeIcon = tc.icon;
                    const isExpanded = expandedId === cit.id;
                    const isStarred = starredIds.has(cit.id);
                    const isSelected = selectedIds.has(cit.id);

                    return (
                      <motion.div
                        key={cit.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`bg-card rounded-xl border hover:border-accent/20 transition-colors group ${
                          isSelected ? "border-accent/30 bg-accent/[0.02]" : "border-border"
                        }`}
                        style={{ borderLeftWidth: "3px", borderLeftColor: tc.color }}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleSelect(cit.id)}
                              className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                                isSelected ? "bg-accent border-accent" : "border-border hover:border-accent/50"
                              }`}
                            >
                              {isSelected && <CheckSquare className="w-3 h-3 text-accent-foreground" />}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Badges */}
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[10px] font-display font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ color: tc.color, backgroundColor: `${tc.color}15` }}>
                                  <TypeIcon className="w-3 h-3" />{tc.label}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground">{cit.year}</span>
                                <BlockchainVerificationBadge
                                  status={cit.citedBy > 1000 ? "verified" : cit.citedBy > 100 ? "anchored" : "pending"}
                                  hash={mockHash(cit.doi)}
                                  compact
                                />
                                {cit.pdfAvailable && (
                                  <Tooltip><TooltipTrigger asChild><FileText className="w-3 h-3 text-success" /></TooltipTrigger>
                                    <TooltipContent className="text-xs">PDF available</TooltipContent></Tooltip>
                                )}
                                {isStarred && <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />}
                              </div>

                              {/* Title */}
                              <button onClick={() => toggleExpand(cit.id)} className="text-left w-full">
                                <h3 className="font-serif text-[15px] font-semibold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                                  {cit.title}
                                </h3>
                              </button>

                              {/* Authors */}
                              <p className="text-xs text-muted-foreground font-display mt-0.5 line-clamp-1">
                                {cit.authors.slice(0, 3).join(", ")}{cit.authors.length > 3 && " et al."}
                              </p>

                              {/* Journal line */}
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-display flex-wrap">
                                <span className="font-medium text-foreground/80">{cit.journal}</span>
                                {cit.volume && <span>Vol. {cit.volume}</span>}
                                {cit.pages && <span>pp. {cit.pages}</span>}
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-0.5 font-semibold">
                                  <BarChart3 className="w-3 h-3" />
                                  {cit.citedBy.toLocaleString()} cited
                                </span>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {cit.tags.slice(0, 3).map(t => (
                                  <span key={t} className="text-[10px] font-display text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">{t}</span>
                                ))}
                                {cit.tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{cit.tags.length - 3}</span>}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => toggleStar(cit.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                                    <Star className={`w-3.5 h-3.5 ${isStarred ? "text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" : "text-muted-foreground"}`} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">{isStarred ? "Unstar" : "Star"}</TooltipContent>
                              </Tooltip>

                              <button onClick={() => toggleExpand(cit.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
                                    <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem className="text-xs font-display gap-2" onClick={() => copyDoi(cit.doi)}><Copy className="w-3 h-3" /> Copy DOI</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><ExternalLink className="w-3 h-3" /> Open in Publisher</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Download className="w-3 h-3" /> Export BibTeX</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Edit3 className="w-3 h-3" /> Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Folder className="w-3 h-3" /> Move to Collection</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-xs font-display gap-2 text-destructive"><Trash2 className="w-3 h-3" /> Remove</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        {/* Expandable: Abstract + Notes + DOI */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-border ml-7">
                                <div className="pt-3 space-y-3">
                                  <div>
                                    <p className="text-[11px] font-display text-muted-foreground uppercase tracking-wider mb-1">Abstract</p>
                                    <p className="text-xs text-muted-foreground font-display leading-relaxed">{cit.abstract}</p>
                                  </div>
                                  {cit.notes && (
                                    <div className="p-2.5 bg-[hsl(var(--gold-muted))] border border-[hsl(var(--gold))]/20 rounded-lg">
                                      <p className="text-[11px] font-display text-muted-foreground uppercase tracking-wider mb-0.5">Your Note</p>
                                      <p className="text-xs font-display text-foreground">{cit.notes}</p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                                    <button onClick={() => copyDoi(cit.doi)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                      <Link2 className="w-3 h-3" /> {cit.doi}
                                    </button>
                                    <span>·</span>
                                    <span>Added {cit.dateAdded}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ═══ SIDEBAR ═══ */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Collections */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-accent" /> Collections
                </h3>
                <div className="space-y-1.5">
                  {collections.map(col => (
                    <button
                      key={col.id}
                      onClick={() => setFilterView(filterView === col.id ? "all" : col.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left ${
                        filterView === col.id ? "bg-secondary" : "hover:bg-secondary/50"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                      <span className="text-xs font-display text-foreground flex-1 line-clamp-1">{col.name}</span>
                      <span className="text-[10px] font-display text-muted-foreground">{col.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Most Cited */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-success" /> Top Cited
                </h3>
                <div className="space-y-2.5">
                  {topCited.map((c, i) => (
                    <div key={c.id} className="group cursor-pointer" onClick={() => toggleExpand(c.id)}>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground w-4 pt-0.5 shrink-0">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-display font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">{c.title}</p>
                          <p className="text-[10px] text-muted-foreground font-display">{c.citedBy.toLocaleString()} citations</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Type */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[hsl(var(--gold))]" /> By Type
                </h3>
                <div className="space-y-2">
                  {typeBreakdown.map(t => {
                    const TIcon = t.icon;
                    return (
                      <div key={t.type} className="flex items-center gap-2">
                        <TIcon className="w-3.5 h-3.5 shrink-0" style={{ color: t.color }} />
                        <span className="text-xs font-display text-foreground flex-1">{t.label}</span>
                        <span className="text-[10px] font-display text-muted-foreground">{t.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">
                  Library Stats
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Total citations", value: totalCitedBy.toLocaleString() },
                    { label: "Avg. cited by", value: Math.round(totalCitedBy / citations.length).toLocaleString() },
                    { label: "With PDF", value: `${citations.filter(c => c.pdfAvailable).length}/${citations.length}` },
                    { label: "With notes", value: String(citations.filter(c => c.notes).length) },
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
}
