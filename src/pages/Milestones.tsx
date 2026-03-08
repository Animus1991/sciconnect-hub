import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Circle, Clock, Plus, Calendar, Users, ChevronRight, Flag, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";

const milestones = [
  {
    id: "m1",
    title: "Submit NIH R01 Grant Proposal",
    description: "Complete and submit the machine learning for drug discovery grant proposal including budget, specific aims, and preliminary data.",
    project: "Quantum-Classical Hybrid Neural Networks",
    dueDate: "Jun 30, 2026",
    daysLeft: 116,
    status: "in_progress" as const,
    progress: 65,
    tasks: { total: 8, completed: 5 },
    assignees: ["SC", "MC"],
    priority: "high" as const,
  },
  {
    id: "m2",
    title: "Complete Manuscript Draft",
    description: "Finish first draft of the transformer attention mechanisms paper including all figures and supplementary materials.",
    project: "Open Neuroscience Data Platform",
    dueDate: "Apr 15, 2026",
    daysLeft: 40,
    status: "in_progress" as const,
    progress: 80,
    tasks: { total: 6, completed: 5 },
    assignees: ["MC", "PS"],
    priority: "high" as const,
  },
  {
    id: "m3",
    title: "Dataset Collection Phase 1",
    description: "Collect and curate initial neuroimaging dataset from 3 partner institutions with standardized preprocessing.",
    project: "Open Neuroscience Data Platform",
    dueDate: "Mar 31, 2026",
    daysLeft: 25,
    status: "at_risk" as const,
    progress: 45,
    tasks: { total: 10, completed: 4 },
    assignees: ["EV", "YT", "JO"],
    priority: "critical" as const,
  },
  {
    id: "m4",
    title: "IRB Approval",
    description: "Obtain institutional review board approval for the multi-site clinical study protocol.",
    project: "Quantum-Classical Hybrid Neural Networks",
    dueDate: "Feb 28, 2026",
    daysLeft: -5,
    status: "completed" as const,
    progress: 100,
    tasks: { total: 4, completed: 4 },
    assignees: ["OH"],
    priority: "medium" as const,
  },
  {
    id: "m5",
    title: "Prototype v2.0 Release",
    description: "Release second version of the climate model ensemble framework with uncertainty quantification module.",
    project: "Climate Model Ensemble Framework",
    dueDate: "Sep 1, 2026",
    daysLeft: 179,
    status: "planned" as const,
    progress: 10,
    tasks: { total: 12, completed: 1 },
    assignees: ["EV"],
    priority: "medium" as const,
  },
];

const statusConfig = {
  planned:     { label: "Planned",     icon: Circle,       cls: "text-muted-foreground bg-secondary border-border" },
  in_progress: { label: "In Progress", icon: Clock,        cls: "text-info bg-info/10 border-info/30" },
  at_risk:     { label: "At Risk",     icon: Flag,         cls: "text-warning bg-warning/10 border-warning/30" },
  completed:   { label: "Completed",   icon: CheckCircle2, cls: "text-success bg-success/10 border-success/30" },
} as const;

const priorityConfig = {
  low:      { label: "Low",      cls: "text-muted-foreground" },
  medium:   { label: "Medium",   cls: "text-info" },
  high:     { label: "High",     cls: "text-warning" },
  critical: { label: "Critical", cls: "text-destructive" },
} as const;

const Milestones = () => {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter ? milestones.filter(m => m.status === filter) : milestones;
  const completedCount = milestones.filter(m => m.status === "completed").length;
  const atRiskCount = milestones.filter(m => m.status === "at_risk").length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Milestones</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Track research project milestones, deadlines, and deliverables
              </p>
            </div>
            <button onClick={() => toast.info("Milestone editor coming soon!")}
              className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> New Milestone
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: milestones.length, color: "text-foreground" },
            { label: "In Progress", value: milestones.filter(m => m.status === "in_progress").length, color: "text-info" },
            { label: "At Risk", value: atRiskCount, color: atRiskCount > 0 ? "text-warning" : "text-foreground" },
            { label: "Completed", value: completedCount, color: "text-emerald-brand" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4">
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs font-display font-medium text-foreground mt-0.5">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">milestones</p>
            </div>
          ))}
        </motion.div>

        {/* Status filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button onClick={() => setFilter(null)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${!filter ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
            All
          </button>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(filter === key ? null : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${
                filter === key ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}>
              <cfg.icon className="w-3 h-3" /> {cfg.label}
            </button>
          ))}
        </div>

        {/* Milestones list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-display">No milestones in this category</p>
            </div>
          ) : filtered.map((milestone, i) => {
            const sCfg = statusConfig[milestone.status];
            const StatusIcon = sCfg.icon;
            const pCfg = priorityConfig[milestone.priority];
            return (
              <motion.div key={milestone.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`bg-card rounded-xl border p-5 hover:shadow-scholarly transition-all cursor-pointer group ${
                  milestone.status === "at_risk" ? "border-amber-500/20" : milestone.status === "completed" ? "border-emerald-500/20" : "border-border hover:border-accent/30"
                }`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] font-display ${sCfg.cls}`}>
                        <StatusIcon className="w-2.5 h-2.5 mr-0.5" />{sCfg.label}
                      </Badge>
                      <span className={`text-[10px] font-display font-bold ${pCfg.cls}`}>{pCfg.label}</span>
                      <Badge variant="secondary" className="text-[10px] font-display">{milestone.project}</Badge>
                    </div>
                    <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                      {milestone.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-display leading-relaxed mb-3 line-clamp-2">{milestone.description}</p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 mb-3">
                      <Progress value={milestone.progress} className="h-1.5 flex-1" />
                      <span className="text-[11px] text-muted-foreground font-display font-medium">{milestone.progress}%</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {milestone.daysLeft < 0 ? (
                          <span className="text-emerald-400">Completed</span>
                        ) : milestone.daysLeft < 14 ? (
                          <span className="text-amber-400">{milestone.daysLeft}d left</span>
                        ) : (
                          <span>{milestone.dueDate}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {milestone.tasks.completed}/{milestone.tasks.total} tasks
                      </span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <div className="flex -space-x-1.5">
                          {milestone.assignees.map(a => (
                            <div key={a} className="w-5 h-5 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-[7px] font-bold border-2 border-card">{a}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Milestones;
