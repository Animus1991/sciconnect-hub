import { motion } from "framer-motion";
import { BookOpen, Users, Award, Eye } from "lucide-react";

const stats = [
  { label: "Publications", value: "24", icon: BookOpen, color: "text-gold" },
  { label: "Followers", value: "1.2k", icon: Users, color: "text-foreground" },
  { label: "h-index", value: "18", icon: Award, color: "text-gold" },
  { label: "Profile Views", value: "3.4k", icon: Eye, color: "text-emerald-brand" },
];

const QuickStats = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-xl border border-border p-5"
    >
      <h3 className="font-display font-semibold text-sm text-foreground mb-4">Your Impact</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50">
            <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
            <p className={`text-xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickStats;
