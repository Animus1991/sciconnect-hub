import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const topics = [
  { name: "CRISPR-Cas9", posts: 1284, trend: "+12%" },
  { name: "Large Language Models", posts: 2451, trend: "+34%" },
  { name: "Quantum Computing", posts: 891, trend: "+8%" },
  { name: "mRNA Vaccines", posts: 673, trend: "+5%" },
  { name: "Dark Matter", posts: 445, trend: "+3%" },
  { name: "Climate Modeling", posts: 1102, trend: "+15%" },
];

const TrendingTopics = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-xl border border-border p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-gold" />
        <h3 className="font-display font-semibold text-sm text-foreground">Trending in Science</h3>
      </div>
      <div className="space-y-3">
        {topics.map((topic, i) => (
          <div
            key={topic.name}
            className="flex items-center justify-between py-2 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
              <div>
                <p className="text-sm font-display font-medium text-foreground group-hover:text-accent transition-colors">
                  #{topic.name.replace(/\s+/g, "")}
                </p>
                <p className="text-[11px] text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-brand font-medium">{topic.trend}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrendingTopics;
