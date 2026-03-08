import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  isCompact = true // Default to compact for cleaner initial view
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
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center p-3 rounded-lg border bg-card/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center mb-1">
              <stat.icon className={`w-4 h-4 ${stat.colorClass}`} />
            </div>
            <div className="text-lg font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.title}</div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`border-l-4 ${stat.borderClass} hover:shadow-md transition-all duration-200`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgClass}`}>
                    <stat.icon className={`w-5 h-5 ${stat.colorClass}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <TrendIcon trend={stat.trend} />
                    <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                      {stat.trend > 0 ? '+' : ''}{stat.trend}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
