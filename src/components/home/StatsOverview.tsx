import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, FileText, Users, Database, BookOpen } from "lucide-react";
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
  isCompact = false 
}: StatsOverviewProps) {
  
  const stats = useMemo(() => [
    {
      title: "Papers",
      value: papersCount.toLocaleString(),
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      trend: growthRate,
      description: "Research papers"
    },
    {
      title: "Researchers", 
      value: researchersCount.toLocaleString(),
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      trend: 8.3,
      description: "Active researchers"
    },
    {
      title: "Datasets",
      value: datasetsCount.toLocaleString(),
      icon: Database,
      color: "text-purple-500", 
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      trend: 15.7,
      description: "Open datasets"
    }
  ], [papersCount, researchersCount, datasetsCount]);

  const TrendIcon = ({ trend }: { trend: number }) => {
    if (trend > 5) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (trend < -5) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-500" />;
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
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
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
          <Card className={`border-l-4 ${stat.borderColor} hover:shadow-md transition-all duration-200`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <TrendIcon trend={stat.trend} />
                    <span className={`text-sm font-medium ${
                      stat.trend > 5 ? 'text-emerald-500' : 
                      stat.trend < -5 ? 'text-red-500' : 'text-gray-500'
                    }`}>
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
