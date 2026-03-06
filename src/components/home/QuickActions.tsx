import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  FilePlus, 
  Search, 
  Users, 
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Zap,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  id: string;
  icon: any;
  label: string;
  description: string;
  path: string;
  color: string;
  bgColor: string;
  badge?: string;
  gradient?: string;
}

interface QuickActionsProps {
  isCompact?: boolean;
}

export function QuickActions({ isCompact = false }: QuickActionsProps) {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: "submit-paper",
      icon: FilePlus,
      label: "Submit Paper",
      description: "Share your research",
      path: "/publications",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      badge: "New"
    },
    {
      id: "discover",
      icon: Search,
      label: "Discover Research",
      description: "Find papers & researchers",
      path: "/discover",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      id: "collaborate",
      icon: Users,
      label: "Find Collaborators",
      description: "Connect with researchers",
      path: "/community",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      badge: "2 pending"
    },
    {
      id: "events",
      icon: Calendar,
      label: "Academic Events",
      description: "Conferences & workshops",
      path: "/events",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      id: "courses",
      icon: BookOpen,
      label: "Learning Hub",
      description: "Courses & tutorials",
      path: "/courses",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      id: "opportunities",
      icon: Award,
      label: "Opportunities",
      description: "Grants & positions",
      path: "/opportunities",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      badge: "Hot"
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    navigate(action.path);
  };

  if (isCompact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {quickActions.slice(0, 6).map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="p-3 rounded-lg border bg-card hover:bg-accent transition-all duration-200 text-left"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded ${action.bgColor}`}>
                <action.icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{action.label}</p>
                {action.badge && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {action.badge}
                  </Badge>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Badge variant="outline" className="text-xs">
          <Zap className="w-3 h-3 mr-1" />
          Get Started
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                  onClick={() => handleActionClick(action)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  {action.badge && (
                    <Badge variant={action.badge === "Hot" ? "destructive" : "secondary"} 
                           className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {action.description}
                  </p>
                  
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-primary hover:bg-transparent">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
