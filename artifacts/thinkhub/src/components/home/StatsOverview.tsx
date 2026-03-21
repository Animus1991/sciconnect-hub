import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, FileText, Users, Database } from "lucide-react";
import { motion } from "framer-motion";

interface StatsOverviewProps {
  papersCount?: number;
  researchersCount?: number;
  datasetsCount?: number;
  growthRate?: number;
  isCompact?: boolean;
}

export function StatsOverview({ 
  papersCount = 2847, 
  researchersCount = 892, 
  datasetsCount = 156,
  growthRate = 12.5,
  isCompact = true
}: StatsOverviewProps) {
  
  const stats = useMemo(() => [
    {
      title: "Papers",
      value: papersCount.toLocaleString(),
      icon: FileText,
      colorClass: "text-info",
      bgClass: "bg-info-muted",
      borderClass: "border-info/20",
      trend: growthRate,
      description: "Research papers"
    },
    {
      title: "Researchers", 
      value: researchersCount.toLocaleString(),
      icon: Users,
      colorClass: "text-success",
      bgClass: "bg-success-muted",
      borderClass: "border-success/20",
      trend: 8.3,
      description: "Active researchers"
    },
    {
      title: "Datasets",
      value: datasetsCount.toLocaleString(),
      icon: Database,
      colorClass: "text-highlight", 
      bgClass: "bg-highlight-muted",
      borderClass: "border-highlight/20",
      trend: 15.7,
      description: "Open datasets"
    }
  ], [papersCount, researchersCount, datasetsCount, growthRate]);

  const TrendIcon = ({ trend }: { trend: number }) => {
    if (trend > 5) return <TrendingUp className="w-3 h-3 text-success" />;
    if (trend < -5) return <TrendingDown className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-success';
    if (trend < -5) return 'text-destructive';
    return 'text-muted-foreground';
  };

  if (isCompact) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="relative text-center px-3 py-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm hover:border-accent/30 hover:shadow-sm transition-all duration-200 cursor-default group"
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-8 h-8 rounded-xl ${stat.bgClass} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.colorClass}`} />
                </div>
              </div>
              <div className="text-[22px] font-bold text-foreground tracking-tight leading-none mb-1">{stat.value}</div>
              <div className="text-[11px] text-muted-foreground font-medium tracking-wide">{stat.title}</div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className={`bg-card rounded-xl border-l-4 ${stat.borderClass} border border-border p-5 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${stat.bgClass} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.colorClass}`} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-muted-foreground leading-none mb-1">{stat.title}</p>
                <p className="text-[26px] font-bold text-foreground tracking-tight leading-none">{stat.value}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 mb-1">
                <TrendIcon trend={stat.trend} />
                <span className={`text-sm font-semibold ${getTrendColor(stat.trend)}`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{stat.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
