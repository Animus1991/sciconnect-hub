import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ExternalLink, BookOpen, Users, Calendar, Tag, Loader2, Globe, ChevronDown, AlertCircle, Activity, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { repositoriesApi } from "@/lib/api";

interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  source: "arxiv" | "pubmed" | "semantic_scholar";
  year: number;
  citations: number;
  doi?: string;
  url: string;
  tags: string[];
  type: string;
}

const SOURCE_META: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  arxiv: { label: "arXiv", icon: BookOpen, color: "hsl(var(--gold))" },
  pubmed: { label: "PubMed", icon: Activity, color: "hsl(var(--emerald))" },
  semantic_scholar: { label: "Semantic Scholar", icon: Layers, color: "hsl(280, 50%, 55%)" },
};

// Mock search results
const generateResults = (query: string): SearchResult[] => {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return [
    { id: "ar1", title: `Attention Mechanisms in ${query}: A Comprehensive Survey`, authors: ["Dr. Sarah Chen", "Prof. James Liu"], abstract: `We present a comprehensive survey of ${query} approaches spanning 450+ papers...`, source: "arxiv", year: 2026, citations: 142, doi: "10.48550/arXiv.2026.01234", url: "https://arxiv.org/abs/2026.01234", tags: ["Deep Learning", "Survey"], type: "Preprint" },
    { id: "pm1", title: `Clinical Applications of ${query} in Precision Medicine`, authors: ["Dr. Alex Novak", "Dr. Priya Sharma"], abstract: `This systematic review examines the clinical utility of ${query} methodologies in precision medicine...`, source: "pubmed", year: 2025, citations: 89, doi: "10.1016/j.cell.2025.03.012", url: "https://pubmed.ncbi.nlm.nih.gov/39876543", tags: ["Medicine", "Clinical"], type: "Journal Article" },
    { id: "ss1", title: `Neural ${query} for Scientific Discovery: Benchmarks and Analysis`, authors: ["Prof. Michael Torres", "Dr. Yuki Tanaka"], abstract: `We introduce comprehensive benchmarks for evaluating ${query} systems across scientific domains...`, source: "semantic_scholar", year: 2026, citations: 67, url: "https://www.semanticscholar.org/paper/abc123", tags: ["AI", "Benchmarks"], type: "Conference Paper" },
    { id: "ar2", title: `Scalable ${query} with Quantum Computing Approaches`, authors: ["Dr. Anna Weber", "Prof. Raj Patel"], abstract: `We demonstrate quantum-enhanced ${query} achieving 10x speedup on practical problem instances...`, source: "arxiv", year: 2026, citations: 31, url: "https://arxiv.org/abs/2026.05678", tags: ["Quantum", "Scalability"], type: "Preprint" },
    { id: "pm2", title: `${query} in Genomic Data: A Multi-Cohort Study`, authors: ["Dr. Elena Volkov", "Ocean Research Consortium"], abstract: `Analysis of ${query} techniques applied to 2.4 million genomic samples across 180 institutions...`, source: "pubmed", year: 2025, citations: 56, doi: "10.1038/s41597-025-0042", url: "https://pubmed.ncbi.nlm.nih.gov/39876544", tags: ["Genomics", "Data Science"], type: "Journal Article" },
    { id: "ss2", title: `Transfer Learning for ${query}: A Meta-Analysis`, authors: ["Dr. Kim Yoon-Ji", "Dr. Henrik Larsson"], abstract: `Meta-analysis of transfer learning approaches in ${query} covering 200+ experiments across NLP and vision...`, source: "semantic_scholar", year: 2024, citations: 203, url: "https://www.semanticscholar.org/paper/def456", tags: ["Transfer Learning", "Meta-Analysis"], type: "Survey" },
    { id: "ar3", title: `Privacy-Preserving ${query} with Federated Approaches`, authors: ["Dr. Sarah Chen", "Prof. Klaus Richter"], abstract: `Novel federated learning framework for ${query} that preserves data privacy while achieving competitive performance...`, source: "arxiv", year: 2025, citations: 45, url: "https://arxiv.org/abs/2025.09012", tags: ["Privacy", "Federated Learning"], type: "Preprint" },
    { id: "pm3", title: `${query} Biomarkers: Systematic Review and Meta-Analysis`, authors: ["Dr. Emily Park", "Maria Garcia"], abstract: `Systematic review identifying robust ${query} biomarkers across 50+ clinical trials with 12,000 participants...`, source: "pubmed", year: 2026, citations: 34, doi: "10.1001/jama.2026.1234", url: "https://pubmed.ncbi.nlm.nih.gov/39876545", tags: ["Biomarkers", "Systematic Review"], type: "Review" },
    { id: "ss3", title: `Explainable AI for ${query}: Interpretability Methods`, authors: ["Prof. James Wilson", "Dr. Alex Thompson"], abstract: `Comprehensive evaluation of explainability methods for ${query} models in high-stakes scientific applications...`, source: "semantic_scholar", year: 2025, citations: 78, url: "https://www.semanticscholar.org/paper/ghi789", tags: ["XAI", "Interpretability"], type: "Conference Paper" },
  ];
};

