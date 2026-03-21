import { TrendingUp, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TOPICS = [
  { name: "LargeLanguageModels", posts: 2451, trend: "+34%", hot: true,  pct: 100 },
  { name: "CRISPR-Cas9",        posts: 1284, trend: "+12%", hot: false, pct: 52  },
  { name: "ClimateModeling",    posts: 1102, trend: "+15%", hot: false, pct: 45  },
  { name: "QuantumComputing",   posts: 891,  trend: "+8%",  hot: false, pct: 36  },
  { name: "mRNAVaccines",       posts: 673,  trend: "+5%",  hot: false, pct: 27  },
  { name: "DarkMatter",         posts: 445,  trend: "+3%",  hot: false, pct: 18  },
];

const TrendingTopics = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-card rounded-xl border border-border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gold" />
          <h3 className="text-[15px] font-semibold text-foreground">Trending in Science</h3>
        </div>
        <Link to="/discover" className="text-[11px] text-accent font-medium flex items-center gap-1 hover:underline">
          Explore <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {TOPICS.map((topic, i) => (
          <Link
            key={topic.name}
            to={`/discover?q=${encodeURIComponent(topic.name)}`}
            className="block group"
          >
            <motion.div
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-muted-foreground w-3">{i + 1}</span>
                  <span className="text-[11px] font-medium text-foreground group-hover:text-accent transition-colors">
                    #{topic.name}
                  </span>
                  {topic.hot && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full gradient-gold text-accent-foreground font-semibold">
                      HOT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-muted-foreground">{topic.posts.toLocaleString()}</span>
                  <span className="text-[9px] font-mono text-success font-medium flex items-center">
                    <ArrowUpRight className="w-2.5 h-2.5" />{topic.trend}
                  </span>
                </div>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.pct}%` }}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.06, ease: "easeOut" }}
                  className={`h-full rounded-full ${topic.hot ? "gradient-gold" : "bg-muted-foreground/25"}`}
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
