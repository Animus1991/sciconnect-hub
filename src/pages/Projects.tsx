import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Plus, FlaskConical, Users, GitBranch, Calendar, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    title: "Quantum-Classical Hybrid Neural Networks",
    description: "Developing hybrid quantum-classical architectures for drug discovery applications using variational quantum circuits.",
    status: "active",
    progress: 65,
    collaborators: 4,
    repos: 3,
    deadline: "Jun 2026",
    tags: ["Quantum ML", "Drug Discovery"],
  },
  {
    title: "Open Neuroscience Data Platform",
    description: "Building an open-source platform for sharing and analyzing large-scale neuroimaging datasets with standardized pipelines.",
    status: "active",
    progress: 40,
    collaborators: 8,
    repos: 5,
    deadline: "Dec 2026",
    tags: ["Neuroscience", "Open Source", "Data"],
  },
  {
    title: "Climate Model Ensemble Framework",
    description: "Creating a unified framework for running and comparing ensemble climate model predictions with uncertainty quantification.",
    status: "planning",
    progress: 15,
    collaborators: 2,
    repos: 1,
    deadline: "Sep 2026",
    tags: ["Climate", "Modeling"],
  },
  {
    title: "Reproducible ML Benchmarks",
    description: "Standardizing machine learning benchmarks with containerized environments and automated reproducibility checks.",
    status: "completed",
    progress: 100,
    collaborators: 6,
    repos: 4,
    deadline: "Jan 2026",
    tags: ["ML", "Reproducibility"],
  },
];

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  planning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const Projects = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Research Projects</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Organize and track collaborative research initiatives
              </p>
            </div>
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className={`text-[10px] font-display capitalize ${statusStyles[project.status]}`}>
                  {project.status}
                </Badge>
                <button className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-accent transition-colors">
                {project.title}
              </h3>
              <p className="text-xs text-muted-foreground font-display leading-relaxed mb-4">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] font-display">{tag}</Badge>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <Progress value={project.progress} className="h-1.5 flex-1" />
                <span className="text-[11px] text-muted-foreground font-display font-medium">{project.progress}%</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {project.collaborators}</span>
                <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> {project.repos} repos</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {project.deadline}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Projects;
