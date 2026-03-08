import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Flame, ArrowUpRight, BookOpen, Bookmark, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { mockPapers } from "@/data/mockData";

interface TrendingPaper {
  title: string;
  authors: string[];
  journal: string;
  citations: number;
  velocity: number; // citations per week
  daysAgo: number;
  tags: string[];
  type: string;
}

const TRENDING_PAPERS: TrendingPaper[] = mockPapers.slice(0, 6).map((p, i) => ({
  ...p,
  velocity: Math.floor(Math.random() * 20) + 5,
  daysAgo: Math.floor(Math.random() * 14) + 1,
}));

type SortBy = "velocity" | "citations" | "recent";

export function TrendingPapers() {
  const [sortBy, setSortBy] = useState<SortBy>("velocity");
  const [savedPapers, setSavedPapers] = useState<Set<number>>(new Set());

  const sorted = [...TRENDING_PAPERS].sort((a, b) => {
    if (sortBy === "velocity") return b.velocity - a.velocity;
    if (sortBy === "citations") return b.citations - a.citations;
    return a.daysAgo - b.daysAgo;
  });

  const toggleSave = (idx: number) => {
    setSavedPapers(prev => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); toast("Removed from list"); }
      else { next.add(idx); toast.success("Saved to reading list"); }
      return next;
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-warning" />
          <h2 className="font-serif text-lg font-bold text-foreground">Trending Now</h2>
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
        {sorted.slice(0, 5).map((paper, i) => (
          <motion.div
            key={`${paper.title}-${sortBy}`}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
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
                  <span className="text-muted-foreground">{paper.citations} total citations</span>
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
                onClick={(e) => { e.stopPropagation(); toggleSave(i); }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  savedPapers.has(i) ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary opacity-0 group-hover:opacity-100"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedPapers.has(i) ? "fill-current" : ""}`} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
