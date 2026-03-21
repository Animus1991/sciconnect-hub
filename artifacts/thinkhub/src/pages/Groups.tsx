import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Lock, Globe, Plus, MessageSquare, Search, Check, TrendingUp, Flame, Sparkles,
  ChevronDown, ChevronRight, Shield, Calendar, FileText, ExternalLink, Copy, Filter,
  BarChart3, Star, Bell, BellOff, Settings, MoreVertical, Share2, UserPlus, Hash,
  Clock, Eye, Bookmark, BookmarkCheck, ArrowUpDown
} from "lucide-react";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

/* ─── Mock Data ─── */
const groups = [
  {
    name: "Computational Neuroscience Lab", members: 34, posts: 156, type: "private" as const,
    activity: "active" as const, description: "Internal lab discussions and pre-publication drafts",
    initials: "CN", color: "bg-highlight", topics: ["Neural Networks", "Brain Imaging", "Connectomics"],
    recentActivity: "Dr. Chen shared a new dataset 2h ago",
    founded: "2023-03-15", admin: "Dr. Sarah Chen", activeToday: 8,
    pinnedPost: "Lab Meeting Notes — March 2026"
  },
  {
    name: "Open Science Advocates", members: 1247, posts: 4521, type: "public" as const,
    activity: "hot" as const, description: "Promoting open access, reproducibility, and transparent research practices",
    initials: "OS", color: "bg-success", topics: ["Open Access", "Reproducibility", "Preregistration"],
    recentActivity: "New policy discussion: Plan S compliance (45 replies)",
    founded: "2021-06-01", admin: "Prof. Marcus Lee", activeToday: 124,
    pinnedPost: "Welcome Guide & Community Rules"
  },
  {
    name: "AI for Drug Discovery", members: 89, posts: 312, type: "public" as const,
    activity: "growing" as const, description: "Intersection of machine learning and pharmaceutical research",
    initials: "AD", color: "bg-info", topics: ["ML Models", "Molecular Design", "Clinical Trials"],
    recentActivity: "New paper shared: AlphaFold3 benchmarks",
    founded: "2024-01-10", admin: "Dr. Priya Patel", activeToday: 12,
    pinnedPost: "Resource List: Datasets & Tools"
  },
  {
    name: "Climate Modeling Consortium", members: 567, posts: 2103, type: "public" as const,
    activity: "active" as const, description: "Global collaboration on next-generation climate prediction models",
    initials: "CM", color: "bg-emerald-brand", topics: ["GCMs", "Carbon Cycle", "Sea Level"],
    recentActivity: "CMIP7 working group update posted",
    founded: "2020-09-20", admin: "Prof. Elena Vasquez", activeToday: 43,
    pinnedPost: "CMIP7 Timeline & Deliverables"
  },
  {
    name: "Quantum Information Theory", members: 203, posts: 891, type: "public" as const,
    activity: "growing" as const, description: "Theoretical foundations of quantum computing and communication",
    initials: "QI", color: "bg-warning", topics: ["Entanglement", "Error Correction", "Algorithms"],
    recentActivity: "Workshop recording: Topological QEC (3 comments)",
    founded: "2022-11-05", admin: "Dr. James Wu", activeToday: 18,
    pinnedPost: "Quantum Computing Roadmap 2026"
  },
  {
    name: "Bioethics Discussion Forum", members: 412, posts: 1567, type: "public" as const,
    activity: "new" as const, description: "Ethical considerations in modern biological and medical research",
    initials: "BE", color: "bg-destructive", topics: ["Gene Editing", "AI Ethics", "Consent"],
    recentActivity: "New thread: CRISPR germline editing guidelines",
    founded: "2025-12-01", admin: "Prof. Amara Obi", activeToday: 27,
    pinnedPost: "Forum Guidelines & Code of Conduct"
  },
];

const MAX_MEMBERS = Math.max(...groups.map(g => g.members));

