import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Upload, ExternalLink, MoreVertical, ArrowDown, ArrowUp, Download, Award, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { mockPapers } from "@/data/mockData";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import ImportExportManager from "@/components/repositories/ImportExportManager";

const statusColors: Record<string, string> = {
  published: "bg-emerald-muted text-emerald-brand border-emerald-brand/20",
  "under review": "bg-gold-muted text-gold border-gold/20",
  draft: "bg-muted text-muted-foreground border-border",
  preprint: "bg-secondary text-accent border-accent/20",
};

const allPublications = [
  { ...mockPapers[0], status: "published", lastEdited: "2 days ago", views: 1243 },
  { ...mockPapers[1], status: "under review", lastEdited: "1 week ago", views: 876 },
  { ...mockPapers[2], status: "preprint", lastEdited: "3 days ago", views: 542 },
  { ...mockPapers[3], status: "published", lastEdited: "2 weeks ago", views: 3201 },
  { ...mockPapers[4], status: "draft", lastEdited: "Today", views: 0 },
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
  const debouncedSearch = useDebounce(searchQuery, 250);

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
    toast.success(`Exported as ${fmt}`, { description: `${publications.length} papers exported to ${fmt} format.` });
  };

  const copyDoi = (doi: string) => {
    navigator.clipboard.writeText(doi);
    setCopiedDoi(doi);
    toast.success("DOI copied to clipboard");
    setTimeout(() => setCopiedDoi(null), 2000);
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
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
            <span>{pub.citations} citations</span>
            <span>·</span>
            <span>{pub.views} views</span>
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
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Publications</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Manage your papers, preprints, and datasets
              </p>
            </div>
            <div className="flex gap-2">
              {/* Export — click-based Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="w-4 h-4" /> Export
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

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Total",         value: String(user.stats.publications), sub: "publications",  color: "text-foreground" },
            { label: "Published",      value: "18",                             sub: "peer-reviewed", color: "text-emerald-brand" },
            { label: "Under Review",   value: "3",                              sub: "manuscripts",   color: "text-gold" },
            { label: "h-index",        value: String(user.stats.hIndex),        sub: "impact score",  color: "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between">
                <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                {stat.label === "h-index" && <Award className="w-4 h-4 text-accent mt-1" />}
              </div>
              <p className="text-xs font-display font-medium text-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground font-display">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your publications..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {(["citations", "views", "title"] as SortField[]).map(field => (
              <button
                key={field}
                onClick={() => cycleSort(field)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-display transition-all capitalize ${
                  sortField === field
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {field}
                {sortField === field && (sortDir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="all" className="font-display text-sm">All</TabsTrigger>
            <TabsTrigger value="published" className="font-display text-sm">Published</TabsTrigger>
            <TabsTrigger value="review" className="font-display text-sm">Under Review</TabsTrigger>
            <TabsTrigger value="drafts" className="font-display text-sm">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {publications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground font-display">No publications found</p>
              </div>
            ) : publications.map((pub, i) => renderPub(pub, i))}
          </TabsContent>

          {(["published", "review", "drafts"] as const).map(tabKey => {
            const items = tabKey === "published" ? publishedPubs : tabKey === "review" ? reviewPubs : draftPubs;
            return (
              <TabsContent key={tabKey} value={tabKey} className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground font-display">No publications found</p>
                  </div>
                ) : items.map((pub, i) => renderPub(pub, i))}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <ImportExportManager open={showImport} onClose={() => setShowImport(false)} />
    </AppLayout>
  );
};

export default Publications;
