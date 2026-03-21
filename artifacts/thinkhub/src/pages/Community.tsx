import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, MapPin, BookOpen, Award, ExternalLink, Check, TrendingUp, Globe,
  MessageSquare, UserCheck, Sparkles, Search, X, ChevronDown, Mail,
  GraduationCap, Star, Building2, Activity, Filter, BarChart3, Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";

// ─── Data ───
const researchers = [
  { id: "r1", name: "Dr. Elena Vasquez", institution: "MIT", location: "Cambridge, MA", field: "Cognitive Science", hIndex: 28, papers: 47, citations: 1840, followers: 312, initials: "EV", expertise: ["Neuroscience", "fMRI", "Cognitive Load"], trending: true, trendingReason: "3 papers published this month, +120% citation growth", mutualConnections: 4, recentActivity: "Published in Nature Neuroscience" },
  { id: "r2", name: "Prof. Marcus Chen", institution: "Stanford", location: "Palo Alto, CA", field: "AI & Machine Learning", hIndex: 41, papers: 83, citations: 5620, followers: 1240, initials: "MC", expertise: ["Deep Learning", "NLP", "Interpretability"], trending: true, trendingReason: "Featured in Nature AI, top 1% cited researcher", mutualConnections: 7, recentActivity: "Keynote at NeurIPS 2026" },
  { id: "r3", name: "Dr. Amara Osei", institution: "Oxford", location: "Oxford, UK", field: "Philosophy of Science", hIndex: 15, papers: 29, citations: 420, followers: 178, initials: "AO", expertise: ["Epistemology", "Methodology"], trending: false, trendingReason: "", mutualConnections: 2, recentActivity: "New book chapter on scientific realism" },
  { id: "r4", name: "Dr. Yuki Tanaka", institution: "University of Tokyo", location: "Tokyo, Japan", field: "Computational Biology", hIndex: 33, papers: 61, citations: 3210, followers: 892, initials: "YT", expertise: ["Bioinformatics", "Genomics", "ML"], trending: true, trendingReason: "Breakthrough paper on protein folding, 50+ citations in 2 weeks", mutualConnections: 3, recentActivity: "Shared dataset on protein structures" },
  { id: "r5", name: "Prof. Sofia Reyes", institution: "Universitat de Barcelona", location: "Barcelona, Spain", field: "Behavioral Economics", hIndex: 22, papers: 38, citations: 1120, followers: 445, initials: "SR", expertise: ["Decision Theory", "Psychology"], trending: false, trendingReason: "", mutualConnections: 1, recentActivity: "Grant awarded from EU Horizon" },
  { id: "r6", name: "Dr. James Okafor", institution: "University of Cambridge", location: "Cambridge, UK", field: "Climate Science", hIndex: 31, papers: 52, citations: 2890, followers: 673, initials: "JO", expertise: ["Climate Modeling", "Earth Systems"], trending: false, trendingReason: "", mutualConnections: 5, recentActivity: "IPCC report contribution" },
  { id: "r7", name: "Dr. Lisa Park", institution: "Caltech", location: "Pasadena, CA", field: "Quantum Computing", hIndex: 19, papers: 24, citations: 780, followers: 534, initials: "LP", expertise: ["Quantum Algorithms", "Error Correction"], trending: true, trendingReason: "Invited keynote at QIP 2026, new quantum advantage paper", mutualConnections: 0, recentActivity: "Preprint on quantum error correction" },
  { id: "r8", name: "Prof. Omar Hassan", institution: "ETH Zürich", location: "Zürich, Switzerland", field: "Bioethics", hIndex: 26, papers: 44, citations: 1560, followers: 389, initials: "OH", expertise: ["Ethics", "SynBio", "Policy"], trending: false, trendingReason: "", mutualConnections: 2, recentActivity: "Policy brief on gene editing" },
];

const institutions = [
  { name: "MIT", researchers: 342, papers: "12.4K", country: "USA", rank: 1, fields: ["AI", "Physics", "Biology"] },
  { name: "Stanford University", researchers: 289, papers: "10.8K", country: "USA", rank: 2, fields: ["CS", "Medicine", "Economics"] },
  { name: "University of Oxford", researchers: 267, papers: "9.6K", country: "UK", rank: 3, fields: ["Philosophy", "Medicine", "Law"] },
  { name: "ETH Zürich", researchers: 198, papers: "7.2K", country: "Switzerland", rank: 4, fields: ["Engineering", "Physics", "CS"] },
  { name: "University of Tokyo", researchers: 234, papers: "8.9K", country: "Japan", rank: 5, fields: ["Biology", "Physics", "Engineering"] },
];