const activityConfig = {
  hot:     { label: "HOT",     icon: Flame,      cls: "text-warning bg-warning/10" },
  active:  { label: "Active",  icon: TrendingUp,  cls: "text-emerald-brand bg-emerald-muted" },
  growing: { label: "Growing", icon: TrendingUp,  cls: "text-info bg-info/10" },
  new:     { label: "New",     icon: Sparkles,    cls: "text-gold bg-gold-muted" },
} as const;

type TabKey = "all" | "joined" | "discover";
type SortKey = "members" | "posts" | "activity" | "name";

const Groups = () => {
  const [joined, setJoined] = useState<Set<string>>(new Set(["Computational Neuroscience Lab"]));
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [notified, setNotified] = useState<Set<string>>(new Set(["Computational Neuroscience Lab"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("members");
  const [filterType, setFilterType] = useState<"all" | "public" | "private">("all");

  const toggleJoin = (name: string) => {
    setJoined(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        toast.info(`Left ${name}`);
      } else {
        next.add(name);
        toast.success(`Joined ${name}`);
      }
      return next;
    });
  };

  const toggleBookmark = (name: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); toast.info("Removed from saved"); }
      else { next.add(name); toast.success("Saved for later"); }
      return next;
    });
  };

  const toggleNotify = (name: string) => {
    setNotified(prev => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); toast.info("Notifications off"); }
      else { next.add(name); toast.success("Notifications on"); }
      return next;
    });
  };

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filteredGroups = useMemo(() => {
    let result = [...groups];

    // Tab filter
    if (activeTab === "joined") result = result.filter(g => joined.has(g.name));
    if (activeTab === "discover") result = result.filter(g => !joined.has(g.name));

    // Type filter
    if (filterType !== "all") result = result.filter(g => g.type === filterType);

    // Search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.topics.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "members": return b.members - a.members;
        case "posts": return b.posts - a.posts;
        case "name": return a.name.localeCompare(b.name);
        case "activity": return b.activeToday - a.activeToday;
        default: return 0;
      }
    });

    return result;
  }, [debouncedSearch, activeTab, sortBy, filterType, joined]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "All Groups", count: groups.length },
    { key: "joined", label: "My Groups", count: joined.size },
    { key: "discover", label: "Discover", count: groups.length - joined.size },
  ];

  const totalMembers = groups.reduce((s, g) => s + g.members, 0);
  const totalPosts = groups.reduce((s, g) => s + g.posts, 0);
  const activeGroupsToday = groups.filter(g => g.activeToday > 0).length;

  // Aggregate topics for sidebar
  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    groups.forEach(g => g.topics.forEach(t => { map[t] = (map[t] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <AppLayout>
      <div className="flex gap-6 max-w-7xl">
        {/* ═══ Main Column ═══ */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[27px] font-serif font-bold text-foreground mb-1">Research Groups</h1>
              <p className="text-muted-foreground font-display text-sm">Collaborate with peers in focused scientific communities.</p>
            </div>
            <button
              onClick={() => toast.info("Create Group dialog coming soon")}
              className="h-9 px-4 rounded-xl gradient-gold text-accent-foreground font-display font-semibold text-sm flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Create Group
            </button>
          </motion.div>

          {/* KPI Row */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Your Groups", value: joined.size, icon: Users },
              { label: "Total Members", value: totalMembers.toLocaleString(), icon: Globe },
              { label: "Total Posts", value: totalPosts.toLocaleString(), icon: MessageSquare },
              { label: "Active Today", value: activeGroupsToday, icon: Flame },
            ].map(s => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[22px] font-display font-bold text-foreground leading-tight">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground font-display">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Tabs + Search + Sort Row */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5 space-y-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1 w-fit">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-display font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === t.key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === t.key ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
                  }`}>{t.count}</span>
                </button>
              ))}
            </div>

            {/* Search + Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups by name, description, or topic..."
                  className="w-full h-9 pl-9 pr-4 rounded-xl bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Type filter chips */}
              <div className="flex items-center gap-1">
                {(["all", "public", "private"] as const).map(ft => (
                  <button
                    key={ft}
                    onClick={() => setFilterType(ft)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-display font-semibold transition-all flex items-center gap-1 ${
                      filterType === ft
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-muted-foreground hover:bg-secondary border border-transparent"
                    }`}
                  >
                    {ft === "public" && <Globe className="w-3 h-3" />}
                    {ft === "private" && <Lock className="w-3 h-3" />}
                    {ft === "all" && <Filter className="w-3 h-3" />}
                    {ft === "all" ? "All" : ft.charAt(0).toUpperCase() + ft.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="h-9 pl-7 pr-3 rounded-xl bg-card border border-border text-[11px] font-display font-semibold text-muted-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="members">Most Members</option>
                  <option value="posts">Most Posts</option>
                  <option value="activity">Most Active</option>
                  <option value="name">Alphabetical</option>
                </select>
                <ArrowUpDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* Group Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground font-display text-[13px]">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No groups found matching your criteria.
              </div>
            )}

            {filteredGroups.map((group, i) => {
              const actCfg = activityConfig[group.activity];
              const ActIcon = actCfg.icon;
              const isExpanded = expandedGroup === group.name;
              const isMember = joined.has(group.name);
              const isSaved = bookmarked.has(group.name);
              const isNotified = notified.has(group.name);

              return (
                <motion.div
                  key={group.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-xl border border-border hover:border-accent/20 transition-all flex flex-col"
                >
                  {/* Card Header */}
                  <div
                    className="p-5 cursor-pointer flex-1 flex flex-col"
                    onClick={() => setExpandedGroup(isExpanded ? null : group.name)}
                  >
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className={`w-12 h-12 rounded-xl ${group.color} flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0`}>
                        {group.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {group.type === "private" ? (
                            <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-display font-medium ${actCfg.cls}`}>
                            <ActIcon className="w-3 h-3" /> {actCfg.label}
                          </span>
                          {isMember && (
                            <Badge variant="secondary" className="text-[11px] px-2 py-0.5 font-display font-medium rounded-full">Member</Badge>
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-foreground text-[15px] line-clamp-1">
                          {group.name}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-[13px] text-muted-foreground line-clamp-2 mb-3 flex-1">{group.description}</p>

                    {/* Member popularity bar */}
                    <div className="mb-3">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(group.members / MAX_MEMBERS) * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.2 + i * 0.04, ease: "easeOut" }}
                          className={`h-full rounded-full ${group.color}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-display min-w-0">
                        <span className="flex items-center gap-1.5 whitespace-nowrap"><Users className="w-3.5 h-3.5" /> {group.members.toLocaleString()}</span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap"><MessageSquare className="w-3.5 h-3.5" /> {group.posts.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(group.name); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                          title={isSaved ? "Remove from saved" : "Save for later"}
                        >
                          {isSaved
                            ? <BookmarkCheck className="w-4 h-4 text-accent" />
                            : <Bookmark className="w-4 h-4 text-muted-foreground" />
                          }
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleJoin(group.name); }}
                          className={`text-[13px] font-display font-medium h-8 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
                            isMember
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-accent text-accent-foreground hover:opacity-90"
                          }`}
                        >
                          {isMember ? <><Check className="w-3.5 h-3.5" /> Joined</> : <><UserPlus className="w-3.5 h-3.5" /> Join</>}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                          {/* Recent activity */}
                          <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
                            <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-display font-medium text-foreground">Recent Activity</p>
                              <p className="text-[11px] text-muted-foreground">{group.recentActivity}</p>
                            </div>
                          </div>

                          {/* Pinned post */}
                          <div className="flex items-start gap-2 bg-gold-muted rounded-xl p-3">
                            <FileText className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-display font-medium text-foreground">Pinned Post</p>
                              <p className="text-[11px] text-muted-foreground">{group.pinnedPost}</p>
                            </div>
                          </div>

                          {/* Topics */}
                          <div>
                            <p className="text-[11px] font-display font-semibold text-muted-foreground mb-1.5">Topics</p>
                            <div className="flex flex-wrap gap-1.5">
                              {group.topics.map(t => (
                                <span key={t} className="text-[10px] font-display font-medium px-2 py-0.5 rounded-full bg-secondary text-foreground flex items-center gap-1">
                                  <Hash className="w-2.5 h-2.5" />{t}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Meta info */}
                          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display">
                            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Admin: {group.admin}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Founded {new Date(group.founded).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => toast.info(`Opening ${group.name}...`)}
                              className="h-8 px-3 rounded-xl bg-accent text-accent-foreground text-xs font-display font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                            >
                              <ExternalLink className="w-3 h-3" /> Open Group
                            </button>
                            <button
                              onClick={() => { navigator.clipboard.writeText(`https://thinkhub.dev/groups/${group.name.toLowerCase().replace(/\s+/g, '-')}`); toast.success("Link copied"); }}
                              className="h-8 px-3 rounded-xl border border-border text-xs font-display font-semibold text-muted-foreground flex items-center gap-1.5 hover:bg-secondary transition-colors"
                            >
                              <Share2 className="w-3 h-3" /> Share
                            </button>
                            {isMember && (
                              <button
                                onClick={() => toggleNotify(group.name)}
                                className={`h-8 px-3 rounded-xl border border-border text-xs font-display font-semibold flex items-center gap-1.5 transition-colors ${
                                  isNotified ? "text-accent bg-accent/5" : "text-muted-foreground hover:bg-secondary"
                                }`}
                              >
                                {isNotified ? <><Bell className="w-3 h-3" /> Notified</> : <><BellOff className="w-3 h-3" /> Muted</>}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ═══ Sidebar ═══ */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="w-72 flex-shrink-0 space-y-4 hidden lg:block"
        >
          {/* Your Activity */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" /> Your Activity
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Groups Joined", value: joined.size, max: groups.length },
                { label: "Groups Saved", value: bookmarked.size, max: groups.length },
                { label: "Notifications On", value: notified.size, max: joined.size || 1 },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-[11px] font-display mb-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(s.value / s.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-warning" /> Popular Topics
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {topicCounts.map(([topic, count]) => (
                <button
                  key={topic}
                  onClick={() => setSearchQuery(topic)}
                  className="text-[10px] font-display font-medium px-2 py-1 rounded-full bg-secondary hover:bg-accent/10 hover:text-accent text-foreground transition-colors flex items-center gap-1"
                >
                  <Hash className="w-2.5 h-2.5" />{topic}
                  <span className="text-muted-foreground">({count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top Groups */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-gold" /> Most Popular
            </h3>
            <div className="space-y-2">
              {[...groups].sort((a, b) => b.members - a.members).slice(0, 4).map((g, idx) => (
                <div key={g.name} className="flex items-center gap-2.5">
                  <span className="text-[10px] font-display font-bold text-muted-foreground w-4 text-right">{idx + 1}</span>
                  <div className={`w-7 h-7 rounded-xl ${g.color} flex items-center justify-center text-white text-[10px] font-display font-bold flex-shrink-0`}>
                    {g.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-display font-semibold text-foreground truncate">{g.name}</p>
                    <p className="text-[10px] text-muted-foreground">{g.members.toLocaleString()} members</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-accent/5 rounded-xl border border-accent/10 p-4">
            <h3 className="font-display font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Quick Tips
            </h3>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground font-display">
              <li className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-accent" />Click a group card to see details, pinned posts, and actions</li>
              <li className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-accent" />Use topic chips to quickly filter by research area</li>
              <li className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-accent" />Save groups to revisit them later from your dashboard</li>
            </ul>
          </div>
        </motion.aside>
      </div>
    </AppLayout>
  );
};

export default Groups;
