import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, Plus, Edit3, Clock, Users, ChevronDown, FileText, Hash,
  Star, Eye, Folder, MoreVertical, Trash2, Share2, Copy, Link, TrendingUp,
  ArrowUpDown, SortAsc, SortDesc, Bookmark, PenLine, Globe, Lock, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

// ── Types ─────────────────────────────────────────────────────────────────────

type ArticleStatus = "published" | "draft" | "review";
type SortKey = "updated" | "views" | "title" | "contributors";
type FilterView = "all" | "starred" | string; // string = category name

interface WikiArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  lastEditor: string;
  initials: string;
  updatedAt: string;
  views: number;
  contributors: number;
  starred: boolean;
  tags: string[];
  status: ArticleStatus;
  wordCount: number;
  readingTimeMin: number;
  sections: string[];
  createdDate: string;
  visibility: "public" | "team";
}

interface RecentEdit {
  article: string;
  editor: string;
  initials: string;
  time: string;
  type: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const articles: WikiArticle[] = [
  {
    id: "w1", title: "Transformer Architecture Overview",
    excerpt: "A comprehensive guide to the attention mechanism, encoder-decoder structure, and key variants including GPT, BERT, and T5. Covers multi-head attention, positional encoding, and layer normalization in depth.",
    category: "Machine Learning", categoryColor: "hsl(var(--highlight))",
    lastEditor: "Dr. Sarah Chen", initials: "SC", updatedAt: "2h ago",
    views: 1432, contributors: 8, starred: true,
    tags: ["Deep Learning", "NLP", "Attention", "Architecture"],
    status: "published", wordCount: 4200, readingTimeMin: 18,
    sections: ["Introduction", "Self-Attention Mechanism", "Multi-Head Attention", "Positional Encoding", "Encoder-Decoder", "Variants & Extensions"],
    createdDate: "Oct 2025", visibility: "public",
  },
  {
    id: "w2", title: "CRISPR-Cas9 Methodology",
    excerpt: "Step-by-step protocols for CRISPR gene editing, including guide RNA design, delivery methods, off-target analysis, and validation workflows for both in vitro and in vivo applications.",
    category: "Biology", categoryColor: "hsl(var(--success))",
    lastEditor: "Dr. Priya Sharma", initials: "PS", updatedAt: "1d ago",
    views: 892, contributors: 5, starred: false,
    tags: ["Gene Editing", "Protocols", "Molecular Biology"],
    status: "published", wordCount: 5800, readingTimeMin: 25,
    sections: ["Overview", "Guide RNA Design", "Delivery Methods", "Transfection Protocols", "Off-Target Analysis", "Validation"],
    createdDate: "Sep 2025", visibility: "team",
  },
  {
    id: "w3", title: "Climate Model Validation Techniques",
    excerpt: "Methods for validating global and regional climate models against observational data, including statistical metrics, uncertainty quantification, and ensemble verification.",
    category: "Climate Science", categoryColor: "hsl(var(--info))",
    lastEditor: "Dr. Elena Volkov", initials: "EV", updatedAt: "3d ago",
    views: 567, contributors: 4, starred: true,
    tags: ["Modeling", "Validation", "Statistics"],
    status: "published", wordCount: 3400, readingTimeMin: 15,
    sections: ["Introduction", "Statistical Metrics", "Cross-Validation", "Uncertainty Quantification", "Case Studies"],
    createdDate: "Nov 2025", visibility: "public",
  },
  {
    id: "w4", title: "Research Ethics Handbook",
    excerpt: "Guidelines for ethical research conduct, IRB applications, informed consent, data privacy, and responsible AI development. Includes templates and checklists.",
    category: "Methodology", categoryColor: "hsl(var(--gold))",
    lastEditor: "Prof. Omar Hassan", initials: "OH", updatedAt: "1w ago",
    views: 2341, contributors: 12, starred: false,
    tags: ["Ethics", "Compliance", "IRB", "Templates"],
    status: "published", wordCount: 7200, readingTimeMin: 32,
    sections: ["Principles", "IRB Process", "Informed Consent", "Data Privacy", "AI Ethics", "Templates & Checklists"],
    createdDate: "Aug 2025", visibility: "public",
  },
  {
    id: "w5", title: "Quantum Error Correction Codes",
    excerpt: "Survey of stabilizer codes, surface codes, and topological codes for fault-tolerant quantum computation, with implementation examples on current hardware.",
    category: "Quantum Computing", categoryColor: "hsl(var(--accent))",
    lastEditor: "Prof. Yuki Tanaka", initials: "YT", updatedAt: "5d ago",
    views: 789, contributors: 6, starred: false,
    tags: ["Quantum", "Error Correction", "Fault Tolerance"],
    status: "published", wordCount: 4800, readingTimeMin: 21,
    sections: ["Background", "Stabilizer Codes", "Surface Codes", "Topological Codes", "Hardware Implementation", "Open Problems"],
    createdDate: "Dec 2025", visibility: "team",
  },
  {
    id: "w6", title: "Federated Learning Privacy Guarantees",
    excerpt: "Analysis of differential privacy in federated learning, secure aggregation protocols, and privacy-utility tradeoffs in distributed model training.",
    category: "Machine Learning", categoryColor: "hsl(var(--highlight))",
    lastEditor: "Dr. Marcus Chen", initials: "MC", updatedAt: "4d ago",
    views: 623, contributors: 3, starred: false,
    tags: ["Privacy", "Federated Learning", "Differential Privacy"],
    status: "draft", wordCount: 2100, readingTimeMin: 9,
    sections: ["Introduction", "Differential Privacy", "Secure Aggregation", "Tradeoffs"],
    createdDate: "Feb 2026", visibility: "team",
  },
  {
    id: "w7", title: "Lab Onboarding Guide",
    excerpt: "Complete onboarding guide for new lab members: equipment access, software accounts, safety protocols, and collaboration workflows.",
    category: "Methodology", categoryColor: "hsl(var(--gold))",
    lastEditor: "Dr. Sarah Chen", initials: "SC", updatedAt: "2w ago",
    views: 3120, contributors: 9, starred: true,
    tags: ["Onboarding", "Lab Management", "Safety"],
    status: "published", wordCount: 3800, readingTimeMin: 16,
    sections: ["Welcome", "Equipment Access", "Software Setup", "Safety Protocols", "Communication", "Resources"],
    createdDate: "Jul 2025", visibility: "team",
  },
];

const categories = [
  { name: "Machine Learning", count: 47, color: "hsl(var(--highlight))" },
  { name: "Biology", count: 31, color: "hsl(var(--success))" },
  { name: "Climate Science", count: 22, color: "hsl(var(--info))" },
  { name: "Methodology", count: 18, color: "hsl(var(--gold))" },
  { name: "Quantum Computing", count: 14, color: "hsl(var(--accent))" },
  { name: "Neuroscience", count: 26, color: "hsl(var(--destructive))" },
];

const recentEdits: RecentEdit[] = [
  { article: "Transformer Architecture Overview", editor: "Dr. Sarah Chen", initials: "SC", time: "2h ago", type: "Updated section" },
  { article: "CRISPR-Cas9 Methodology", editor: "Dr. Priya Sharma", initials: "PS", time: "1d ago", type: "New section added" },
  { article: "Federated Learning Privacy", editor: "Dr. Marcus Chen", initials: "MC", time: "4d ago", type: "Draft created" },
  { article: "Research Ethics Handbook", editor: "Prof. Omar Hassan", initials: "OH", time: "1w ago", type: "Reviewed" },
  { article: "Lab Onboarding Guide", editor: "Dr. Sarah Chen", initials: "SC", time: "2w ago", type: "Updated links" },
];

// ── Config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<ArticleStatus, { label: string; cls: string; icon: typeof Globe }> = {
  published: { label: "Published", cls: "bg-success/10 text-success border-success/20", icon: Globe },
  draft:     { label: "Draft",     cls: "bg-warning/10 text-warning border-warning/20", icon: PenLine },
  review:    { label: "In Review", cls: "bg-info/10 text-info border-info/20", icon: AlertCircle },
};