type SortMode = "followers" | "hIndex" | "papers" | "citations";
type TabId = "researchers" | "institutions" | "following";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [instSearchQuery, setInstSearchQuery] = useState("");
  const [following, setFollowing] = useState<Set<string>>(new Set(["r2"]));
  const [sortMode, setSortMode] = useState<SortMode>("followers");
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("researchers");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleFollow = useCallback((id: string, name: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info(`Unfollowed ${name}`); }
      else { next.add(id); toast.success(`Now following ${name}`); }
      return next;
    });
  }, []);

  const handleMessage = useCallback((name: string) => {
    toast.success(`Opening conversation with ${name}...`);
  }, []);

  const debouncedSearch = useDebounce(searchQuery, 250);
  const debouncedInstSearch = useDebounce(instSearchQuery, 250);
  const allFields = useMemo(() => Array.from(new Set(researchers.map(r => r.field))), []);

  const filteredResearchers = useMemo(() => {
    let result = researchers;
    if (activeTab === "following") result = result.filter(r => following.has(r.id));
    if (fieldFilter) result = result.filter(r => r.field === fieldFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) || r.institution.toLowerCase().includes(q) ||
        r.field.toLowerCase().includes(q) || r.expertise.some(e => e.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      if (sortMode === "citations") return b.citations - a.citations;
      if (sortMode === "hIndex") return b.hIndex - a.hIndex;
      if (sortMode === "papers") return b.papers - a.papers;
      return b.followers - a.followers;
    });
  }, [debouncedSearch, sortMode, fieldFilter, following, activeTab]);

  const filteredInstitutions = useMemo(() => {
    if (!debouncedInstSearch.trim()) return institutions;
    const q = debouncedInstSearch.toLowerCase();
    return institutions.filter(i => i.name.toLowerCase().includes(q) || i.country.toLowerCase().includes(q));
  }, [debouncedInstSearch]);

  // Stats
  const trendingCount = researchers.filter(r => r.trending).length;
  const totalFollowers = researchers.reduce((s, r) => s + r.followers, 0);

  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "researchers", label: "Researchers", icon: Users, count: researchers.length },
    { id: "institutions", label: "Institutions", icon: Building2, count: institutions.length },
    { id: "following", label: "Following", icon: Heart, count: following.size },
  ];

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Community</h1>
                <p className="text-sm text-muted-foreground font-display mt-1">
                  Discover researchers, institutions, and collaborators across disciplines
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5">
                <Globe className="w-3.5 h-3.5 text-accent" />
                {researchers.length.toLocaleString()} Researchers
              </Badge>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* ─── Main Column ─── */}
            <div className="space-y-5 min-w-0">
              {/* KPI Row */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  { label: "Researchers", value: "8,920", icon: Users, accent: true },
                  { label: "Institutions", value: "340+", icon: Building2 },
                  { label: "Following", value: following.size.toString(), icon: Heart },
                  { label: "Trending", value: trendingCount.toString(), icon: TrendingUp },
                ].map((s, i) => (
                  <div key={s.label} className={`rounded-xl border p-4 ${s.accent ? "bg-accent/5 border-accent/20" : "bg-card border-border"}`}>
                    <s.icon className={`w-4 h-4 mb-2 ${s.accent ? "text-accent" : "text-muted-foreground"}`} />
                    <p className="text-[26px] font-display font-bold text-foreground">{s.value}</p>
                    <p className="text-[12px] text-muted-foreground font-display uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* People You May Know */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="bg-card rounded-xl border border-accent/20 p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-semibold text-sm text-foreground">People You May Know</h3>
                  <span className="text-[9px] text-muted-foreground font-display ml-auto">Based on your research</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {researchers.filter(r => !following.has(r.id)).slice(0, 3).map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-xs font-semibold">{r.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-medium text-foreground truncate">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{r.field}</p>
                        {r.mutualConnections > 0 && (
                          <p className="text-[9px] text-accent flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5" /> {r.mutualConnections} mutual
                          </p>
                        )}
                      </div>
                      <button onClick={() => toggleFollow(r.id, r.name)}
                        className="text-[10px] font-display font-semibold text-accent hover:underline shrink-0">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Tab Navigation */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-1 bg-secondary rounded-xl border border-border p-1 mb-4">
                  {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">{tab.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── Researchers / Following Tab ── */}
                {(activeTab === "researchers" || activeTab === "following") && (
                  <div>
                    {/* Search + Sort */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search by name, institution, expertise…"
                          className="w-full h-9 pl-9 pr-8 text-xs font-display bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted-foreground"
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg p-0.5">
                        {(["followers", "hIndex", "papers", "citations"] as SortMode[]).map(mode => (
                          <button key={mode} onClick={() => setSortMode(mode)}
                            className={`px-2 py-1.5 rounded-md text-[11px] font-display transition-colors ${
                              sortMode === mode ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}>
                            {mode === "hIndex" ? "h-index" : mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Field filter pills */}
                    {activeTab === "researchers" && (
                      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
                        <button onClick={() => setFieldFilter(null)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-display font-medium transition-colors whitespace-nowrap ${
                            !fieldFilter ? "bg-accent/10 border-accent/30 text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
                          }`}>
                          All Fields
                        </button>
                        {allFields.map(field => (
                          <button key={field} onClick={() => setFieldFilter(fieldFilter === field ? null : field)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-display font-medium transition-colors whitespace-nowrap ${
                              fieldFilter === field ? "bg-accent/10 border-accent/30 text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
                            }`}>
                            {field}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Researcher List */}
                    {filteredResearchers.length === 0 ? (
                      <EmptyState
                        icon={Users}
                        title={activeTab === "following" ? "Not following anyone yet" : "No researchers found"}
                        description={activeTab === "following" ? "Follow researchers to see them here" : "Try a different search or filter"}
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                        {filteredResearchers.map((r, i) => {
                          const isExpanded = expandedCard === r.id;
                          return (
                            <motion.div
                              key={r.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className={`bg-card rounded-xl border p-4 transition-colors cursor-pointer ${
                                isExpanded ? "border-accent/30" : "border-border hover:border-accent/20"
                              }`}
                              onClick={() => setExpandedCard(isExpanded ? null : r.id)}
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="w-11 h-11 flex-shrink-0">
                                  <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-sm font-semibold">{r.initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-display font-semibold text-sm text-foreground">{r.name}</h3>
                                    {r.trending && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge variant="outline" className="text-[8px] font-display text-gold border-gold/30 bg-gold/5 gap-0.5 cursor-help">
                                            <TrendingUp className="w-2.5 h-2.5" /> Trending
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[220px] text-xs font-display">
                                          {r.trendingReason}
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {following.has(r.id) && (
                                      <Badge variant="outline" className="text-[8px] text-success border-success/30 bg-success/5">Following</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-display flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" /> {r.institution} · {r.location}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-display flex-wrap">
                                    <span className="flex items-center gap-1"><Award className="w-3 h-3 text-accent" /> h-{r.hIndex}</span>
                                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {r.papers} papers</span>
                                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {r.citations.toLocaleString()} citations</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.followers.toLocaleString()}</span>
                                    {r.mutualConnections > 0 && (
                                      <span className="flex items-center gap-1 text-accent">
                                        <UserCheck className="w-3 h-3" /> {r.mutualConnections} mutual
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button onClick={(e) => { e.stopPropagation(); toggleFollow(r.id, r.name); }}
                                    className={`h-8 px-3 rounded-lg text-xs font-display font-semibold transition-colors flex items-center gap-1 ${
                                      following.has(r.id) ? "bg-success/10 text-success hover:bg-success/20" : "bg-accent text-accent-foreground hover:opacity-90"
                                    }`}>
                                    {following.has(r.id) ? <><Check className="w-3 h-3" /> Following</> : "Follow"}
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleMessage(r.name); }}
                                    className="h-8 w-8 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors flex items-center justify-center">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </div>
                              </div>

                              {/* Expanded detail */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-3 mt-3 border-t border-border/50">
                                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                        {r.expertise.map(e => (
                                          <Badge key={e} variant="secondary" className="text-[10px] font-display">{e}</Badge>
                                        ))}
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="p-2.5 rounded-lg bg-secondary/50">
                                          <p className="text-[9px] text-muted-foreground font-display uppercase mb-0.5">Field</p>
                                          <p className="text-xs font-display font-medium text-foreground">{r.field}</p>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-secondary/50">
                                          <p className="text-[9px] text-muted-foreground font-display uppercase mb-0.5">Recent Activity</p>
                                          <p className="text-xs font-display font-medium text-foreground">{r.recentActivity}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="text-[10px] font-display gap-1 h-7">
                                          <ExternalLink className="w-3 h-3" /> View Profile
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-[10px] font-display gap-1 h-7" onClick={(e) => { e.stopPropagation(); handleMessage(r.name); }}>
                                          <Mail className="w-3 h-3" /> Send Email
                                        </Button>
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
                )}

                {/* ── Institutions Tab ── */}
                {activeTab === "institutions" && (
                  <div>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={instSearchQuery}
                        onChange={e => setInstSearchQuery(e.target.value)}
                        placeholder="Search institutions…"
                        className="w-full h-9 pl-9 pr-8 text-xs font-display bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-foreground placeholder:text-muted-foreground"
                      />
                      {instSearchQuery && (
                        <button onClick={() => setInstSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    {filteredInstitutions.length === 0 ? (
                      <EmptyState icon={Globe} title="No institutions found" description="Try a different search" />
                    ) : (
                      <div className="space-y-2.5">
                        {filteredInstitutions.map((inst, i) => (
                          <motion.div key={inst.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="bg-card rounded-xl border border-border p-4 hover:border-accent/20 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-scholarly flex items-center justify-center text-primary-foreground font-display font-bold text-sm flex-shrink-0">
                                {inst.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-display font-semibold text-sm text-foreground group-hover:text-accent transition-colors">{inst.name}</h3>
                                  <span className="text-[9px] font-display text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">#{inst.rank}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground font-display flex items-center gap-1 mt-0.5">
                                  <Globe className="w-3 h-3" /> {inst.country}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  {inst.fields.map(f => (
                                    <Badge key={f} variant="secondary" className="text-[9px] font-display py-0">{f}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-xs text-muted-foreground font-display flex-shrink-0">
                                <div className="text-center">
                                  <p className="text-lg font-display font-bold text-foreground">{inst.researchers}</p>
                                  <p className="text-[9px] uppercase">Researchers</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-display font-bold text-foreground">{inst.papers}</p>
                                  <p className="text-[9px] uppercase">Papers</p>
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-4">
              {/* Your Network */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h4 className="font-serif text-sm font-semibold text-foreground mb-3">Your Network</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-muted-foreground">Following</span>
                    <span className="font-bold text-foreground">{following.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-muted-foreground">Mutual Connections</span>
                    <span className="font-bold text-foreground">
                      {researchers.filter(r => following.has(r.id)).reduce((s, r) => s + r.mutualConnections, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-muted-foreground">Fields Covered</span>
                    <span className="font-bold text-foreground">
                      {new Set(researchers.filter(r => following.has(r.id)).map(r => r.field)).size}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Trending Researchers */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-gold" />
                  <h4 className="font-serif text-sm font-semibold text-foreground">Trending</h4>
                </div>
                <div className="space-y-2">
                  {researchers.filter(r => r.trending).map(r => (
                    <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => { setActiveTab("researchers"); setExpandedCard(r.id); }}
                    >
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-[9px] font-semibold">{r.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-display font-medium text-foreground truncate">{r.name}</p>
                        <p className="text-[9px] text-muted-foreground font-display truncate">{r.field}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Fields */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h4 className="font-serif text-sm font-semibold text-foreground mb-3">Fields</h4>
                <div className="space-y-1.5">
                  {allFields.map(field => {
                    const count = researchers.filter(r => r.field === field).length;
                    return (
                      <button key={field} onClick={() => { setFieldFilter(fieldFilter === field ? null : field); setActiveTab("researchers"); }}
                        className={`flex items-center justify-between w-full p-2 rounded-lg text-xs font-display transition-colors ${
                          fieldFilter === field ? "bg-accent/10 text-accent" : "hover:bg-secondary/50 text-foreground"
                        }`}
                      >
                        <span className="truncate">{field}</span>
                        <span className="text-muted-foreground font-bold ml-2">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Top Institutions Preview */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h4 className="font-serif text-sm font-semibold text-foreground mb-3">Top Institutions</h4>
                <div className="space-y-2">
                  {institutions.slice(0, 4).map(inst => (
                    <div key={inst.name} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-1.5 rounded-lg transition-colors"
                      onClick={() => setActiveTab("institutions")}
                    >
                      <span className="text-[9px] font-display font-bold text-muted-foreground w-4">#{inst.rank}</span>
                      <span className="text-xs font-display font-medium text-foreground truncate flex-1">{inst.name}</span>
                      <span className="text-[10px] font-display text-muted-foreground">{inst.researchers}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Tips */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h4 className="font-serif text-sm font-semibold text-foreground mb-2">Grow Your Network</h4>
                <ul className="space-y-1.5 text-[10px] font-display text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Follow researchers to get updates on new publications</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Use field filters to discover specialists in your area</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Check mutual connections for warm introductions</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default Community;
