import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, Clock, Pin, Search, Flame, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const discussions = [
  { title: "Best practices for reproducible ML experiments in 2026?",  author: "Dr. Sarah Chen",    initials: "SC", replies: 47,  likes: 89,  time: "2h ago", tags: ["ML", "Reproducibility"],     pinned: true,  following: true  },
  { title: "Preprint vs journal submission: has the balance shifted?", author: "Prof. James Liu",   initials: "JL", replies: 123, likes: 234, time: "5h ago", tags: ["Publishing", "Open Access"], pinned: true,  following: false },
  { title: "New CRISPR delivery methods for in vivo applications",    author: "Dr. Priya Sharma",  initials: "PS", replies: 31,  likes: 56,  time: "8h ago", tags: ["CRISPR", "Gene Therapy"],    pinned: false, following: true  },
  { title: "Climate model ensemble disagreements at regional scales",  author: "Dr. Elena Volkov",  initials: "EV", replies: 19,  likes: 34,  time: "1d ago", tags: ["Climate", "Modeling"],       pinned: false, following: false },
  { title: "Ethical implications of synthetic biology in agriculture", author: "Prof. Omar Hassan", initials: "OH", replies: 67,  likes: 112, time: "1d ago", tags: ["Bioethics", "SynBio"],       pinned: false, following: false },
  { title: "Tips for writing compelling grant proposals (NIH R01)",   author: "Dr. Lisa Park",    initials: "LP", replies: 89,  likes: 178, time: "2d ago", tags: ["Grants", "Career"],           pinned: false, following: true  },
];

const tabs = ["All", "Trending", "Following"] as const;
type Tab = typeof tabs[number];

const Discussions = () => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const toggleLike = (title: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
        toast.success("Upvoted!");
      }
      return next;
    });
  };

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filteredDiscussions = useMemo(() => {
    let result = discussions;
    if (activeTab === "Trending") result = [...result].sort((a, b) => (b.likes + b.replies * 2) - (a.likes + a.replies * 2));
    if (activeTab === "Following") result = result.filter(d => d.following);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [debouncedSearch, activeTab]);

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Discussions</h1>
            <p className="text-muted-foreground font-display">Engage in scientific discourse, ask questions, and share insights with the community.</p>
          </div>
          <button
            onClick={() => toast.info("Discussion editor coming soon!")}
            className="h-10 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-sm flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Start Discussion
          </button>
        </motion.div>

        {/* Search + Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-display transition-all ${
                  activeTab === tab ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "Trending" && <Flame className="w-3 h-3" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredDiscussions.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-display">No discussions match your search</p>
            </div>
          ) : filteredDiscussions.map((d, i) => {
            const isHot = d.likes > 100 || d.replies > 80;
            const score = d.likes + d.replies * 2;
            return (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-scholarly hover:border-accent/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Vote column */}
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(d.title); }}
                      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${
                        likedPosts.has(d.title) ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-accent hover:bg-accent/5"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${likedPosts.has(d.title) ? "fill-current" : ""}`} />
                      <span className="text-[10px] font-mono font-semibold">{d.likes + (likedPosts.has(d.title) ? 1 : 0)}</span>
                    </button>
                  </div>

                  <Avatar className="w-9 h-9 mt-0.5 flex-shrink-0">
                    <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-xs font-semibold">
                      {d.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {d.pinned && <Pin className="w-3.5 h-3.5 text-gold flex-shrink-0" />}
                      {isHot && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-display font-bold text-orange-400 bg-orange-400/10">
                          <Flame className="w-2.5 h-2.5" /> HOT
                        </span>
                      )}
                      <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1 flex-1">
                        {d.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-display mb-2">
                      <span className="font-medium text-foreground/70">{d.author}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {d.time}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/60">score: {score}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {d.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="font-display text-[10px] cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">{tag}</Badge>
                      ))}
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground font-display">
                        <MessageSquare className="w-3.5 h-3.5" /> {d.replies} replies
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Discussions;
