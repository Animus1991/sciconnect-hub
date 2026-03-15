import { motion } from "framer-motion";
import { BookOpen, Users, Award, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

const QuickStats = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: "Publications",
      value: user.stats.publications,
      display: String(user.stats.publications),
      icon: BookOpen,
      color: "text-gold",
      bar: "gradient-gold",
      pct: Math.min(100, (user.stats.publications / 30) * 100),
      trend: "+2 this month",
    },
    {
      label: "Followers",
      value: user.stats.followers,
      display: user.stats.followers > 999 ? `${(user.stats.followers / 1000).toFixed(1)}k` : String(user.stats.followers),
      icon: Users,
      color: "text-foreground",
      bar: "bg-foreground/60",
      pct: Math.min(100, (user.stats.followers / 2000) * 100),
      trend: "+34 this week",
    },
    {
      label: "h-index",
      value: user.stats.hIndex,
      display: String(user.stats.hIndex),
      icon: Award,
      color: "text-accent",
      bar: "bg-accent",
      pct: Math.min(100, (user.stats.hIndex / 25) * 100),
      trend: "+1 this year",
    },
    {
      label: "Citations",
      value: user.stats.citations,
      display: user.stats.citations > 999 ? `${(user.stats.citations / 1000).toFixed(1)}k` : String(user.stats.citations),
      icon: TrendingUp,
      color: "text-success",
      bar: "bg-success",
      pct: Math.min(100, (user.stats.citations / 3500) * 100),
      trend: "+342 this year",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-xl border border-border p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-foreground">Your Impact</h3>
        <Link to="/analytics" className="text-[10px] text-accent font-medium flex items-center gap-1 hover:underline">
          View all <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <stat.icon className={`w-3 h-3 ${stat.color}`} />
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground">{stat.trend}</span>
                <span className={`text-[13px] font-bold ${stat.color}`}>{stat.display}</span>
              </div>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.pct}%` }}
                transition={{ duration: 0.6, delay: 0.25 + i * 0.08, ease: "easeOut" }}
                className={`h-full rounded-full ${stat.bar}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickStats;
