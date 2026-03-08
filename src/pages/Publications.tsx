import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Plus, FileText, Upload, ExternalLink, MoreVertical, ArrowDown, ArrowUp, Download, Award, Copy, Check, CheckSquare, Square, Trash2, Tag, X, TrendingUp, CloudUpload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { mockPapers } from "@/data/mockData";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import ImportExportManager from "@/components/repositories/ImportExportManager";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";

const statusColors: Record<string, string> = {
  published: "bg-emerald-muted text-emerald-brand border-emerald-brand/20",
  "under review": "bg-gold-muted text-gold border-gold/20",
  draft: "bg-muted text-muted-foreground border-border",
  preprint: "bg-secondary text-accent border-accent/20",
};

const allPublications = [
  { ...mockPapers[0], status: "published", lastEdited: "2 days ago", views: 1243, altmetric: 156 },
  { ...mockPapers[1], status: "under review", lastEdited: "1 week ago", views: 876, altmetric: 42 },
  { ...mockPapers[2], status: "preprint", lastEdited: "3 days ago", views: 542, altmetric: 89 },
  { ...mockPapers[3], status: "published", lastEdited: "2 weeks ago", views: 3201, altmetric: 234 },
  { ...mockPapers[4], status: "draft", lastEdited: "Today", views: 0, altmetric: 0 },
];

type SortField = "title" | "citations" | "views" | "date";
type SortDir = "asc" | "desc";

function PublicationsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <Skeleton className="h-7 w-12 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full mb-6 rounded-lg" />
      <Skeleton className="h-10 w-72 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

