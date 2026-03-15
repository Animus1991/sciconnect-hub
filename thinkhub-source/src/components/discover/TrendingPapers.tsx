import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Flame, ArrowUpRight, BookOpen, Bookmark, Clock, Star, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { mockPapers } from "@/data/mockData";

interface TrendingPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  citations: number;
  velocity: number;
  daysAgo: number;
  tags: string[];
  type: string;
}

// Generate a larger pool of trending papers for infinite scroll
function generatePaperPool(count: number): TrendingPaper[] {
  const extraTitles = [
    "Foundation Models for Scientific Discovery",
    "Protein Structure Prediction via Diffusion Models",
    "Scalable Quantum Simulation on 1000+ Qubits",
    "Carbon Capture Using Metal-Organic Frameworks",
    "Single-Cell Multi-Omics Atlas of Human Development",
    "Neural Radiance Fields for Molecular Visualization",
    "Federated Learning for Privacy-Preserving Healthcare",
    "Topological Insulators for Room-Temperature Spintronics",
    "mRNA Therapeutics Beyond Vaccines: A Roadmap",
    "Reinforcement Learning for Autonomous Lab Experiments",
    "Climate Tipping Point Detection via Satellite ML",
    "Biodegradable Electronics for In-Vivo Monitoring",
    "Large Language Models for Automated Theorem Proving",
    "CRISPR Base Editing Achieves 99.9% Precision",
    "Dark Matter Detection with Quantum Sensors",
  ];
  const journals = ["Nature", "Science", "Cell", "Physical Review X", "Nature ML", "PNAS", "Lancet"];
  const tagPool = ["ML", "Quantum", "Genomics", "Climate", "Neuro", "Drug Discovery", "Materials", "Open Source"];

  const basePapers: TrendingPaper[] = mockPapers.map((p, i) => ({
    id: `tp-${i}`,
    ...p,
    velocity: Math.floor(Math.random() * 25) + 5,
    daysAgo: Math.floor(Math.random() * 14) + 1,
  }));

  const extras: TrendingPaper[] = extraTitles.slice(0, count - basePapers.length).map((title, i) => ({
    id: `tp-extra-${i}`,
    title,
    authors: [`Dr. ${["A. Smith", "B. Kim", "C. Patel", "D. Zhang", "E. Müller"][i % 5]}`],
    journal: journals[i % journals.length],
    citations: Math.floor(Math.random() * 200) + 10,
    velocity: Math.floor(Math.random() * 30) + 3,
    daysAgo: Math.floor(Math.random() * 21) + 1,
    tags: [tagPool[i % tagPool.length], tagPool[(i + 3) % tagPool.length]],
    type: "paper",
  }));

  return [...basePapers, ...extras];
}

const ALL_PAPERS = generatePaperPool(20);
const PAGE_SIZE = 5;

function PaperSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-2">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 mt-1 rounded shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

type SortBy = "velocity" | "citations" | "recent";

export function TrendingPapers() {
  const [sortBy, setSortBy] = useState<SortBy>("velocity");
  const [savedPapers, setSavedPapers] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sorted = [...ALL_PAPERS].sort((a, b) => {
    if (sortBy === "velocity") return b.velocity - a.velocity;
    if (sortBy === "citations") return b.citations - a.citations;
    return a.daysAgo - b.daysAgo;
  });

  const visiblePapers = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  // Reset on sort change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortBy]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate network delay
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + PAGE_SIZE, sorted.length));
            setIsLoadingMore(false);
          }, 500);
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, sorted.length]);

  const toggleSave = (id: string) => {
    setSavedPapers(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Removed from list"); }
      else { next.add(id); toast.success("Saved to reading list"); }
      return next;
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-warning" />
          <h2 className="font-serif text-lg font-bold text-foreground">Trending Now</h2>
          <span className="text-[10px] text-muted-foreground">{sorted.length} papers</span>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
          {([
            { key: "velocity" as SortBy, label: "Hot", icon: TrendingUp },
            { key: "citations" as SortBy, label: "Cited", icon: Star },
            { key: "recent" as SortBy, label: "New", icon: Clock },
          ]).map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                sortBy === opt.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <opt.icon className="w-3 h-3" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visiblePapers.map((paper, i) => (
            <motion.div
              key={paper.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 4) * 0.04 }}
              className="bg-card rounded-xl border border-border p-4 hover:border-accent/20 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <span className="text-[11px] font-mono font-bold text-muted-foreground w-5 mt-1 shrink-0 text-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-semibold text-foreground leading-snug mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                    {paper.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    {paper.authors.slice(0, 2).join(", ")}{paper.authors.length > 2 ? " et al." : ""} · {paper.journal}
                  </p>
                  <div className="flex items-center flex-wrap gap-2 text-[10px]">
                    <span className="flex items-center gap-0.5 text-success font-medium">
                      <ArrowUpRight className="w-3 h-3" />
                      +{paper.velocity}/week
                    </span>
                    <span className="text-muted-foreground">{paper.citations} citations</span>
                    <span className="text-muted-foreground">{paper.daysAgo}d ago</span>
                    <div className="flex gap-1 ml-auto">
                      {paper.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[9px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSave(paper.id); }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    savedPapers.has(paper.id) ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedPapers.has(paper.id) ? "fill-current" : ""}`} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading skeletons */}
        {isLoadingMore && (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <PaperSkeleton key={`skel-${i}`} />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && <div ref={sentinelRef} className="h-1" />}

        {/* End indicator */}
        {!hasMore && visibleCount > PAGE_SIZE && (
          <p className="text-center text-[10px] text-muted-foreground py-2">All {sorted.length} papers loaded</p>
        )}
      </div>
    </section>
  );
}