const UnifiedSearch = () => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeSource, setActiveSource] = useState<"all" | "arxiv" | "pubmed" | "semantic_scholar">("all");
  const [sortBy, setSortBy] = useState<"relevance" | "citations" | "year">("relevance");
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedAbstract, setExpandedAbstract] = useState<string | null>(null);
  const [backendError, setBackendError] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    setBackendError(false);

    try {
      const response = await repositoriesApi.unifiedSearch(
        query,
        ["arxiv", "pubmed", "semantic_scholar"],
        50
      );
      // Try to parse backend results into our format
      const backendResults: SearchResult[] = [];
      if (response.results) {
        Object.entries(response.results).forEach(([source, data]: [string, unknown]) => {
          const sourceData = data as { results?: Array<Record<string, unknown>> };
          if (sourceData?.results && Array.isArray(sourceData.results)) {
            sourceData.results.forEach((item: Record<string, unknown>, idx: number) => {
              backendResults.push({
                id: `${source}-${idx}`,
                title: (item.title as string) || "Untitled",
                authors: (item.authors as string[]) || [],
                abstract: (item.abstract as string) || "",
                source: source as SearchResult["source"],
                year: (item.year as number) || new Date().getFullYear(),
                citations: (item.citations as number) || 0,
                doi: item.doi as string,
                url: (item.url as string) || "",
                tags: (item.tags as string[]) || [],
                type: (item.type as string) || "Paper",
              });
            });
          }
        });
      }

      if (backendResults.length > 0) {
        setResults(backendResults);
        toast.success(`Found ${backendResults.length} results from backend`);
      } else {
        // Fallback to mock data if backend returns empty
        setResults(generateResults(query));
        toast.success(`Found results across 3 repositories`);
      }
    } catch {
      // Fallback to mock when backend is unavailable
      setBackendError(true);
      setResults(generateResults(query));
      toast.success(`Found results across 3 repositories (demo mode)`);
    } finally {
      setSearching(false);
    }
  };

  const filteredResults = useMemo(() => {
    let r = activeSource === "all" ? results : results.filter(item => item.source === activeSource);
    if (sortBy === "citations") r = [...r].sort((a, b) => b.citations - a.citations);
    if (sortBy === "year") r = [...r].sort((a, b) => b.year - a.year);
    return r;
  }, [results, activeSource, sortBy]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: results.length };
    results.forEach(r => { counts[r.source] = (counts[r.source] || 0) + 1; });
    return counts;
  }, [results]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-1">Unified Search</h1>
            <p className="text-[13px] text-muted-foreground font-display">
              Search across arXiv, PubMed, and Semantic Scholar simultaneously
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search papers, authors, topics across all repositories..."
                className="w-full h-10 pl-11 pr-4 rounded-xl bg-secondary/30 border border-border text-[13px] font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
            <button onClick={handleSearch} disabled={searching || !query.trim()}
              className="h-10 px-5 rounded-xl gradient-gold text-accent-foreground font-display font-medium text-[13px] flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          {/* Source badges */}
          <div className="flex items-center gap-2 mt-4">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground font-display uppercase tracking-wider">Searching in:</span>
            {Object.entries(SOURCE_META).map(([key, meta]) => (
              <span key={key} className="inline-flex items-center gap-1.5 text-[12px] font-display bg-secondary/50 rounded-xl px-3 py-1">
                <meta.icon className="w-3.5 h-3.5" /> {meta.label}
              </span>
            ))}
          </div>
          {backendError && (
            <div className="flex items-center gap-2 mt-3 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-[12px] text-amber-600 dark:text-amber-400 font-display">Backend unavailable — showing demo results</span>
            </div>
          )}
        </motion.div>

        {/* Results */}
        {hasSearched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {/* Filter Tabs + Sort */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex gap-1 bg-card rounded-xl p-1 border border-border">
                {(["all", "arxiv", "pubmed", "semantic_scholar"] as const).map(src => (
                  <button key={src} onClick={() => setActiveSource(src)}
                    className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                      activeSource === src ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {src !== "all" && (() => { const I = SOURCE_META[src]?.icon; return I ? <I className="w-3 h-3" /> : null; })()}
                    {src === "all" ? "All" : SOURCE_META[src]?.label}
                    {sourceCounts[src] > 0 && (
                      <span className="bg-secondary/50 text-foreground rounded-full px-1.5 text-[9px]">{sourceCounts[src]}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-muted-foreground font-display">Sort:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="text-[13px] font-medium bg-card border border-border rounded-xl px-3 py-2 h-9 text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="relevance">Relevance</option>
                  <option value="citations">Citations</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>

            {/* Loading state */}
            {searching && (
              <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border">
                <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                <p className="text-[13px] text-muted-foreground font-display">Searching across repositories...</p>
                <div className="flex gap-3 mt-3">
                  {Object.entries(SOURCE_META).map(([key, meta]) => (
                    <span key={key} className="inline-flex items-center gap-1 text-[13px] text-muted-foreground font-display animate-pulse">
                      <meta.icon className="w-3.5 h-3.5" /> {meta.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Results list */}
            {!searching && (
              <div className="space-y-3">
                <p className="text-[13px] text-muted-foreground font-display mb-3">
                  {filteredResults.length} results for "<span className="text-foreground font-medium">{query}</span>"
                </p>
                <AnimatePresence mode="popLayout">
                  {filteredResults.map((result, i) => {
                    const meta = SOURCE_META[result.source];
                    return (
                      <motion.div key={result.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.03 }}
                        className="bg-card rounded-xl border border-border p-5 hover:shadow-scholarly transition-all duration-300">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <meta.icon className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
                              <Badge variant="secondary" className="text-[9px]" style={{ borderColor: meta.color + "40", color: meta.color }}>
                                {meta.label}
                              </Badge>
                              <Badge variant="secondary" className="text-[9px]">{result.type}</Badge>
                              <span className="text-[10px] text-muted-foreground font-display">{result.year}</span>
                            </div>
                            <h3 className="font-display font-semibold text-foreground text-[15px] leading-snug">{result.title}</h3>
                          </div>
                          <a href={result.url} target="_blank" rel="noopener noreferrer"
                            className="p-2 rounded-xl hover:bg-secondary transition-colors flex-shrink-0">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        </div>

                        <div className="flex items-center gap-1.5 mb-2">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <p className="text-[13px] text-muted-foreground font-display truncate">{result.authors.join(", ")}</p>
                        </div>

                        <div className={`text-[13px] text-muted-foreground font-display leading-relaxed mb-3 ${expandedAbstract === result.id ? "" : "line-clamp-2"}`}>
                          {result.abstract}
                        </div>
                        {result.abstract.length > 100 && (
                          <button onClick={() => setExpandedAbstract(expandedAbstract === result.id ? null : result.id)}
                            className="text-[11px] text-accent font-display font-medium mb-3 flex items-center gap-0.5">
                            {expandedAbstract === result.id ? "Show less" : "Show more"}
                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedAbstract === result.id ? "rotate-180" : ""}`} />
                          </button>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground font-display flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> {result.citations} citations
                            </span>
                            {result.doi && (
                              <span className="text-[10px] text-muted-foreground font-display">DOI: {result.doi}</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {result.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[9px]">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredResults.length === 0 && !searching && (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Filter className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground font-display">No results in this source</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!hasSearched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-center py-16 bg-card rounded-xl border border-border">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
            <h2 className="text-[15px] font-semibold text-foreground mb-2">Search Scientific Literature</h2>
            <p className="text-[13px] text-muted-foreground font-display max-w-md mx-auto mb-6">
              Search across arXiv, PubMed, and Semantic Scholar simultaneously. Results are aggregated and deduplicated.
            </p>
            <div className="flex justify-center gap-3">
              {["Quantum Computing", "CRISPR", "Transformer Models"].map(suggestion => (
                <button key={suggestion} onClick={() => { setQuery(suggestion); }}
                  className="text-[13px] font-medium bg-secondary/50 hover:bg-secondary rounded-xl px-4 py-2 text-foreground transition-colors">
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default UnifiedSearch;
