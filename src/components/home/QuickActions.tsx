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
  colorClass: string;
  bgClass: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
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
      colorClass: "text-info",
      bgClass: "bg-info-muted",
      badge: "New",
      badgeVariant: "default"
    },
    {
      id: "discover",
      icon: Search,
      label: "Discover Research",
      description: "Find papers & researchers",
      path: "/discover",
      colorClass: "text-highlight",
      bgClass: "bg-highlight-muted"
    },
    {
      id: "collaborate",
      icon: Users,
      label: "Find Collaborators",
      description: "Connect with researchers",
      path: "/community",
      colorClass: "text-success",
      bgClass: "bg-success-muted",
      badge: "2 pending",
      badgeVariant: "secondary"
    },
    {
      id: "events",
      icon: Calendar,
      label: "Academic Events",
      description: "Conferences & workshops",
      path: "/events",
      colorClass: "text-warning",
      bgClass: "bg-warning-muted"
    },
    {
      id: "courses",
      icon: BookOpen,
      label: "Learning Hub",
      description: "Courses & tutorials",
      path: "/courses",
      colorClass: "text-info",
      bgClass: "bg-info-muted"
    },
    {
      id: "opportunities",
      icon: Award,
      label: "Opportunities",
      description: "Grants & positions",
      path: "/opportunities",
      colorClass: "text-accent",
      bgClass: "bg-gold-muted",
      badge: "Hot",
      badgeVariant: "destructive"
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
            className="p-3 rounded-lg border bg-card hover:bg-accent/10 transition-all duration-200 text-left group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded ${action.bgClass} group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-4 h-4 ${action.colorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{action.label}</p>
                {action.badge && (
                  <Badge variant={action.badgeVariant || "secondary"} className="text-xs mt-1">
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
                  <div className={`p-3 rounded-lg ${action.bgClass} group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className={`w-6 h-6 ${action.colorClass}`} />
                  </div>
                  {action.badge && (
                    <Badge variant={action.badgeVariant || "secondary"} className="text-xs">
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
