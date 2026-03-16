import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  Award, 
  BookOpen, 
  Users, 
  TrendingUp,
  Calendar,
  Star
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "completed" | "in-progress" | "upcoming";
  category: "research" | "publication" | "collaboration" | "achievement";
  dueDate?: string;
  completedDate?: string;
  priority: "high" | "medium" | "low";
  icon?: any;
}

interface AcademicMilestonesProps {
  milestones?: Milestone[];
  compact?: boolean;
}

const categoryIcons: Record<string, any> = {
  "research": BookOpen,
  "publication": Award,
  "collaboration": Users,
  "achievement": Star
};

const categoryColors: Record<string, string> = {
  "research": "text-blue-500 bg-blue-500/10 border-blue-200",
  "publication": "text-emerald-500 bg-emerald-500/10 border-emerald-200", 
  "collaboration": "text-purple-500 bg-purple-500/10 border-purple-200",
  "achievement": "text-amber-500 bg-amber-500/10 border-amber-200"
};

const priorityColors: Record<string, string> = {
  "high": "border-l-red-500",
  "medium": "border-l-amber-500", 
  "low": "border-l-green-500"
};

export function AcademicMilestones({ milestones = [], compact = false }: AcademicMilestonesProps) {
  // Default milestones if none provided
  const defaultMilestones: Milestone[] = [
    {
      id: "m1",
      title: "Complete Literature Review",
      description: "Finish comprehensive review of transformer architectures",
      progress: 85,
      status: "in-progress",
      category: "research",
      dueDate: "2026-03-15",
      priority: "high",
      icon: BookOpen
    },
    {
      id: "m2", 
      title: "Submit Paper to Nature ML",
      description: "Submit manuscript on attention mechanism improvements",
      progress: 60,
      status: "in-progress",
      category: "publication",
      dueDate: "2026-04-01",
      priority: "high",
      icon: Award
    },
    {
      id: "m3",
      title: "Collaboration with MIT Lab",
      description: "Establish joint research project on quantum ML",
      progress: 30,
      status: "in-progress", 
      category: "collaboration",
      dueDate: "2026-05-01",
      priority: "medium",
      icon: Users
    },
    {
      id: "m4",
      title: "Peer Review Complete",
      description: "Complete 3 peer reviews for Q1 journals",
      progress: 100,
      status: "completed",
      category: "achievement",
      completedDate: "2026-02-28",
      priority: "medium",
      icon: Star
    },
    {
      id: "m5",
      title: "Conference Presentation",
      description: "Present findings at ICML 2026",
      progress: 0,
      status: "upcoming",
      category: "achievement", 
      dueDate: "2026-07-15",
      priority: "low",
      icon: Target
    }
  ];

  const milestonesToDisplay = milestones.length > 0 ? milestones : defaultMilestones;

  const getStatusIcon = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "upcoming":
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getProgressColor = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "in-progress":
        return "bg-blue-500";
      case "upcoming":
        return "bg-muted-foreground/30";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const completedCount = milestonesToDisplay.filter(m => m.status === "completed").length;
  const inProgressCount = milestonesToDisplay.filter(m => m.status === "in-progress").length;
  const upcomingCount = milestonesToDisplay.filter(m => m.status === "upcoming").length;

  if (compact) {
    return (
      <Card className="border-l-4 border-l-primary/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Academic Milestones
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{milestonesToDisplay.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {milestonesToDisplay.slice(0, 3).map((milestone) => (
            <div key={milestone.id} className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(milestone.status)}
                <span className="text-sm font-medium truncate">{milestone.title}</span>
              </div>
              <Progress 
                value={milestone.progress} 
                className="h-1.5"
                indicatorClassName={getProgressColor(milestone.status)}
              />
            </div>
          ))}
          {milestonesToDisplay.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{milestonesToDisplay.length - 3} more milestones
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Target className="w-5 h-5" />
          Academic Milestones
        </h3>
        <div className="flex gap-2">
          <Badge variant="default" className="text-xs bg-emerald-500">
            {completedCount} Complete
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {inProgressCount} In Progress
          </Badge>
          <Badge variant="outline" className="text-xs">
            {upcomingCount} Upcoming
          </Badge>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestonesToDisplay.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-l-4 ${priorityColors[milestone.priority]} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(milestone.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground truncate">
                          {milestone.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                      </div>
                      
                      {/* Category Badge */}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ml-2 flex-shrink-0 ${categoryColors[milestone.category]}`}
                      >
                        <milestone.icon className="w-3 h-3 mr-1" />
                        {milestone.category}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      <Progress 
                        value={milestone.progress} 
                        className="h-2"
                        indicatorClassName={getProgressColor(milestone.status)}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {milestone.status === "completed" && milestone.completedDate
                          ? `Completed ${formatDate(milestone.completedDate)}`
                          : milestone.dueDate
                          ? `Due ${formatDate(milestone.dueDate)}`
                          : "No deadline"
                        }
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="capitalize">{milestone.status.replace("-", " ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Overall Progress
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedCount / milestonesToDisplay.length) * 100)}% of milestones completed
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {completedCount}/{milestonesToDisplay.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