// ── Component ─────────────────────────────────────────────────────────────────

const Wiki = () => {
  const [starredIds, setStarredIds] = useState<Set<string>>(
    new Set(articles.filter(a => a.starred).map(a => a.id))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterView, setFilterView] = useState<FilterView>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 200);

  const toggleStar = useCallback((id: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  }, [sortKey]);

  // ── Derived ──

  const totalViews = articles.reduce((s, a) => s + a.views, 0);
  const totalContributors = new Set(articles.map(a => a.lastEditor)).size;

  const filtered = useMemo(() => {
    let result = [...articles];

    // Filter
    if (filterView === "starred") result = result.filter(a => starredIds.has(a.id));
    else if (filterView !== "all") result = result.filter(a => a.category === filterView);

    // Search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q)
      );
    }

    // Sort (starred first)
    const dir = sortAsc ? 1 : -1;
    result.sort((a, b) => {
      const sa = starredIds.has(a.id) ? 0 : 1;
      const sb = starredIds.has(b.id) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      switch (sortKey) {
        case "views": return dir * (a.views - b.views);
        case "title": return dir * a.title.localeCompare(b.title);
        case "contributors": return dir * (a.contributors - b.contributors);
        default: return 0; // updated — preserve original order
      }
    });
    return result;
  }, [articles, filterView, debouncedSearch, sortKey, sortAsc, starredIds]);

  // Popular for sidebar
  const popular = useMemo(() =>
    [...articles].sort((a, b) => b.views - a.views).slice(0, 4),
  []);

  return (
    <AppLayout>
      <TooltipProvider delayDuration={300}>
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Research Wiki</h1>
                <p className="text-sm text-muted-foreground font-display mt-0.5">
                  {articles.length} articles · {totalContributors} contributors · {totalViews.toLocaleString()} total views
                </p>
              </div>
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-display font-semibold hover:bg-accent/90 transition-colors">
                <Plus className="w-4 h-4" /> New Article
              </button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, tags, categories..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
              />
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
              <FileText className="w-3 h-3" /> All
              <span className="text-[10px] text-muted-foreground">{articles.length}</span>
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

            {categories.slice(0, 5).map(cat => (
              <button
                key={cat.name}
                onClick={() => setFilterView(filterView === cat.name ? "all" : cat.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-display font-medium transition-colors whitespace-nowrap ${
                  filterView === cat.name ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                {cat.name}
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
                {([["updated", "Last Updated"], ["views", "Most Viewed"], ["title", "Title"], ["contributors", "Contributors"]] as [SortKey, string][]).map(([k, l]) => (
                  <DropdownMenuItem key={k} onClick={() => handleSort(k)} className="text-xs font-display">
                    {l} {sortKey === k && (sortAsc ? "↑" : "↓")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
            {/* ═══ MAIN: Articles ═══ */}
            <div className="min-w-0">
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-display">No articles match your search</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((article, i) => {
                    const sc = statusConfig[article.status];
                    const StatusIcon = sc.icon;
                    const isExpanded = expandedId === article.id;
                    const isStarred = starredIds.has(article.id);

                    return (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-card rounded-xl border border-border hover:border-accent/20 transition-colors group"
                        style={{ borderLeftWidth: "3px", borderLeftColor: article.categoryColor }}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Badges row */}
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-[10px] font-display font-medium px-1.5 py-0.5 rounded-md" style={{ color: article.categoryColor, backgroundColor: `${article.categoryColor}15` }}>
                                  {article.category}
                                </span>
                                <Badge variant="outline" className={`text-[10px] font-display px-1.5 py-0 h-5 ${sc.cls}`}>
                                  <StatusIcon className="w-2.5 h-2.5 mr-0.5" />{sc.label}
                                </Badge>
                                {article.visibility === "team" && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Lock className="w-3 h-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">Team only</TooltipContent>
                                  </Tooltip>
                                )}
                                {isStarred && (
                                  <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                                )}
                              </div>

                              {/* Title */}
                              <button onClick={() => toggleExpand(article.id)} className="text-left w-full">
                                <h3 className="font-serif text-[15px] font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
                                  {article.title}
                                </h3>
                              </button>

                              <p className="text-xs text-muted-foreground font-display mt-0.5 line-clamp-2 leading-relaxed">{article.excerpt}</p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {article.tags.slice(0, 3).map(t => (
                                  <span key={t} className="text-[10px] font-display text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">{t}</span>
                                ))}
                                {article.tags.length > 3 && (
                                  <span className="text-[10px] font-display text-muted-foreground">+{article.tags.length - 3}</span>
                                )}
                              </div>

                              {/* Meta row */}
                              <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground font-display flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Avatar className="w-4 h-4">
                                    <AvatarFallback className="bg-secondary text-foreground text-[7px] font-bold">{article.initials}</AvatarFallback>
                                  </Avatar>
                                  {article.lastEditor}
                                </span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{article.updatedAt}</span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{article.views.toLocaleString()}</span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" />{article.readingTimeMin}m read</span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{article.contributors}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => toggleStar(article.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                                    <Star className={`w-3.5 h-3.5 ${isStarred ? "text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" : "text-muted-foreground"}`} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">{isStarred ? "Unstar" : "Star"}</TooltipContent>
                              </Tooltip>

                              <button onClick={() => toggleExpand(article.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
                                    <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Edit3 className="w-3 h-3" /> Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Copy className="w-3 h-3" /> Duplicate</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Link className="w-3 h-3" /> Copy Link</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Share2 className="w-3 h-3" /> Share</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-xs font-display gap-2 text-destructive"><Trash2 className="w-3 h-3" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        {/* Expandable: Table of Contents */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-border">
                                <p className="text-[11px] font-display text-muted-foreground uppercase tracking-wider mt-3 mb-2">
                                  Table of Contents ({article.sections.length} sections · {article.wordCount.toLocaleString()} words)
                                </p>
                                <div className="grid grid-cols-2 gap-1">
                                  {article.sections.map((sec, idx) => (
                                    <button key={sec} className="flex items-center gap-2 text-left py-1 px-2 rounded-md hover:bg-secondary/50 transition-colors">
                                      <span className="text-[10px] font-mono text-muted-foreground w-4">{idx + 1}.</span>
                                      <span className="text-xs font-display text-foreground">{sec}</span>
                                    </button>
                                  ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground font-display mt-2">
                                  Created {article.createdDate}
                                </p>
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
              {/* Recent Activity */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-accent" /> Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentEdits.slice(0, 4).map((edit, i) => (
                    <div key={i} className="flex items-start gap-2.5 group cursor-pointer">
                      <Avatar className="w-5 h-5 mt-0.5 shrink-0">
                        <AvatarFallback className="bg-secondary text-foreground text-[7px] font-bold">{edit.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display text-foreground line-clamp-1 group-hover:text-accent transition-colors">{edit.article}</p>
                        <p className="text-[10px] text-muted-foreground font-display">{edit.type} · {edit.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Articles */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-success" /> Most Viewed
                </h3>
                <div className="space-y-2.5">
                  {popular.map((a, i) => (
                    <div key={a.id} className="flex items-start gap-2 group cursor-pointer">
                      <span className="text-[10px] font-mono text-muted-foreground w-4 pt-0.5 shrink-0">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">{a.title}</p>
                        <p className="text-[10px] text-muted-foreground font-display">{a.views.toLocaleString()} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories Breakdown */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-[hsl(var(--gold))]" /> Categories
                </h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setFilterView(filterView === cat.name ? "all" : cat.name)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left ${
                        filterView === cat.name ? "bg-secondary" : "hover:bg-secondary/50"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-display text-foreground flex-1">{cat.name}</span>
                      <span className="text-[10px] font-display text-muted-foreground">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wiki Stats */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">
                  Wiki Stats
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Total words", value: `${Math.round(articles.reduce((s, a) => s + a.wordCount, 0) / 1000)}k` },
                    { label: "Avg. reading time", value: `${Math.round(articles.reduce((s, a) => s + a.readingTimeMin, 0) / articles.length)}m` },
                    { label: "Drafts", value: String(articles.filter(a => a.status === "draft").length) },
                    { label: "Team-only", value: String(articles.filter(a => a.visibility === "team").length) },
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

export default Wiki;