const Publications = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("citations");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 250);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const validFiles = files.filter(f => f.name.endsWith('.pdf') || f.name.endsWith('.bib') || f.name.endsWith('.tex'));
      if (validFiles.length > 0) {
        toast.success(`Uploading ${validFiles.length} file(s): ${validFiles.map(f => f.name).join(', ')}`);
      } else {
        toast.error("Please upload PDF, BibTeX, or TeX files");
      }
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const cycleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleExport = (fmt: string) => {
    const count = selectedIds.size > 0 ? selectedIds.size : publications.length;
    toast.success(`Exported ${count} papers as ${fmt}`);
  };

  const copyDoi = (doi: string) => {
    navigator.clipboard.writeText(doi);
    setCopiedDoi(doi);
    toast.success("DOI copied to clipboard");
    setTimeout(() => setCopiedDoi(null), 2000);
  };

  const toggleSelect = (idx: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const selectAll = (items: typeof allPublications) => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((_, i) => i)));
    }
  };

  const batchAction = (action: string) => {
    toast.success(`${action} applied to ${selectedIds.size} publications`);
    setSelectedIds(new Set());
  };

  const filterAndSort = (items: typeof allPublications, statusFilter?: string) => {
    let filtered = items;
    if (statusFilter) {
      filtered = filtered.filter(p =>
        statusFilter === "published" ? p.status === "published" :
        statusFilter === "review" ? p.status === "under review" :
        statusFilter === "drafts" ? p.status === "draft" :
        true
      );
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.authors.some(a => a.toLowerCase().includes(q)) ||
        p.journal.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "title") return a.title.localeCompare(b.title) * mul;
      if (sortField === "citations") return (a.citations - b.citations) * mul;
      if (sortField === "views") return (a.views - b.views) * mul;
      return 0;
    });
  };

  const publications = useMemo(() => filterAndSort(allPublications), [debouncedSearch, sortField, sortDir]);
  const publishedPubs = useMemo(() => filterAndSort(allPublications, "published"), [debouncedSearch, sortField, sortDir]);
  const reviewPubs = useMemo(() => filterAndSort(allPublications, "review"), [debouncedSearch, sortField, sortDir]);
  const draftPubs = useMemo(() => filterAndSort(allPublications, "drafts"), [debouncedSearch, sortField, sortDir]);

  const renderPub = (pub: typeof allPublications[0], i: number) => (
    <motion.div
      key={`${pub.title}-${i}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`card-interactive p-5 group ${
        selectedIds.has(i) ? "border-accent bg-accent/5" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-1">
          <Checkbox
            checked={selectedIds.has(i)}
            onCheckedChange={() => toggleSelect(i)}
            className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={`text-[10px] font-display ${statusColors[pub.status]}`}>
              {pub.status}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-display capitalize">
              {pub.type}
            </Badge>
          </div>
          <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors cursor-pointer">
            {pub.title}
          </h3>
          <p className="text-xs text-muted-foreground font-display mb-2">
            {pub.authors.join(", ")}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display flex-wrap">
            <span>{pub.journal}</span>
            <span>·</span>
            <span>{pub.date}</span>
            <span>·</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-accent hover:underline">{pub.citations} citations</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[200px]">
                <p className="font-display font-medium mb-1">{pub.citations} total citations</p>
                <p className="text-muted-foreground">~{Math.round(pub.citations / 12)}/month average. Top citing journals: Nature, Science, PNAS</p>
              </TooltipContent>
            </Tooltip>
            <span>·</span>
            <span>{pub.views} views</span>
            {pub.altmetric > 0 && (
              <>
                <span>·</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 cursor-help text-gold hover:underline">
                      <TrendingUp className="w-3 h-3" /> {pub.altmetric}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[220px]">
                    <p className="font-display font-medium mb-1">Altmetric Score: {pub.altmetric}</p>
                    <p className="text-muted-foreground">Measures online attention including news, blogs, Twitter, and policy documents</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pub.doi && (
            <button onClick={() => copyDoi(pub.doi!)}
              className="text-accent hover:underline text-xs font-display flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent/10 transition-colors"
              title="Copy DOI">
              {copiedDoi === pub.doi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              DOI
            </button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="end">
              {["Edit", "Duplicate", "Export BibTeX", "Delete"].map(action => (
                <button key={action} onClick={() => toast.info(action)}
                  className={`w-full text-left px-3 py-2 text-sm font-display rounded-md hover:bg-secondary transition-colors ${
                    action === "Delete" ? "text-destructive hover:bg-destructive/10" : "text-foreground"
                  }`}>
                  {action}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return <AppLayout><PublicationsSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="max-w-5xl mx-auto" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          {/* Drag overlay */}
          {isDragging && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-card rounded-2xl border-2 border-dashed border-accent p-12 text-center max-w-md">
                <CloudUpload className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">Drop your files</h3>
                <p className="text-sm text-muted-foreground font-display">Upload PDF, BibTeX, or TeX files</p>
              </motion.div>
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Publications</h1>
                <p className="text-sm text-muted-foreground font-display mt-1">
                  Manage your papers, preprints, and datasets
                </p>
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
                      <Download className="w-4 h-4" /> Export {selectedIds.size > 0 && `(${selectedIds.size})`}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-36 p-1" align="end">
                    {["BibTeX", "APA", "MLA", "EndNote", "CSV"].map(fmt => (
                      <button key={fmt} onClick={() => handleExport(fmt)}
                        className="w-full text-left px-3 py-2 text-xs font-display text-foreground hover:bg-secondary rounded-md transition-colors">
                        {fmt}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
                <button onClick={() => setShowImport(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
                  <Upload className="w-4 h-4" /> Import
                </button>
                <button className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
                  <Plus className="w-4 h-4" /> New Publication
                </button>
              </div>
            </div>
          </motion.div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
              <span className="text-sm font-display font-medium text-accent">{selectedIds.size} selected</span>
              <div className="flex-1" />
              <button onClick={() => batchAction("Export")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-display text-foreground hover:bg-secondary transition-colors">
                <Download className="w-3 h-3" /> Export
              </button>
              <button onClick={() => batchAction("Tag")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-display text-foreground hover:bg-secondary transition-colors">
                <Tag className="w-3 h-3" /> Tag
              </button>
              <button onClick={() => batchAction("Delete")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-display text-destructive hover:bg-destructive/20 transition-colors">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="ml-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Stats Row */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total", value: String(user.stats.publications), sub: "publications", color: "text-foreground", bgClass: "bg-secondary/50" },
              { label: "Published", value: "18", sub: "peer-reviewed", color: "text-success", bgClass: "bg-success-muted" },
              { label: "Under Review", value: "3", sub: "manuscripts", color: "text-warning", bgClass: "bg-warning-muted" },
              { label: "h-index", value: String(user.stats.hIndex), sub: "impact score", color: "text-accent", bgClass: "bg-gold-muted" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + idx * 0.05, duration: 0.3 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="card-interactive p-4 text-center"
              >
                <div className={`w-8 h-8 rounded-lg ${stat.bgClass} flex items-center justify-center mx-auto mb-2`}>
                  <span className={`text-sm font-bold ${stat.color}`}>{stat.value.charAt(0)}</span>
                </div>
                <p className={`text-xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-display font-medium text-foreground mt-0.5">{stat.label}</p>
                {stat.sub && <p className="text-[10px] text-muted-foreground font-display">{stat.sub}</p>}
              </motion.div>
            ))}
          </motion.div>
          </motion.div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search your publications..." className="flex-1 min-w-[200px]" />
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
              {(["citations", "views", "title"] as SortField[]).map(field => (
                <button key={field} onClick={() => cycleSort(field)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-display transition-all capitalize ${
                    sortField === field ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {field}
                  {sortField === field && (sortDir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
                </button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="all">
            <div className="flex items-center gap-3 mb-6">
              <TabsList className="bg-secondary border border-border">
                <TabsTrigger value="all" className="font-display text-sm">All</TabsTrigger>
                <TabsTrigger value="published" className="font-display text-sm">Published</TabsTrigger>
                <TabsTrigger value="review" className="font-display text-sm">Under Review</TabsTrigger>
                <TabsTrigger value="drafts" className="font-display text-sm">Drafts</TabsTrigger>
              </TabsList>
              <button onClick={() => selectAll(publications)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display text-muted-foreground hover:text-foreground bg-card border border-border hover:bg-secondary transition-colors">
                {selectedIds.size === publications.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                {selectedIds.size === publications.length ? "Deselect all" : "Select all"}
              </button>
            </div>

            <TabsContent value="all" className="space-y-3">
              {publications.length === 0 ? (
                <EmptyState icon={FileText} title="No publications found" description="Try adjusting your search or filters" />
              ) : publications.map((pub, i) => renderPub(pub, i))}
            </TabsContent>

            {(["published", "review", "drafts"] as const).map(tabKey => {
              const items = tabKey === "published" ? publishedPubs : tabKey === "review" ? reviewPubs : draftPubs;
              return (
                <TabsContent key={tabKey} value={tabKey} className="space-y-3">
                  {items.length === 0 ? (
                    <EmptyState icon={FileText} title="No publications found" description="No items in this category" />
                  ) : items.map((pub, i) => renderPub(pub, i))}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </TooltipProvider>
      <ImportExportManager open={showImport} onClose={() => setShowImport(false)} />
    </AppLayout>
  );
};

export default Publications;
