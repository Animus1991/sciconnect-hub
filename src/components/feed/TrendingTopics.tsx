import { TrendingUp, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const topics = [
  { name: "Large Language Models", posts: 2451, trend: "+34%", hot: true,  pct: 100 },
  { name: "CRISPR-Cas9",          posts: 1284, trend: "+12%", hot: false, pct: 52  },
  { name: "Climate Modeling",     posts: 1102, trend: "+15%", hot: false, pct: 45  },
  { name: "Quantum Computing",    posts: 891,  trend: "+8%",  hot: false, pct: 36  },
  { name: "mRNA Vaccines",        posts: 673,  trend: "+5%",  hot: false, pct: 27  },
  { name: "Dark Matter",          posts: 445,  trend: "+3%",  hot: false, pct: 18  },
];

const TrendingTopics = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-xl border border-border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gold" />
          <h3 className="font-display font-semibold text-sm text-foreground">Trending in Science</h3>
        </div>
        <Link to="/discover" className="text-[11px] text-accent font-display flex items-center gap-1 hover:underline">
          Explore <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {topics.map((topic, i) => (
          <Link
            key={topic.name}
            to={`/discover?q=${encodeURIComponent(topic.name)}`}
            className="block group"
          >
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground w-3.5 shrink-0">{i + 1}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-display font-medium text-foreground group-hover:text-accent transition-colors">
                      #{topic.name.replace(/\s+/g, "")}
                    </span>
                    {topic.hot && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full gradient-gold text-accent-foreground font-display font-semibold">HOT</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-display">{topic.posts.toLocaleString()}</span>
                  <span className="text-[10px] font-mono text-success font-medium flex items-center gap-0.5">
                    <ArrowUpRight className="w-2.5 h-2.5" />{topic.trend}
                  </span>
                </div>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.pct}%` }}
                  transition={{ duration: 0.7, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    topic.hot ? "gradient-gold" : "bg-muted-foreground/30"
                  }`}
                />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default TrendingTopics;
