import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FileText, Upload, ExternalLink, MoreVertical, ArrowDown, ArrowUp,
  Download, Award, Copy, Check, Trash2, Tag, X, TrendingUp, CloudUpload,
  BookOpen, Eye, Quote, Lock, Unlock, Clock, BarChart3, Sparkles,
  Star, Filter, ChevronDown, Share2, Bookmark, BookmarkCheck
} from "lucide-react";
import { BlockchainVerificationBadge } from "@/components/blockchain/BlockchainVerificationBadge";
import { BlockchainTimestamp } from "@/components/blockchain/BlockchainVerificationBadge";
import { AnchorToChainButton } from "@/components/blockchain/AnchorToChainButton";
import { mockHash, deriveAnchorStatus } from "@/lib/blockchain-utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { mockPapers } from "@/data/mockData";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import ImportExportManager from "@/components/repositories/ImportExportManager";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Link } from "react-router-dom";

// ─── Types & Constants ───────────────────────────────────────────────────────
const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
  published:    { bg: "bg-success-muted", text: "text-success", label: "Published", icon: Check },
  "under review": { bg: "bg-warning-muted", text: "text-warning", label: "Under Review", icon: Clock },
  draft:        { bg: "bg-secondary", text: "text-muted-foreground", label: "Draft", icon: FileText },
  preprint:     { bg: "bg-accent/10", text: "text-accent", label: "Preprint", icon: Share2 },
};

const typeConfig: Record<string, { emoji: string; color: string }> = {
  paper:    { emoji: "📄", color: "bg-scholarly/10 text-scholarly" },
  preprint: { emoji: "📋", color: "bg-warning-muted text-warning" },
  dataset:  { emoji: "📊", color: "bg-success-muted text-success" },
  code:     { emoji: "💻", color: "bg-info-muted text-info" },
};

interface PublicationItem {
  title: string;
  authors: string[];
  abstract: string;
  journal: string;
  date: string;
  tags: string[];
  citations: number;
  likes: number;
  comments: number;
  doi?: string;
  type: "paper" | "preprint" | "dataset" | "code";
  status: string;
  lastEdited: string;
  views: number;
  altmetric: number;
  openAccess: boolean;
  impactFactor: number;
  citationTrend: number[];
}

const allPublications: PublicationItem[] = [
  { ...mockPapers[0], status: "published", lastEdited: "2 days ago", views: 1243, altmetric: 156, openAccess: true, impactFactor: 25.8, citationTrend: [8, 12, 15, 22, 18, 25, 31] },
  { ...mockPapers[1], status: "under review", lastEdited: "1 week ago", views: 876, altmetric: 42, openAccess: false, impactFactor: 66.8, citationTrend: [3, 5, 8, 12, 10, 15, 14] },
  { ...mockPapers[2], status: "preprint", lastEdited: "3 days ago", views: 542, altmetric: 89, openAccess: true, impactFactor: 0, citationTrend: [1, 2, 4, 5, 8, 10, 12] },
  { ...mockPapers[3], status: "published", lastEdited: "2 weeks ago", views: 3201, altmetric: 234, openAccess: true, impactFactor: 9.8, citationTrend: [5, 8, 12, 18, 22, 28, 35] },
  { ...mockPapers[4], status: "draft", lastEdited: "Today", views: 0, altmetric: 0, openAccess: false, impactFactor: 0, citationTrend: [] },
];

type SortField = "title" | "citations" | "views" | "date" | "altmetric";
type SortDir = "asc" | "desc";

