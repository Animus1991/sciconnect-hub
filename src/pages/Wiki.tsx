import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { BookOpen, Search, Plus, Edit3, Clock, Users, ChevronRight, FileText, Hash, Star, Eye, ArrowUpRight, Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const wikiArticles = [
  {
    id: "w1",
    title: "Transformer Architecture Overview",
    excerpt: "A comprehensive guide to the attention mechanism, encoder-decoder structure, and key variants including GPT, BERT, and T5.",
    category: "Machine Learning",
    lastEditor: "Dr. Sarah Chen",
    initials: "SC",
    updatedAt: "2 hours ago",
    views: 1432,
    contributors: 8,
    starred: true,
    tags: ["Deep Learning", "NLP", "Attention"],
  },
  {
    id: "w2",
    title: "CRISPR-Cas9 Methodology",
    excerpt: "Step-by-step protocols for CRISPR gene editing, including guide RNA design, delivery methods, and off-target analysis.",
    category: "Biology",
    lastEditor: "Dr. Priya Sharma",
    initials: "PS",
    updatedAt: "1 day ago",
    views: 892,
    contributors: 5,
    starred: false,
    tags: ["Gene Editing", "Protocols"],
  },
  {
    id: "w3",
    title: "Climate Model Validation Techniques",
    excerpt: "Methods for validating global and regional climate models against observational data, including statistical metrics and uncertainty quantification.",
    category: "Climate Science",
    lastEditor: "Dr. Elena Volkov",
    initials: "EV",
    updatedAt: "3 days ago",
    views: 567,
    contributors: 4,
    starred: true,
    tags: ["Modeling", "Validation", "Statistics"],
  },
  {
    id: "w4",
    title: "Research Ethics Handbook",
    excerpt: "Guidelines for ethical research conduct, IRB applications, informed consent, data privacy, and responsible AI development.",
    category: "Methodology",
    lastEditor: "Prof. Omar Hassan",
    initials: "OH",
    updatedAt: "1 week ago",
    views: 2341,
    contributors: 12,
    starred: false,
    tags: ["Ethics", "Compliance", "IRB"],
  },
  {
    id: "w5",
    title: "Quantum Error Correction Codes",
    excerpt: "Survey of stabilizer codes, surface codes, and topological codes for fault-tolerant quantum computation.",
    category: "Quantum Computing",
    lastEditor: "Prof. Yuki Tanaka",
    initials: "YT",
    updatedAt: "5 days ago",
    views: 789,
    contributors: 6,
    starred: false,
    tags: ["Quantum", "Error Correction"],
  },
];

const wikiCategories = [
  { name: "Machine Learning", articles: 47, color: "bg-violet-500" },
  { name: "Biology", articles: 31, color: "bg-emerald-500" },
  { name: "Climate Science", articles: 22, color: "bg-teal-500" },
  { name: "Methodology", articles: 18, color: "bg-amber-500" },
  { name: "Quantum Computing", articles: 14, color: "bg-blue-500" },
  { name: "Neuroscience", articles: 26, color: "bg-rose-500" },
];

const recentEdits = [
  { article: "Transformer Architecture Overview", editor: "SC", time: "2h ago", type: "Updated" },
  { article: "CRISPR-Cas9 Methodology", editor: "PS", time: "1d ago", type: "New section" },
  { article: "Research Ethics Handbook", editor: "OH", time: "3d ago", type: "Reviewed" },
  { article: "Climate Model Validation", editor: "EV", time: "5d ago", type: "Created" },
];

const Wiki = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [starredArticles, setStarredArticles] = useState<Set<string>>(
    new Set(wikiArticles.filter(a => a.starred).map(a => a.id))
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleStar = (id: string) => {
    setStarredArticles(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed from starred");
      } else {
        next.add(id);
        toast.success("Added to starred");
      }
      return next;
    });
  };

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filteredArticles = useMemo(() => {
    let result = wikiArticles;
    if (selectedCategory) result = result.filter(a => a.category === selectedCategory);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [debouncedSearch, selectedCategory]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Research Wiki</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Collaborative knowledge base — {wikiArticles.length} articles by {new Set(wikiArticles.map(a => a.lastEditor)).size}+ contributors
              </p>
            </div>
            <button
              onClick={() => toast.info("Wiki editor coming soon!")}
              className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> New Article
            </button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Articles", value: "158", icon: FileText, color: "text-foreground" },
            { label: "Contributors", value: "42", icon: Users, color: "text-accent" },
            { label: "Categories", value: String(wikiCategories.length), icon: Folder, color: "text-gold" },
            { label: "This Week", value: "12", icon: Edit3, color: "text-emerald-brand" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4">
              <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wiki articles, tags, categories..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${
              !selectedCategory ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {wikiCategories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${
                selectedCategory === cat.name ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${cat.color}`} />
              {cat.name}
              <span className="text-[9px] font-mono text-muted-foreground">{cat.articles}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Articles list */}
          <div className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground font-display">No articles found</p>
              </div>
            ) : (
              filteredArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 hover:shadow-scholarly transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-display text-accent border-accent/20 bg-accent/5">
                          <Hash className="w-2.5 h-2.5 mr-0.5" />{article.category}
                        </Badge>
                        {article.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] font-display">{tag}</Badge>
                        ))}
                      </div>
                      <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-display leading-relaxed mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display">
                        <span className="flex items-center gap-1">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="bg-scholarly text-primary-foreground text-[7px] font-bold">{article.initials}</AvatarFallback>
                          </Avatar>
                          {article.lastEditor}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.updatedAt}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {article.contributors}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleStar(article.id); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Star className={`w-4 h-4 ${starredArticles.has(article.id) ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 hidden lg:block">
            {/* Recent Edits */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-accent" /> Recent Edits
              </h3>
              <div className="space-y-3">
                {recentEdits.map((edit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Avatar className="w-6 h-6 mt-0.5">
                      <AvatarFallback className="bg-scholarly text-primary-foreground text-[8px] font-bold">{edit.editor}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-display text-foreground truncate">{edit.article}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-display">
                        <span>{edit.type}</span>
                        <span>·</span>
                        <span>{edit.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Browse Categories */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-gold" /> Categories
              </h3>
              <div className="space-y-2">
                {wikiCategories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className={`w-3 h-3 rounded ${cat.color}`} />
                    <span className="text-xs font-display text-foreground flex-1">{cat.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{cat.articles}</span>
                    <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
};

export default Wiki;
