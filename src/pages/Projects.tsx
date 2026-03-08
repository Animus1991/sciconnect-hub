import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Plus, FlaskConical, Users, GitBranch, Calendar, MoreVertical, Search, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";

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
    funding: "NIH R01",
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
    funding: "NSF",
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
    funding: null,
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
    funding: "EU Horizon",
  },
];

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  planning: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-info/10 text-info border-info/20",
};

function ProjectsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <Skeleton className="h-7 w-8 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full mb-6 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Projects = () => {
  const [projectList, setProjectList] = useState(projects);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const updateProgress = useCallback((idx: number, delta: number) => {
    setProjectList(prev => prev.map((p, i) => {
      if (i !== idx) return p;
      const next = Math.min(100, Math.max(0, p.progress + delta));
      const status = next === 100 ? "completed" : next > 0 ? "active" : "planning";
      return { ...p, progress: next, status };
    }));
  }, []);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return projectList;
    const q = debouncedSearch.toLowerCase();
    return projectList.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [projectList, debouncedSearch]);

  if (isLoading) {
    return <AppLayout><ProjectsSkeleton /></AppLayout>;
  }

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

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Active",    value: projectList.filter(p => p.status === "active").length,    color: "text-success", bgClass: "bg-success-muted" },
            { label: "Planning",  value: projectList.filter(p => p.status === "planning").length,  color: "text-warning", bgClass: "bg-warning-muted" },
            { label: "Completed", value: projectList.filter(p => p.status === "completed").length, color: "text-info", bgClass: "bg-info-muted" },
            { label: "Total",     value: projectList.length,                                        color: "text-foreground", bgClass: "bg-secondary" },
          ].map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + idx * 0.05, duration: 0.3 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="card-interactive p-4 text-center"
            >
              <div className={`w-8 h-8 rounded-lg ${s.bgClass} flex items-center justify-center mx-auto mb-2`}>
                <FlaskConical className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs font-display font-medium text-foreground mt-0.5">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">projects</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border">
              <FlaskConical className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-display">No projects match your search</p>
            </div>
          ) : filtered.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="card-interactive p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] font-display capitalize ${statusStyles[project.status]}`}>
                    {project.status}
                  </Badge>
                  {project.funding && (
                    <Badge variant="outline" className="text-[10px] font-display text-gold border-gold/30 bg-gold-muted flex items-center gap-0.5">
                      <DollarSign className="w-2.5 h-2.5" />{project.funding}
                    </Badge>
                  )}
                </div>
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
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); updateProgress(projectList.indexOf(project), -10); }} className="w-5 h-5 rounded bg-secondary text-[10px] text-muted-foreground hover:text-foreground flex items-center justify-center">−</button>
                  <button onClick={(e) => { e.stopPropagation(); updateProgress(projectList.indexOf(project), 10); }} className="w-5 h-5 rounded bg-secondary text-[10px] text-muted-foreground hover:text-foreground flex items-center justify-center">+</button>
                </div>
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
