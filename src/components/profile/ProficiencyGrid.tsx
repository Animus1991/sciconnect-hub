import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Code, Database, BrainCircuit, FlaskConical, BarChart2,
  BookOpen, Cpu, Microscope, Dna, Atom, Globe, Calculator
} from "lucide-react";

interface Skill {
  name: string;
  level: number;
  category: string;
  description?: string;
}

interface ProficiencyGridProps {
  skills?: Skill[];
  compact?: boolean;
}

const categoryIcons: Record<string, any> = {
  Programming: Code,
  Methods: BrainCircuit,
  Specialization: Cpu,
  Research: Microscope,
  Analysis: BarChart2,
  Database: Database,
  "Machine Learning": BrainCircuit,
  Biology: Dna,
  Chemistry: FlaskConical,
  Physics: Atom,
  Mathematics: Calculator,
  Languages: Globe,
  Tools: BookOpen,
};

const getSkillLevelLabel = (level: number) => {
  if (level >= 90) return "Expert";
  if (level >= 75) return "Advanced";
  if (level >= 60) return "Intermediate";
  if (level >= 40) return "Basic";
  return "Beginner";
};

const defaultSkills: Skill[] = [
  { name: "Python", level: 95, category: "Programming", description: "Data analysis, ML, scientific computing" },
  { name: "Machine Learning", level: 92, category: "Methods", description: "Deep learning, classical ML" },
  { name: "Deep Learning", level: 85, category: "Specialization", description: "Transformers, CNNs, RNNs" },
  { name: "R / Statistics", level: 88, category: "Programming", description: "Statistical analysis" },
  { name: "Bayesian Analysis", level: 78, category: "Methods", description: "MCMC, hierarchical models" },
  { name: "Transformer Architecture", level: 90, category: "Specialization", description: "Attention mechanisms" },
  { name: "NLP / LLMs", level: 88, category: "Specialization", description: "Language models, embeddings" },
  { name: "Quantum Computing", level: 65, category: "Research", description: "Qiskit, quantum algorithms" },
];

export function ProficiencyGrid({ skills = [], compact = false }: ProficiencyGridProps) {
  const skillsToDisplay = skills.length > 0 ? skills : defaultSkills;

  const skillsByCategory = skillsToDisplay.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (compact) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm text-foreground">Skills & Expertise</h3>
          <Badge variant="outline" className="text-[10px] font-display font-medium">
            {skillsToDisplay.length} skills
          </Badge>
        </div>
        <div className="space-y-4">
          {Object.entries(skillsByCategory).map(([category, categorySkills], ci) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-secondary/60 flex items-center justify-center">
                  {categoryIcons[category] && React.createElement(categoryIcons[category], { className: "w-3 h-3 text-muted-foreground" })}
                </div>
                <span className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider">{category}</span>
              </div>
              <div className="space-y-2">
                {categorySkills.map(skill => (
                  <div key={skill.name} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-display font-medium text-foreground">{skill.name}</span>
                      <span className="text-[10px] font-display text-muted-foreground">
                        {skill.level}% · {getSkillLevelLabel(skill.level)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 0.6, delay: ci * 0.05 }}
                        className={`h-full rounded-full ${
                          skill.level >= 90 ? "bg-accent" :
                          skill.level >= 75 ? "bg-primary" :
                          skill.level >= 60 ? "bg-muted-foreground/50" :
                          "bg-muted-foreground/30"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Full (non-compact) version
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-foreground">Skills & Expertise</h3>
        <Badge variant="outline" className="text-[10px] font-display">{skillsToDisplay.length} skills</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(skillsByCategory).map(([category, categorySkills], ci) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.08 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-secondary/60">
                {categoryIcons[category] && React.createElement(categoryIcons[category], { className: "w-4 h-4 text-muted-foreground" })}
              </div>
              <div>
                <span className="text-sm font-display font-semibold text-foreground">{category}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{categorySkills.length} skill{categorySkills.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="space-y-3">
              {categorySkills.map(skill => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-xs font-display font-medium text-foreground">{skill.name}</span>
                      {skill.description && (
                        <p className="text-[10px] text-muted-foreground">{skill.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-xs font-display font-medium tabular-nums">{skill.level}%</span>
                      <Badge variant="secondary" className="text-[9px] ml-1.5 px-1.5 py-0">
                        {getSkillLevelLabel(skill.level)}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 0.6, delay: ci * 0.08 }}
                      className={`h-full rounded-full ${
                        skill.level >= 90 ? "bg-accent" :
                        skill.level >= 75 ? "bg-primary" :
                        skill.level >= 60 ? "bg-muted-foreground/50" :
                        "bg-muted-foreground/30"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
