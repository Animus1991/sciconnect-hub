import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Users, MapPin, BookOpen, Award, ExternalLink, Check, TrendingUp, Globe, Filter, MessageSquare, UserCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";

const researchers = [
  { id: "r1", name: "Dr. Elena Vasquez", institution: "MIT", location: "Cambridge, MA", field: "Cognitive Science", hIndex: 28, papers: 47, followers: 312, initials: "EV", expertise: ["Neuroscience", "fMRI", "Cognitive Load"], trending: true, trendingReason: "3 papers published this month, +120% citation growth", mutualConnections: 4 },
  { id: "r2", name: "Prof. Marcus Chen", institution: "Stanford", location: "Palo Alto, CA", field: "AI & Machine Learning", hIndex: 41, papers: 83, followers: 1240, initials: "MC", expertise: ["Deep Learning", "NLP", "Interpretability"], trending: true, trendingReason: "Featured in Nature AI, top 1% cited researcher", mutualConnections: 7 },
  { id: "r3", name: "Dr. Amara Osei", institution: "Oxford", location: "Oxford, UK", field: "Philosophy of Science", hIndex: 15, papers: 29, followers: 178, initials: "AO", expertise: ["Epistemology", "Methodology"], trending: false, trendingReason: "", mutualConnections: 2 },
  { id: "r4", name: "Dr. Yuki Tanaka", institution: "University of Tokyo", location: "Tokyo, Japan", field: "Computational Biology", hIndex: 33, papers: 61, followers: 892, initials: "YT", expertise: ["Bioinformatics", "Genomics", "ML"], trending: true, trendingReason: "Breakthrough paper on protein folding, 50+ citations in 2 weeks", mutualConnections: 3 },
  { id: "r5", name: "Prof. Sofia Reyes", institution: "Universitat de Barcelona", location: "Barcelona, Spain", field: "Behavioral Economics", hIndex: 22, papers: 38, followers: 445, initials: "SR", expertise: ["Decision Theory", "Psychology"], trending: false, trendingReason: "", mutualConnections: 1 },
  { id: "r6", name: "Dr. James Okafor", institution: "University of Cambridge", location: "Cambridge, UK", field: "Climate Science", hIndex: 31, papers: 52, followers: 673, initials: "JO", expertise: ["Climate Modeling", "Earth Systems"], trending: false, trendingReason: "", mutualConnections: 5 },
  { id: "r7", name: "Dr. Lisa Park", institution: "Caltech", location: "Pasadena, CA", field: "Quantum Computing", hIndex: 19, papers: 24, followers: 534, initials: "LP", expertise: ["Quantum Algorithms", "Error Correction"], trending: true, trendingReason: "Invited keynote at QIP 2026, new quantum advantage paper", mutualConnections: 0 },
  { id: "r8", name: "Prof. Omar Hassan", institution: "ETH Zürich", location: "Zürich, Switzerland", field: "Bioethics", hIndex: 26, papers: 44, followers: 389, initials: "OH", expertise: ["Ethics", "SynBio", "Policy"], trending: false, trendingReason: "", mutualConnections: 2 },
];

const institutions = [
  { name: "MIT", researchers: 342, papers: "12.4K", country: "USA" },
  { name: "Stanford University", researchers: 289, papers: "10.8K", country: "USA" },
  { name: "University of Oxford", researchers: 267, papers: "9.6K", country: "UK" },
  { name: "ETH Zürich", researchers: 198, papers: "7.2K", country: "Switzerland" },
  { name: "University of Tokyo", researchers: 234, papers: "8.9K", country: "Japan" },
];

type SortMode = "followers" | "hIndex" | "papers";

function CommunitySkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="space-y-2 mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <Skeleton className="w-4 h-4 mb-2" />
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-72 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [instSearchQuery, setInstSearchQuery] = useState("");
  const [following, setFollowing] = useState<Set<string>>(new Set(["r2"]));
  const [sortMode, setSortMode] = useState<SortMode>("followers");
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const toggleFollow = (id: string, name: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info(`Unfollowed ${name}`);
      } else {
        next.add(id);
        toast.success(`Now following ${name}`);
      }
      return next;
    });
  };

  const handleMessage = (name: string) => {
    toast.success(`Opening conversation with ${name}...`);
  };

  const debouncedSearch = useDebounce(searchQuery, 250);
  const debouncedInstSearch = useDebounce(instSearchQuery, 250);
  const allFields = useMemo(() => Array.from(new Set(researchers.map(r => r.field))), []);

  const filteredResearchers = useMemo(() => {
    let result = researchers;
    if (fieldFilter) result = result.filter(r => r.field === fieldFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.institution.toLowerCase().includes(q) ||
        r.field.toLowerCase().includes(q) ||
        r.expertise.some(e => e.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      if (sortMode === "followers") return b.followers - a.followers;
      if (sortMode === "hIndex") return b.hIndex - a.hIndex;
      return b.papers - a.papers;
    });
  }, [debouncedSearch, sortMode, fieldFilter]);

  const filteredInstitutions = useMemo(() => {
    if (!debouncedInstSearch.trim()) return institutions;
    const q = debouncedInstSearch.toLowerCase();
    return institutions.filter(i =>
      i.name.toLowerCase().includes(q) || i.country.toLowerCase().includes(q)
    );
  }, [debouncedInstSearch]);

  if (isLoading) {
    return <AppLayout><CommunitySkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Community</h1>
                <p className="text-sm text-muted-foreground font-display mt-1">
                  Discover researchers, institutions, and collaborators across disciplines
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Researchers", value: "8,920", icon: Users, color: "text-foreground" },
              { label: "Institutions", value: "340+", icon: Globe, color: "text-accent" },
              { label: "Following", value: String(following.size), icon: Check, color: "text-emerald-brand" },
              { label: "Trending", value: String(researchers.filter(r => r.trending).length), icon: TrendingUp, color: "text-gold" },
            ].map(s => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-4">
                <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
                <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* People You May Know - AI Section */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card rounded-xl border border-accent/20 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <h3 className="font-display font-semibold text-sm text-foreground">People You May Know</h3>
              <span className="text-[9px] text-muted-foreground font-display ml-auto">Based on your research interests</span>
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
                      <p className="text-[9px] text-accent">{r.mutualConnections} mutual</p>
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

          <Tabs defaultValue="researchers">
            <TabsList className="bg-secondary border border-border mb-6">
              <TabsTrigger value="researchers" className="font-display text-sm">Researchers</TabsTrigger>
              <TabsTrigger value="institutions" className="font-display text-sm">Institutions</TabsTrigger>
              <TabsTrigger value="following" className="font-display text-sm">Following</TabsTrigger>
            </TabsList>

            <TabsContent value="researchers">
              {/* Search + Sort + Field Filter */}
              <div className="flex items-center gap-3 mb-4">
                <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, institution, or field..." className="flex-1" />
                <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                  {(["followers", "hIndex", "papers"] as SortMode[]).map(mode => (
                    <button key={mode} onClick={() => setSortMode(mode)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-display transition-all capitalize ${sortMode === mode ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      {mode === "hIndex" ? "h-index" : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field filter pills */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <button onClick={() => setFieldFilter(null)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${!fieldFilter ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                  All Fields
                </button>
                {allFields.map(field => (
                  <button key={field} onClick={() => setFieldFilter(fieldFilter === field ? null : field)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${fieldFilter === field ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                    {field}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredResearchers.length === 0 ? (
                  <EmptyState icon={Users} title="No researchers found" description="No researchers match your search criteria" />
                ) : filteredResearchers.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 hover:shadow-scholarly transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-sm font-semibold">{r.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">{r.name}</h3>
                          {r.trending && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-[9px] font-display text-gold border-gold/30 bg-gold-muted flex items-center gap-0.5 cursor-help">
                                  <TrendingUp className="w-2.5 h-2.5" /> Trending
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[240px] text-xs">
                                <p className="font-display">{r.trendingReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-display mb-1">{r.field}</p>
                        <p className="text-xs text-muted-foreground font-display flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" /> {r.institution} · {r.location}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex gap-1.5">
                            {r.expertise.map(e => (
                              <Badge key={e} variant="secondary" className="text-[10px] font-display">{e}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display ml-auto">
                            {r.mutualConnections > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center gap-1 text-accent cursor-help">
                                    <UserCheck className="w-3 h-3" /> {r.mutualConnections} mutual
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <p className="font-display">{r.mutualConnections} mutual connections in your network</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <span className="flex items-center gap-1"><Award className="w-3 h-3 text-accent" /> h-{r.hIndex}</span>
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {r.papers}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.followers.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); toggleFollow(r.id, r.name); }}
                          className={`h-8 px-3 rounded-lg text-xs font-display font-semibold transition-all flex items-center gap-1 ${
                            following.has(r.id) ? "bg-success/10 text-success" : "bg-accent text-accent-foreground hover:opacity-90"
                          }`}>
                          {following.has(r.id) ? <><Check className="w-3 h-3" /> Following</> : "Follow"}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleMessage(r.name); }}
                          className="h-8 px-3 rounded-lg text-xs font-display font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Message
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="institutions">
              {/* Institution search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={instSearchQuery} onChange={(e) => setInstSearchQuery(e.target.value)}
                  placeholder="Search institutions by name or country..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="space-y-3">
                {filteredInstitutions.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Globe className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground font-display">No institutions match your search</p>
                  </div>
                ) : filteredInstitutions.map((inst, i) => (
                  <motion.div key={inst.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-scholarly flex items-center justify-center text-primary-foreground font-display font-bold text-sm flex-shrink-0">
                        {inst.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">{inst.name}</h3>
                        <p className="text-xs text-muted-foreground font-display flex items-center gap-1"><Globe className="w-3 h-3" /> {inst.country}</p>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-muted-foreground font-display">
                        <div className="text-center">
                          <p className="text-lg font-display font-bold text-foreground">{inst.researchers}</p>
                          <p className="text-[10px]">Researchers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-display font-bold text-foreground">{inst.papers}</p>
                          <p className="text-[10px]">Papers</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="following">
              {following.size === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-display font-semibold text-foreground mb-2">Not following anyone yet</h3>
                  <p className="text-sm text-muted-foreground font-display max-w-md mx-auto">Browse researchers and follow them to stay updated on their latest publications and activity.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {researchers.filter(r => following.has(r.id)).map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-xs font-semibold">{r.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-display font-semibold text-foreground text-sm">{r.name}</h3>
                          <p className="text-[11px] text-muted-foreground font-display">{r.institution} · {r.field}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleMessage(r.name); }}
                          className="h-8 px-3 rounded-lg text-xs font-display font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Message
                        </button>
                        <button onClick={() => toggleFollow(r.id, r.name)}
                          className="text-xs font-display font-semibold text-success flex items-center gap-1 px-3 py-1 rounded-lg bg-success/10 hover:bg-success/20 transition-colors">
                          <Check className="w-3 h-3" /> Following
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default Community;
