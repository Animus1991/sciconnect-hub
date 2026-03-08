import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, BookOpen, Users, Database, Code, ArrowRight, Flame, Atom, Brain, Dna, Globe, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompatibilityScore, ResearcherCard } from "@/components/discover/CompatibilityScore";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

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
  {
    icon: Brain,
    title: "AI & Machine Learning",
    description: "Neural networks, LLMs, reinforcement learning",
    papers: "142K",
    growth: "+34%",
  },
  {
    icon: Dna,
    title: "Genomics & CRISPR",
    description: "Gene editing, epigenomics, sequencing",
    papers: "87K",
    growth: "+22%",
  },
  {
    icon: Atom,
    title: "Quantum Computing",
    description: "Qubits, quantum algorithms, error correction",
    papers: "29K",
    growth: "+18%",
  },
  {
    icon: Globe,
    title: "Climate Science",
    description: "Modeling, carbon capture, ocean systems",
    papers: "56K",
    growth: "+15%",
  },
  {
    icon: FlaskConical,
    title: "Drug Discovery",
    description: "mRNA, protein folding, clinical trials",
    papers: "73K",
    growth: "+11%",
  },
  {
    icon: Flame,
    title: "Neuroscience",
    description: "Cognition, connectomics, neural interfaces",
    papers: "61K",
    growth: "+9%",
  },
];

const mockResearchers = [
  {
    id: "r1",
    name: "Dr. Sarah Chen",
    title: "Associate Professor of Computer Science",
    institution: "MIT",
    field: "Machine Learning",
    expertise: ["Deep Learning", "NLP", "Computer Vision", "Transformers"],
    publications: 47,
    citations: 2840,
    hIndex: 23,
    avatar: "SC",
    availableForCollab: true,
    followers: 1250
  },
  {
    id: "r2",
    name: "Prof. Michael Rodriguez",
    title: "Professor of Physics",
    institution: "Stanford University",
    field: "Quantum Computing",
    expertise: ["Quantum Algorithms", "Quantum Information", "Error Correction", "Quantum ML"],
    publications: 62,
    citations: 5100,
    hIndex: 31,
    avatar: "MR",
    availableForCollab: false,
    followers: 890
  },
  {
    id: "r3",
    name: "Dr. Emily Watson",
    title: "Research Scientist",
    institution: "DeepMind",
    field: "Computational Biology",
    expertise: ["Protein Folding", "Molecular Dynamics", "Bioinformatics", "ML for Biology"],
    publications: 35,
    citations: 1920,
    hIndex: 18,
    avatar: "EW",
    availableForCollab: true,
    followers: 2100
  }
];

const Discover = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "explore";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [following, setFollowing] = useState<Set<string>>(new Set(["r1"]));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filteredFields = useMemo(() => {
    if (!debouncedSearch.trim()) return fields;
    const q = debouncedSearch.toLowerCase();
    return fields.filter(f => f.toLowerCase().includes(q));
  }, [debouncedSearch]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Discover Research</h1>
          <p className="text-muted-foreground font-display text-lg mb-8">
            Explore millions of papers, datasets, and researchers across all scientific disciplines.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, DOI, keyword..."
              className="w-full h-14 pl-12 pr-24 rounded-xl bg-card border border-border text-foreground font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-scholarly"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-sm shadow-gold hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-display hover:bg-secondary/80 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {activeFilters.size > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFilters.size}
                </span>
              )}
            </button>
            {quickFilters.map(filter => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`px-3 py-2 rounded-lg border text-sm font-display transition-all ${
                  activeFilters.has(filter)
                    ? "bg-accent/10 border-accent text-accent font-medium"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-accent"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="researchers">Researchers</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
          </TabsList>

          {/* EXPLORE TAB — single unified view */}
          <TabsContent value="explore" className="space-y-8">
            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                  className={`bg-card rounded-xl border p-6 text-center hover:shadow-scholarly transition-all cursor-pointer group ${
                    activeCategory === cat.label ? "border-accent shadow-gold" : "border-border hover:border-accent/30"
                  }`}
                >
                  <cat.icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-accent transition-colors" />
                  <p className="font-display font-semibold text-foreground mb-1">{cat.label}</p>
                  <p className="text-sm text-muted-foreground font-mono">{cat.count}</p>
                </motion.div>
              ))}
            </div>

            {/* Featured Research Areas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-foreground">Trending Research Areas</h2>
                <span className="text-xs text-muted-foreground font-display">This week</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredTopics.map((topic, i) => (
                  <motion.button
                    key={topic.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => setSearchQuery(topic.title)}
                    className="text-left bg-card border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-scholarly transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                        <topic.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-brand bg-emerald-muted px-1.5 py-0.5 rounded">
                        ↑ {topic.growth}
                      </div>
                    </div>
                    <p className="font-display font-semibold text-foreground text-sm mb-1">{topic.title}</p>
                    <p className="text-[11px] text-muted-foreground mb-3 leading-snug">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted-foreground">{topic.papers} papers</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* RESEARCHERS TAB */}
          <TabsContent value="researchers" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-foreground">Discover Researchers</h2>
              <Badge variant="outline" className="text-xs">
                AI-Powered Compatibility Matching
              </Badge>
            </div>

            <div className="space-y-4">
              {mockResearchers.map((researcher) => (
                <ResearcherCard
                  key={researcher.id}
                  researcher={researcher}
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
                  isFollowing={following.has(researcher.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* FIELDS TAB */}
          <TabsContent value="fields" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h2 className="font-serif text-xl font-bold text-foreground mb-4">Browse by Field</h2>
              <div className="flex flex-wrap gap-2">
                {filteredFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-display py-2">No fields match "{searchQuery}"</p>
                ) : (
                  filteredFields.map(field => (
                    <Badge
                      key={field}
                      variant="secondary"
                      onClick={() => setSearchQuery(field)}
                      className="font-display text-sm px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {field}
                    </Badge>
                  ))
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Discover;
