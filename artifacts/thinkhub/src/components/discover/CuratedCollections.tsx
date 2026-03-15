import { motion } from "framer-motion";
import { Sparkles, BookOpen, Bookmark, ExternalLink, TrendingUp, Eye, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

interface Collection {
  id: string;
  title: string;
  description: string;
  curator: string;
  paperCount: number;
  followers: number;
  tags: string[];
  gradient: string;
  icon: string;
}

const COLLECTIONS: Collection[] = [
  {
    id: "c1",
    title: "Frontier AI Safety Research",
    description: "Critical papers on alignment, interpretability, and governance of advanced AI systems",
    curator: "Editorial Team",
    paperCount: 34,
    followers: 2840,
    tags: ["AI Safety", "Alignment", "Governance"],
    gradient: "from-rose-500/20 to-orange-500/20",
    icon: "🛡️",
  },
  {
    id: "c2",
    title: "Breakthroughs in Gene Therapy",
    description: "Latest clinical successes in CRISPR-based therapeutics and delivery systems",
    curator: "Dr. Sarah Chen",
    paperCount: 22,
    followers: 1560,
    tags: ["CRISPR", "Gene Therapy", "Clinical"],
    gradient: "from-emerald-500/20 to-teal-500/20",
    icon: "🧬",
  },
  {
    id: "c3",
    title: "Quantum Advantage Papers",
    description: "Seminal works demonstrating quantum computational superiority",
    curator: "Prof. Rodriguez",
    paperCount: 18,
    followers: 920,
    tags: ["Quantum", "Computation", "Advantage"],
    gradient: "from-violet-500/20 to-indigo-500/20",
    icon: "⚛️",
  },
  {
    id: "c4",
    title: "Climate Tipping Points 2025",
    description: "Evidence-based research on critical climate thresholds and intervention strategies",
    curator: "Climate Hub",
    paperCount: 41,
    followers: 3200,
    tags: ["Climate", "Tipping Points", "Policy"],
    gradient: "from-sky-500/20 to-cyan-500/20",
    icon: "🌍",
  },
];

export function CuratedCollections() {
  const [savedCollections, setSavedCollections] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSavedCollections(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Collection removed"); }
      else { next.add(id); toast.success("Collection saved to library"); }
      return next;
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h2 className="font-serif text-lg font-bold text-foreground">Curated Collections</h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">Updated weekly</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COLLECTIONS.map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card rounded-xl border border-border p-4 hover:border-accent/20 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${col.gradient} opacity-30 group-hover:opacity-50 transition-opacity`} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{col.icon}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSave(col.id); }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    savedCollections.has(col.id) ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedCollections.has(col.id) ? "fill-current" : ""}`} />
                </button>
              </div>
              <h3 className="text-[13px] font-semibold text-foreground mb-1 leading-snug group-hover:text-accent transition-colors">
                {col.title}
              </h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">{col.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {col.tags.map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/80 text-muted-foreground">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{col.paperCount} papers</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{col.followers.toLocaleString()}</span>
                <span className="font-medium text-foreground/70">{col.curator}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
