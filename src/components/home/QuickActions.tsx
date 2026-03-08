import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  FilePlus, 
  Search, 
  Users, 
  Calendar,
  BookOpen,
  Award,
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
      label: "Discover",
      description: "Find papers & researchers",
      path: "/discover",
      colorClass: "text-highlight",
      bgClass: "bg-highlight-muted"
    },
    {
      id: "collaborate",
      icon: Users,
      label: "Collaborators",
      description: "Connect with researchers",
      path: "/community",
      colorClass: "text-success",
      bgClass: "bg-success-muted",
      badge: "2",
      badgeVariant: "secondary"
    },
    {
      id: "events",
      icon: Calendar,
      label: "Events",
      description: "Conferences & workshops",
      path: "/events",
      colorClass: "text-warning",
      bgClass: "bg-warning-muted"
    },
    {
      id: "courses",
      icon: BookOpen,
      label: "Learning",
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="relative flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-accent/30 hover:shadow-sm transition-all duration-200 text-center group"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Badge */}
            {action.badge && (
              <Badge 
                variant={action.badgeVariant || "secondary"} 
                className="absolute -top-1.5 -right-1.5 text-[9px] px-1.5 py-0 h-4 min-w-[16px] shadow-sm"
              >
                {action.badge}
              </Badge>
            )}
            
            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg ${action.bgClass} flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <action.icon className={`w-4 h-4 ${action.colorClass}`} />
            </div>
            
            {/* Label */}
            <span className="text-[11px] font-medium text-foreground group-hover:text-accent transition-colors leading-tight">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Quick Actions</h2>
        <button className="text-[11px] text-accent font-medium flex items-center gap-1 hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="relative flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-accent/30 hover:shadow-md transition-all duration-200 text-left group"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -2 }}
          >
            {action.badge && (
              <Badge variant={action.badgeVariant || "secondary"} className="absolute top-3 right-3 text-[9px]">
                {action.badge}
              </Badge>
            )}
            
            <div className={`w-10 h-10 rounded-xl ${action.bgClass} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
              <action.icon className={`w-5 h-5 ${action.colorClass}`} />
            </div>
            
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors mb-0.5">
                {action.label}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {action.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
