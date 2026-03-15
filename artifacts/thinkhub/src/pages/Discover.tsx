import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, BookOpen, Users, Database, Code, ArrowRight, Flame, Atom, Brain, Dna, Globe, FlaskConical, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompatibilityScore, ResearcherCard } from "@/components/discover/CompatibilityScore";
import { CuratedCollections } from "@/components/discover/CuratedCollections";
import { SerendipityEngine } from "@/components/discover/SerendipityEngine";
import { ResearchRadar } from "@/components/discover/ResearchRadar";
import { TrendingPapers } from "@/components/discover/TrendingPapers";
import { UpcomingEvents } from "@/components/discover/UpcomingEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { mockPapers } from "@/data/mockData";

const categories = [
  { icon: BookOpen, label: "Papers", count: "2.4M" },
  { icon: Users, label: "Researchers", count: "890K" },
  { icon: Database, label: "Datasets", count: "145K" },
  { icon: Code, label: "Code", count: "67K" },
];

const fields = [
  "Computer Science", "Physics", "Biology", "Chemistry", "Mathematics",
  "Medicine", "Engineering", "Environmental Science", "Psychology", "Economics",
  "Neuroscience", "Materials Science", "Astronomy", "Genetics", "AI & ML",
];

const quickFilters = ["2025-2026", "Open Access", "Peer Reviewed", "High Impact"];

const featuredTopics = [
  { icon: Brain, title: "AI & Machine Learning", description: "Neural networks, LLMs, reinforcement learning", papers: "142K", growth: "+34%" },
  { icon: Dna, title: "Genomics & CRISPR", description: "Gene editing, epigenomics, sequencing", papers: "87K", growth: "+22%" },
  { icon: Atom, title: "Quantum Computing", description: "Qubits, quantum algorithms, error correction", papers: "29K", growth: "+18%" },
  { icon: Globe, title: "Climate Science", description: "Modeling, carbon capture, ocean systems", papers: "56K", growth: "+15%" },
  { icon: FlaskConical, title: "Drug Discovery", description: "mRNA, protein folding, clinical trials", papers: "73K", growth: "+11%" },
  { icon: Flame, title: "Neuroscience", description: "Cognition, connectomics, neural interfaces", papers: "61K", growth: "+9%" },
];

const mockResearchers = [
  { id: "r1", name: "Dr. Sarah Chen", title: "Associate Professor of Computer Science", institution: "MIT", field: "Machine Learning", expertise: ["Deep Learning", "NLP", "Computer Vision", "Transformers"], publications: 47, citations: 2840, hIndex: 23, avatar: "SC", availableForCollab: true, followers: 1250 },
  { id: "r2", name: "Prof. Michael Rodriguez", title: "Professor of Physics", institution: "Stanford University", field: "Quantum Computing", expertise: ["Quantum Algorithms", "Quantum Information", "Error Correction", "Quantum ML"], publications: 62, citations: 5100, hIndex: 31, avatar: "MR", availableForCollab: false, followers: 890 },
  { id: "r3", name: "Dr. Emily Watson", title: "Research Scientist", institution: "DeepMind", field: "Computational Biology", expertise: ["Protein Folding", "Molecular Dynamics", "Bioinformatics", "ML for Biology"], publications: 35, citations: 1920, hIndex: 18, avatar: "EW", availableForCollab: true, followers: 2100 },
];

const RECENT_SEARCHES_KEY = "sciconnect-recent-searches";