// ─── Sub-components ──────────────────────────────────────────────────────────
function MiniSparkline({ data, color = "text-accent" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 60;
  const h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} className={`${color} shrink-0`}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PublicationStatsBar({ pubs }: { pubs: PublicationItem[] }) {
  const { user } = useAuth();
  const totalCitations = pubs.reduce((s, p) => s + p.citations, 0);
  const totalViews = pubs.reduce((s, p) => s + p.views, 0);
  const published = pubs.filter(p => p.status === "published").length;
  const underReview = pubs.filter(p => p.status === "under review").length;

  const stats = [
    { label: "Publications", value: String(pubs.length), sub: `${published} published`, color: "text-foreground", bg: "bg-secondary/50", icon: BookOpen },
    { label: "Citations", value: totalCitations > 999 ? `${(totalCitations / 1000).toFixed(1)}k` : String(totalCitations), sub: "+12% this year", color: "text-accent", bg: "bg-accent/10", icon: Quote },
    { label: "Views", value: totalViews > 999 ? `${(totalViews / 1000).toFixed(1)}k` : String(totalViews), sub: "total reads", color: "text-info", bg: "bg-info-muted", icon: Eye },
    { label: "h-index", value: String(user.stats.hIndex), sub: `${underReview} under review`, color: "text-warning", bg: "bg-warning-muted", icon: Award },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-border/80 transition-all duration-200"
          style={{ boxShadow: "0 1px 4px hsl(225 20% 8% / 0.05)" }}
        >
          <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
            <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
          </div>
          <p className="text-[11.5px] text-muted-foreground uppercase tracking-[0.07em] font-medium mb-1">{stat.label}</p>
          <p className={`text-[28px] font-bold leading-none tracking-tight ${stat.color}`}>{stat.value}</p>
          <p className="text-[12px] text-muted-foreground mt-1.5">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

function WritingInsights({ pubs }: { pubs: PublicationItem[] }) {
  const openAccessCount = pubs.filter(p => p.openAccess).length;
  const avgCitations = pubs.length ? Math.round(pubs.reduce((s, p) => s + p.citations, 0) / pubs.length) : 0;
  const topJournal = pubs.reduce((best, p) => p.impactFactor > (best?.impactFactor || 0) ? p : best, pubs[0]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-xl border border-border p-5"
      style={{ boxShadow: "0 1px 4px hsl(225 20% 8% / 0.05)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-accent" />
        <h3 className="text-[14px] font-semibold text-foreground">Writing Insights</h3>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-muted-foreground">Avg Citations/Paper</span>
            <span className="font-bold text-foreground">{avgCitations}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (avgCitations / 100) * 100)}%` }} className="h-full bg-accent rounded-full" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-muted-foreground">Open Access Rate</span>
            <span className="font-bold text-success">{pubs.length ? Math.round((openAccessCount / pubs.length) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pubs.length ? (openAccessCount / pubs.length) * 100 : 0}%` }} className="h-full bg-success rounded-full" />
          </div>
        </div>
        {topJournal && topJournal.impactFactor > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-[11.5px] text-muted-foreground mb-1">Highest Impact Factor</p>
            <p className="text-[13px] font-medium text-foreground">{topJournal.journal}</p>
            <p className="text-[12px] text-accent font-bold mt-0.5">IF: {topJournal.impactFactor}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RecentActivity() {
  const activities = [
    { action: "Paper cited", detail: "by Dr. Park in Nature Comm.", time: "2h", emoji: "🔗" },
    { action: "Review completed", detail: "Manuscript #2026-0298", time: "1d", emoji: "✅" },
    { action: "50 downloads", detail: "Quantum Error Correction", time: "2d", emoji: "📥" },
    { action: "h-index up", detail: "Now at 19", time: "3d", emoji: "📈" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-xl border border-border p-4"
    >
      <h3 className="text-[13px] font-semibold text-foreground mb-3 flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-accent" /> Recent Activity
      </h3>
      <div className="space-y-2">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-sm mt-0.5">{a.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-foreground">{a.action}</p>
              <p className="text-[10px] text-muted-foreground">{a.detail}</p>
            </div>
            <span className="text-[9px] text-muted-foreground/60 shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
      <Link to="/analytics" className="block mt-3 pt-2 border-t border-border text-[10px] text-accent font-medium text-center hover:underline">
        View full analytics →
      </Link>
    </motion.div>
  );
}

function PublicationsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-2"><Skeleton className="h-7 w-36" /><Skeleton className="h-4 w-56" /></div>
        <div className="flex gap-2"><Skeleton className="h-9 w-24 rounded-lg" /><Skeleton className="h-9 w-32 rounded-lg" /></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
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
  const [savedPapers, setSavedPapers] = useState<Set<number>>(new Set());
  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const valid = files.filter(f => /\.(pdf|bib|tex)$/i.test(f.name));
    if (valid.length > 0) toast.success(`Uploading ${valid.length} file(s)`);
    else toast.error("Please upload PDF, BibTeX, or TeX files");
  };

  const cycleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const copyDoi = (doi: string) => {
    navigator.clipboard.writeText(doi);
    setCopiedDoi(doi);
    toast.success("DOI copied");
    setTimeout(() => setCopiedDoi(null), 2000);
  };

  const toggleSelect = useCallback((idx: number) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; });
  }, []);

  const toggleSave = useCallback((idx: number) => {
    setSavedPapers(prev => {
      const n = new Set(prev);
      if (n.has(idx)) { n.delete(idx); toast("Removed from reading list"); }
      else { n.add(idx); toast.success("Added to reading list"); }
      return n;
    });
  }, []);

  const filterAndSort = (items: PublicationItem[], statusFilter?: string) => {
    let filtered = items;
    if (statusFilter) {
      filtered = filtered.filter(p =>
        statusFilter === "published" ? p.status === "published" :
        statusFilter === "review" ? p.status === "under review" :
        statusFilter === "drafts" ? p.status === "draft" : true
      );
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.authors.some(a => a.toLowerCase().includes(q)) ||
        p.journal.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return [...filtered].sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "title") return a.title.localeCompare(b.title) * mul;
      if (sortField === "citations") return (a.citations - b.citations) * mul;
      if (sortField === "views") return (a.views - b.views) * mul;
      if (sortField === "altmetric") return (a.altmetric - b.altmetric) * mul;
      return 0;
    });
  };

  const publications = useMemo(() => filterAndSort(allPublications), [debouncedSearch, sortField, sortDir]);

  const renderPub = (pub: PublicationItem, i: number) => {
    const sc = statusConfig[pub.status] || statusConfig.draft;
    const tc = typeConfig[pub.type] || typeConfig.paper;
    const isSaved = savedPapers.has(i);
    const isSelected = selectedIds.has(i);

    return (
      <motion.div
        key={`${pub.title}-${i}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(i, 4) * 0.04 }}
        className={`bg-card rounded-xl border p-4 hover:shadow-md transition-all group ${
          isSelected ? "border-accent bg-accent/[0.03]" : "border-border hover:border-accent/20"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-1 shrink-0" onClick={e => e.stopPropagation()}>
            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(i)} className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Status + Type badges */}
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${sc.bg} ${sc.text}`}>
                {sc.label}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${tc.color}`}>
                {tc.emoji} {pub.type}
              </span>
              {pub.openAccess && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-success-muted text-success font-medium cursor-help">
                      <Unlock className="w-2.5 h-2.5" /> Open Access
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[11px]">
                    Freely available to read and download
                  </TooltipContent>
                </Tooltip>
              )}
              {pub.impactFactor > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-bold cursor-help">
                      IF {pub.impactFactor}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[11px]">
                    Journal Impact Factor
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[14px] font-semibold text-foreground leading-snug mb-1.5 group-hover:text-accent transition-colors cursor-pointer line-clamp-2">
              {pub.title}
            </h3>

            {/* Authors */}
            <p className="text-[11px] text-muted-foreground mb-2">
              {pub.authors.join(", ")}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {pub.tags.slice(0, 4).map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>

            {/* Metrics row */}
            <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground/80">{pub.journal}</span>
              <span>·</span>
              <span>{pub.date}</span>
              <span>·</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-0.5 text-accent cursor-help font-medium">
                    <Quote className="w-3 h-3" /> {pub.citations}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px] p-3 space-y-1">
                  <p className="font-medium">{pub.citations} citations</p>
                  <p className="text-muted-foreground">~{Math.round(pub.citations / 12)}/month avg</p>
                </TooltipContent>
              </Tooltip>
              <span>·</span>
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {pub.views}</span>
              {pub.altmetric > 0 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 text-warning">
                    <TrendingUp className="w-3 h-3" /> {pub.altmetric}
                  </span>
                </>
              )}
              {/* Citation sparkline */}
              {pub.citationTrend.length > 1 && (
                <div className="ml-auto">
                  <MiniSparkline data={pub.citationTrend} />
                </div>
              )}
            </div>

            {/* Blockchain verification + Edited time */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <BlockchainVerificationBadge
                status={deriveAnchorStatus({ status: pub.status })}
                hash={mockHash(pub.title)}
                timestamp={pub.date}
              />
              <BlockchainTimestamp hash={mockHash(pub.title)} anchoredAt={pub.date} />
              <p className="text-[9px] text-muted-foreground/50 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Edited {pub.lastEdited}
              </p>
            </div>
          </div>

          {/* Actions column */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            {pub.doi && (
              <button onClick={() => copyDoi(pub.doi!)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-accent hover:bg-accent/10 transition-colors"
              >
                {copiedDoi === pub.doi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                DOI
              </button>
            )}
            <button
              onClick={() => toggleSave(i)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isSaved ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => toast.info("Edit")}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Duplicate")}>Duplicate</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Export BibTeX")}>Export BibTeX</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div className="cursor-pointer">
                    <AnchorToChainButton
                      documentType="publication"
                      documentId={pub.title}
                      title={pub.title}
                      content={pub.abstract}
                      author={pub.authors.join(", ")}
                      compact
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info("Delete")} className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) return <AppLayout><PublicationsSkeleton /></AppLayout>;

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="max-w-6xl mx-auto" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          {/* Drag overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="bg-card rounded-2xl border-2 border-dashed border-accent p-12 text-center max-w-md">
                  <CloudUpload className="w-10 h-10 mx-auto mb-3 text-accent" />
                  <h3 className="font-semibold text-foreground mb-1">Drop your files</h3>
                  <p className="text-[12px] text-muted-foreground">Upload PDF, BibTeX, or TeX files</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="font-serif text-[27px] font-bold text-foreground">Publications</h1>
                <p className="text-[12px] text-muted-foreground mt-0.5">Manage your papers, preprints, and datasets</p>
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <Download className="w-3.5 h-3.5" /> Export {selectedIds.size > 0 && `(${selectedIds.size})`}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-36 p-1" align="end">
                    {["BibTeX", "APA", "MLA", "EndNote", "CSV"].map(fmt => (
                      <button key={fmt} onClick={() => { toast.success(`Exported as ${fmt}`); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-secondary rounded-md transition-colors">
                        {fmt}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
                <button onClick={() => setShowImport(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Import
                </button>
                <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-[12px] font-semibold shadow-gold hover:opacity-90 transition-opacity">
                  <Plus className="w-3.5 h-3.5" /> New Publication
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <PublicationStatsBar pubs={allPublications} />

          {/* Bulk Actions */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/5 border border-accent/15">
                  <span className="text-[11px] font-medium text-foreground">{selectedIds.size} selected</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <button onClick={() => { toast.success("Exported"); setSelectedIds(new Set()); }} className="px-2 py-1 rounded-md bg-secondary text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <Download className="w-3 h-3 inline mr-1" />Export
                    </button>
                    <button onClick={() => { toast.success("Tagged"); setSelectedIds(new Set()); }} className="px-2 py-1 rounded-md bg-secondary text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <Tag className="w-3 h-3 inline mr-1" />Tag
                    </button>
                    <button onClick={() => { toast("Deleted"); setSelectedIds(new Set()); }} className="px-2 py-1 rounded-md bg-destructive/10 text-[10px] font-medium text-destructive hover:bg-destructive/20 transition-colors">
                      <Trash2 className="w-3 h-3 inline mr-1" />Delete
                    </button>
                    <button onClick={() => setSelectedIds(new Set())} className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
            {/* Main */}
            <div className="min-w-0">
              {/* Search & Sort */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search publications..." className="flex-1 min-w-[200px]" />
                <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg p-0.5">
                  {(["citations", "views", "altmetric", "title"] as SortField[]).map(field => (
                    <button key={field} onClick={() => cycleSort(field)}
                      className={`flex items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all capitalize ${
                        sortField === field ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}>
                      {field === "altmetric" ? "Impact" : field}
                      {sortField === field && (sortDir === "desc" ? <ArrowDown className="w-2.5 h-2.5" /> : <ArrowUp className="w-2.5 h-2.5" />)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="all">
                <div className="flex items-center gap-2 mb-4">
                  <TabsList className="bg-secondary/50 border border-border h-auto p-0.5">
                    <TabsTrigger value="all" className="text-[12px] px-3 py-1.5">All</TabsTrigger>
                    <TabsTrigger value="published" className="text-[12px] px-3 py-1.5">Published</TabsTrigger>
                    <TabsTrigger value="review" className="text-[12px] px-3 py-1.5">Under Review</TabsTrigger>
                    <TabsTrigger value="drafts" className="text-[12px] px-3 py-1.5">Drafts</TabsTrigger>
                  </TabsList>
                </div>

                {(["all", "published", "review", "drafts"] as const).map(tabKey => {
                  const items = tabKey === "all" ? publications : filterAndSort(allPublications, tabKey);
                  return (
                    <TabsContent key={tabKey} value={tabKey} className="space-y-2">
                      {items.length === 0 ? (
                        <EmptyState icon={FileText} title="No publications found" description="Try adjusting your search or filters" />
                      ) : items.map((pub, i) => renderPub(pub, i))}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block space-y-4">
              <WritingInsights pubs={allPublications} />
              <RecentActivity />
            </aside>
          </div>
        </div>
      </TooltipProvider>
      <ImportExportManager open={showImport} onClose={() => setShowImport(false)} />
    </AppLayout>
  );
};

export default Publications;