function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]"); }
    catch { return []; }
  });

  const addSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setSearches(prev => {
      const next = [q, ...prev.filter(s => s !== q)].slice(0, 8);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeSearch = useCallback((q: string) => {
    setSearches(prev => {
      const next = prev.filter(s => s !== q);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { searches, addSearch, removeSearch };
}

const Discover = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "explore";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [following, setFollowing] = useState<Set<string>>(new Set(["r1"]));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { searches: recentSearches, addSearch, removeSearch } = useRecentSearches();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const toggleFilter = (f: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const toggleFollow = (researcherId: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(researcherId)) next.delete(researcherId);
      else next.add(researcherId);
      return next;
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) addSearch(searchQuery.trim());
  };

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filteredFields = useMemo(() => {
    if (!debouncedSearch.trim()) return fields;
    const q = debouncedSearch.toLowerCase();
    return fields.filter(f => f.toLowerCase().includes(q));
  }, [debouncedSearch]);

  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    const q = debouncedSearch.toLowerCase();
    return mockPapers.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.authors.some(a => a.toLowerCase().includes(q)) ||
      p.journal.toLowerCase().includes(q) ||
      (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }, [debouncedSearch]);

  const showSearchResults = debouncedSearch.trim().length > 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 space-y-3">
            <Skeleton className="h-8 w-56 mx-auto" />
            <Skeleton className="h-5 w-80 mx-auto" />
            <Skeleton className="h-14 w-full max-w-2xl mx-auto rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Search Section */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Discover Research</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Explore millions of papers, datasets, and researchers across all scientific disciplines.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by title, author, DOI, keyword..."
              className="w-full h-13 pl-12 pr-24 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-sm" />
            <button onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground font-semibold text-sm shadow-gold hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !showSearchResults && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mb-3 flex-wrap max-w-2xl mx-auto">
              <Clock className="w-3 h-3 text-muted-foreground" />
              {recentSearches.slice(0, 5).map(s => (
                <button key={s} onClick={() => setSearchQuery(s)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary border border-border text-[11px] text-muted-foreground hover:text-foreground transition-colors group">
                  {s}
                  <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); removeSearch(s); }} />
                </button>
              ))}
            </motion.div>
          )}

          {/* Filters */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-[12px] font-medium hover:bg-secondary/80 transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              {activeFilters.size > 0 && (
                <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                  {activeFilters.size}
                </span>
              )}
            </button>
            {quickFilters.map(filter => (
              <button key={filter} onClick={() => toggleFilter(filter)}
                className={`px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${
                  activeFilters.has(filter)
                    ? "bg-accent/10 border-accent text-accent"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-accent/30"
                }`}>
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search Results */}
        {showSearchResults && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-foreground">
                {searchResults.length > 0 ? `${searchResults.length} results for "${debouncedSearch}"` : `No results for "${debouncedSearch}"`}
              </h2>
              <button onClick={() => setSearchQuery("")} className="text-[11px] text-muted-foreground hover:text-foreground">Clear</button>
            </div>
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((paper, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-card rounded-xl border border-border p-4 hover:border-accent/20 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors line-clamp-1">{paper.title}</h3>
                        <p className="text-[10px] text-muted-foreground mb-1">{paper.authors.join(", ")}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{paper.journal}</span>
                          <span>·</span>
                          <span>{paper.date}</span>
                          <span>·</span>
                          <span className="text-accent">{paper.citations} citations</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[9px] capitalize shrink-0">{paper.type}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-card rounded-xl border border-border">
                <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground/20" />
                <h3 className="font-semibold text-foreground text-sm mb-1">No results found</h3>
                <p className="text-[12px] text-muted-foreground">Try adjusting your search terms or filters</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Main Content - Two Column Layout */}
        {!showSearchResults && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Main Column */}
            <div className="space-y-6 min-w-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="explore">Explore</TabsTrigger>
                  <TabsTrigger value="researchers">Researchers</TabsTrigger>
                  <TabsTrigger value="fields">Fields</TabsTrigger>
                </TabsList>

                <TabsContent value="explore" className="space-y-6">
                  {/* Categories */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat, i) => (
                      <motion.div key={cat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                        className={`bg-card rounded-xl border p-4 text-center hover:shadow-md transition-all cursor-pointer group ${
                          activeCategory === cat.label ? "border-accent shadow-md" : "border-border hover:border-accent/20"
                        }`}>
                        <cat.icon className="w-7 h-7 mx-auto mb-2 text-muted-foreground group-hover:text-accent transition-colors" />
                        <p className="text-[13px] font-semibold text-foreground mb-0.5">{cat.label}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{cat.count}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Curated Collections */}
                  <CuratedCollections />

                  {/* Trending Papers */}
                  <TrendingPapers />

                  {/* Trending Research Areas */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-serif text-lg font-bold text-foreground">Research Areas</h2>
                      <span className="text-[10px] text-muted-foreground">This week</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {featuredTopics.map((topic, i) => (
                        <motion.button key={topic.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                          onClick={() => { setSearchQuery(topic.title); addSearch(topic.title); }}
                          className="text-left bg-card border border-border rounded-xl p-4 hover:border-accent/20 hover:shadow-md transition-all group">
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                              <topic.icon className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-[9px] font-mono text-success bg-success-muted px-1.5 py-0.5 rounded">
                              ↑ {topic.growth}
                            </span>
                          </div>
                          <p className="text-[12px] font-semibold text-foreground mb-0.5">{topic.title}</p>
                          <p className="text-[10px] text-muted-foreground mb-2 leading-snug">{topic.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-muted-foreground">{topic.papers} papers</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="researchers" className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-lg font-bold text-foreground">Discover Researchers</h2>
                    <Badge variant="outline" className="text-[10px]">AI-Powered Matching</Badge>
                  </div>
                  <div className="space-y-3">
                    {mockResearchers.map((researcher) => (
                      <ResearcherCard key={researcher.id} researcher={researcher}
                        myProfile={{
                          skills: [
                            { name: "Machine Learning", level: 85 },
                            { name: "Python", level: 90 },
                            { name: "Deep Learning", level: 80 }
                          ],
                          interests: ["Machine Learning", "Quantum Computing", "Biology"],
                          availableForCollab: true
                        }}
                        onFollow={toggleFollow}
                        isFollowing={following.has(researcher.id)} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="fields" className="mt-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
                    <h2 className="font-serif text-lg font-bold text-foreground mb-3">Browse by Field</h2>
                    <div className="flex flex-wrap gap-2">
                      {filteredFields.length === 0 ? (
                        <p className="text-[12px] text-muted-foreground py-2">No fields match "{searchQuery}"</p>
                      ) : (
                        filteredFields.map(field => (
                          <Badge key={field} variant="secondary" onClick={() => { setSearchQuery(field); addSearch(field); }}
                            className="text-[12px] px-3 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                            {field}
                          </Badge>
                        ))
                      )}
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block space-y-4">
              <ResearchRadar />
              <SerendipityEngine />
              <UpcomingEvents />
            </aside>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Discover;
